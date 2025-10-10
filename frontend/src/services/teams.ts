import type { Team, TeamWithDetails } from "../types/team";

export async function getTeams(
  signal?: AbortSignal
): Promise<TeamWithDetails[]> {
  const res = await fetch("/api/v1/teams", { signal });
  if (!res.ok) {
    throw new Error(`Kunde inte hämta team: ${res.status} ${res.statusText}`);
  }
  return res.json();
}