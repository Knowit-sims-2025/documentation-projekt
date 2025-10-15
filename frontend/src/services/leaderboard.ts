// src/services/leaderboard.ts
import type { LeaderboardEntry } from "../types/leaderboard";
import { authFetch } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

// Hjälpare: YYYY-MM-DD i LOKAL tid (så “idag” blir rätt i Sverige).
export function formatLocalDateYYYYMMDD(d = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Normalisera snake_case -> camelCase (om backend redan skickar camelCase behövs knappt detta)
function normalizeEntry(raw: any): LeaderboardEntry {
  return {
    userId: Number(raw.userId ?? raw.user_id ?? raw.id),
    displayName: String(raw.displayName ?? raw.display_name ?? "Okänd"),
    avatarUrl: raw.avatarUrl ?? raw.avatar_url ?? null,
    totalPoints: Number(raw.totalPoints ?? raw.total_points ?? 0),
  };
}

// Bygg URL beroende på API-stil (vi kör query-varianten här)
function buildUrl(date: string): string {
  return `${API_BASE}/leaderboard?date=${encodeURIComponent(date)}`;
}

/**
 * Hämtar leaderboard för ett visst datum (default: idag, lokal tid).
 * Går via authFetch (kräver JWT).
 */
export async function fetchDailyLeaderboard(date?: string, signal?: AbortSignal): Promise<LeaderboardEntry[]> {
  const day = date ?? formatLocalDateYYYYMMDD();
  const res = await authFetch(buildUrl(day), { signal });
  if (!res.ok) {
    throw new Error(`Kunde inte hämta leaderboard för ${day}: ${res.status} ${res.statusText}`);
  }
  const raw = await res.json();
  const list = Array.isArray(raw) ? raw : [];
  return list.map(normalizeEntry);
}
