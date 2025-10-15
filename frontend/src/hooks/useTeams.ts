// hooks/useTeams.ts
import { useEffect, useState } from "react";
import type { RankedTeam } from "../types/team";
import { getTeamsUsingExistingAPI } from "../services/teams";

export function useTeams() {
  const [data, setData] = useState<RankedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      setError(null);
      try {
        const teams = await getTeamsUsingExistingAPI(controller.signal);
        setData(teams);
      } catch (e) {
        if ((e as any).name !== "AbortError") {
          setError(e instanceof Error ? e.message : "Kunde inte hämta team");
        }
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    load(true);
    const id = setInterval(() => load(false), 30000);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, []);

  return { data, loading, error };
}
