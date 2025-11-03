import { useState, useEffect } from "react";
import type { UserBadge } from "../types/userBadge";
import { getUserBadgesByUserId } from "../services/userBadge";

export function useUserBadges(userId: number) {
  const [data, setData] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchUserBadges() {
      try {
        setLoading(true);
        const userBadges = await getUserBadgesByUserId(userId);
        //debugging
        console.log("Fetched user badges:", userBadges);
        setData(userBadges);
      } catch (e: any) {
        setError(e.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchUserBadges();
  }, [userId]);

  return { data, loading, error };
}
