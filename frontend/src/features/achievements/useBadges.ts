import { useEffect, useState } from "react";
import type { Badge } from "../../types/badge";
import { getBadges } from "../../services/badges";

// Hook för att hämta badges
export function useBadges() {
  const [data, setData] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const badges = await getBadges();
      setData(badges);
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