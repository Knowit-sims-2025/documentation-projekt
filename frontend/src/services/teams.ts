// src/services/teams.ts
import type { Team, RankedTeam } from "../types/team";
import type { User } from "../types/user";
import { normalizeUser } from "./users";
import { authFetch } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

// Rå-typ från backend
type RawTeam = Record<string, any>;

// Liten limiter så vi inte bombar backend med 50 parallella anrop
function createLimiter(max = 5) {
  let active = 0;
  const queue: Array<() => void> = [];
  const next = () => {
    active--;
    if (queue.length > 0) queue.shift()!();
  };
  return async function <T>(task: () => Promise<T>): Promise<T> {
    if (active >= max) {
      await new Promise<void>((res) => queue.push(res));
    }
    active++;
    try {
      return await task();
    } finally {
      next();
    }
  };
}

/** Normalisera ett team från /teams (utan medlemmar) */
function normalizeBareTeam(t: RawTeam): Omit<Team, "totalPoints" | "members"> {
  return {
    id: Number(t.id ?? t.ID),
    name: String(t.name ?? "Okänt team"),
    createdAt: String(t.createdAt ?? t.created_at ?? ""),
  };
}

/** Hämtar users (med poäng) för ett team via /teams/:id/points (skyddad) */
async function fetchTeamMembersWithPoints(
  teamId: number,
  signal?: AbortSignal
): Promise<User[]> {
  const res = await authFetch(`${API_BASE}/teams/${teamId}/points`, { signal });
  if (!res.ok)
    throw new Error(
      `Kunde inte hämta teamets poäng: ${res.status} ${res.statusText}`
    );
  const raw: any[] | null = await res.json();
  return (raw || []).map(normalizeUser);
}

/**
 * Bygger ut alla team med members + totalPoints med BEFINTLIGA endpoints:
 *   - GET /api/v1/teams
 *   - GET /api/v1/teams/:id/points
 */
export async function getTeamsUsingExistingAPI(
  signal?: AbortSignal
): Promise<RankedTeam[]> {
  const res = await authFetch(`${API_BASE}/teams`, { signal });
  if (!res.ok)
    throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);
  const rawTeams: RawTeam[] | null = await res.json();

  const bare = (rawTeams || []).map(normalizeBareTeam);

  const limit = createLimiter(5); // hämta 5 team åt gången
  const enriched = await Promise.all(
    bare.map((t) =>
      limit(async () => {
        const members = await fetchTeamMembersWithPoints(t.id, signal);
        const totalPoints = members.reduce((sum, u) => sum + (u.totalPoints ?? 0), 0);
        const team: Team = { ...t, members, totalPoints };
        return team;
      })
    )
  );

  // Sortera + ranka
  const sorted = enriched.sort((a, b) => b.totalPoints - a.totalPoints);
  return sorted.map((team, idx) => ({ ...team, rank: idx + 1 }));
}

/**
 * Gå med i ett team.
 * @param teamId ID för teamet att gå med i
 * @param userId ID för användaren som ska gå med i teamet
 */
export async function joinTeam(teamId: number, userId: number): Promise<void> {
  const res = await authFetch(`${API_BASE}/userteams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, team_id: teamId }),
  });
  if (!res.ok) {
    // Försök läsa felmeddelande från kroppen
    const body = await res.text();
    throw new Error(
      `Could not join team: ${res.status} ${res.statusText} - ${body}`
    );
  }
  // Returnerar inget vid success
}

/**
 * Skapa ett nytt team. (Antaget API)
 * @param name Namn på det nya teamet
 */
export async function createTeam(name: string): Promise<Team> {
  const res = await authFetch(`${API_BASE}/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Could not create team: ${res.status} ${res.statusText} - ${body}`
    );
  }
  const raw: RawTeam = await res.json();
  // Det nya teamet kommer troligen inte ha medlemmar eller poäng direkt
      return {
        ...normalizeBareTeam(raw),
        members: [],
        totalPoints: 0,
      };
    }
  
  /**
   * Lämna ett team.
   * @param teamId ID för teamet att lämna
   * @param userId ID för användaren som ska lämna teamet
   */
  export async function leaveTeam(teamId: number, userId: number): Promise<void> {
    const res = await authFetch(`${API_BASE}/userteams/user/${userId}/team/${teamId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Could not leave team: ${res.status} ${res.statusText} - ${body}`);
    }
  }
