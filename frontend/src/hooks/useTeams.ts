import { useEffect, useState } from "react";
import type { Team } from "../types/team";
import { getTeams } from "../services/teams";

export function useTeams() {
  const [data, setData] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    const loadTeams = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const teams = await getTeams(ac.signal);
        setData(teams);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError(e instanceof Error ? e.message : "Okänt fel vid hämtning");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
    return () => ac.abort();
  }, []);

  return { data, isLoading, error };
}