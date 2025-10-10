import { useEffect, useState } from "react";
import type { User-badges } from "../types/user-badges";
import { getUser-badges } from "../services/user-badges";

// Hook för att hämta badges
export function useUserBadges() {
  const [data, setData] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const user_badges = await getUserBadges();
      setData(user_badges);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Okänt fel vid hämtning");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      await load();
    })();

    return () => { active = false };
  }, []);

  return { data, loading, error, refetch: load };
}