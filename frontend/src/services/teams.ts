import type { Team } from "../types/team";

/**
 * Hämtar alla team från API:et.
 *
 * Flöde:
 * 1. Anropar endpointen /api/v1/teams.
 * 2. Sorterar teamen alfabetiskt baserat på namn.
 *
 * @param signal - En AbortSignal för att kunna avbryta anropet.
 * @returns En Promise som resolverar till en lista av Team-objekt.
 */
export async function getTeams(signal?: AbortSignal): Promise<Team[]> {
  const res = await fetch("/api/v1/teams", { signal });
  if (!res.ok) {
    throw new Error(`Kunde inte hämta team: ${res.status} ${res.statusText}`);
  }
  const data: Team[] = await res.json();
  data.sort((a, b) => a.name.localeCompare(b.name));
  return data;
}