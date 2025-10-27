// hooks/useTeams.ts
import { useEffect, useState, useCallback } from "react";
import type { RankedTeam } from "../../../types/types";
import { getTeamsUsingExistingAPI } from "../../../services/teams";

export function useTeams() {
  const [data, setData] = useState<RankedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isInitial = false, signal?: AbortSignal) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const teams = await getTeamsUsingExistingAPI(signal);
      setData(teams);
    } catch (e) {
      if ((e as any).name !== "AbortError") {
        setError(e instanceof Error ? e.message : "Kunde inte hämta team");
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(true, controller.signal);
    const id = setInterval(() => load(false, controller.signal), 30000);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [load]);

  const refetch = useCallback(() => {
    load(false);
  }, [load]);

  return { data, loading, error, refetch };
}
