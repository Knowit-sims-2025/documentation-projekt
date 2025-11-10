import { useEffect, useState, useCallback } from "react";
import type { RankedTeam } from "../types/team";
import { getTeamsUsingExistingAPI } from "../services/teams";

export function useTeams() {
  const [data, setData] = useState<RankedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = useCallback(async (signal?: AbortSignal) => {
    setError(null);
    try {
      const teams = await getTeamsUsingExistingAPI(signal);
      setData(teams ?? []); // Ensure data is always an array
    } catch (e) {
      if ((e as any).name !== "AbortError") {
        setError(e instanceof Error ? e.message : "Could not fetch teams");
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    loadTeams(controller.signal).finally(() => setLoading(false));

    const intervalId = setInterval(() => loadTeams(), 30000); // Re-fetch every 30s

    return () => {
      controller.abort();
      clearInterval(intervalId);
    };
  }, [loadTeams]);

  const refetch = useCallback(() => {
    setLoading(true);
    loadTeams().finally(() => setLoading(false));
  }, [loadTeams]);

  return { data, loading, error, refetch };
}