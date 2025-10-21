import { useState, useEffect, useCallback } from "react";
import type { UserBadge } from "../types/userBadge";
import { getUserBadgesByUserId } from "../services/userBadge";

export function useUserBadges(userId: number) {
  const [data, setData] = useState<UserBadge[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If userId is null or undefined, don't fetch.
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }

    async function fetchUserBadges() {
      try {
        setLoading(true);
        const userBadges = await getUserBadgesByUserId(userId);
        setData(userBadges ?? []);
      } catch (e: any) {
        setError(e.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchUserBadges();
  }, [userId]);

  // Create a stable mutate function to allow optimistic updates
  const mutate = useCallback((newData: UserBadge[]) => {
    setData(newData);
  }, []);

  return { data, loading, error, mutate };
}