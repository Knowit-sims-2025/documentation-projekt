import type { Team, RankedTeam } from "../types/team";
import type { User } from "../types/user";
import { normalizeUser } from "./users";

type RawTeam = Record<string, any>;
type RawUser = Record<string, any>;

function normalizeBareTeam(t: RawTeam): Omit<Team, "totalPoints" | "members"> {
  return {
    id: Number(t.id ?? t.ID),
    name: String(t.name ?? "Okänt team"),
    createdAt: String(t.createdAt ?? t.created_at ?? new Date(0).toISOString()),
  };
}

/** Alltid tillbaka User[] (även om backend skickar konstig form) */
async function fetchTeamMembersWithPoints(teamId: number, signal?: AbortSignal): Promise<User[]> {
  const res = await fetch(`/api/v1/teams/${teamId}/points`, { signal });
  if (!res.ok) throw new Error(`Kunde inte hämta teamets poäng: ${res.status} ${res.statusText}`);

  const json = await res.json();
  const rawList: RawUser[] = Array.isArray(json) ? json : (json?.users ?? []);
  return rawList.map(normalizeUser);
}

export async function getTeamsUsingExistingAPI(signal?: AbortSignal): Promise<RankedTeam[]> {
  const res = await fetch("/api/v1/teams", { signal });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const rawTeams: RawTeam[] = await res.json();

  const bare = rawTeams.map(normalizeBareTeam);

  // Hämta medlemmar, räkna poäng
  const enriched: Team[] = await Promise.all(
    bare.map(async (t) => {
      const members = await fetchTeamMembersWithPoints(t.id, signal).catch(() => [] as User[]);
      const totalPoints = members.reduce((sum, u) => sum + (u.totalPoints ?? 0), 0);
      return { ...t, members, totalPoints };
    })
  );

  // Sortera & ranka
  return enriched
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((team, idx) => ({ ...team, rank: idx + 1 }));
}
