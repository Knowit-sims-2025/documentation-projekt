import { useEffect, useState } from "react";
import { getUserStats } from "../../services/userStats";
import type { UserStats } from "../../types/types";

/**
 * En custom hook för att hämta och hantera statistik för en specifik användare.
 * @param userId - ID för användaren vars statistik ska hämtas. Kan vara null.
 */
export function useUserStats(userId: number | null) {
  const [data, setData] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (id: number, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const stats = await getUserStats(id, signal);
      setData(stats);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(e?.message ?? "Kunde inte hämta användarstatistik");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId === null) {
      setData(null); // Rensa data om inget userId är valt
      return;
    }

    const controller = new AbortController();
    load(userId, controller.signal);

    return () => controller.abort();
  }, [userId]); // Körs om när userId ändras

  return { data, loading, error, refetch: () => userId !== null && load(userId) };
}