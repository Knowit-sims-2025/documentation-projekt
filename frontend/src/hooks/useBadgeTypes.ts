import { useEffect, useState } from "react";
import type { BadgeType } from "../types/badgeType";
import { getBadgeTypes } from "../services/badgeTypes";

// Hook för att hämta badge-typer
export function useBadgeTypes() {
  const [data, setData] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const badgeTypes = await getBadgeTypes();
      setData(badgeTypes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Okänt fel vid hämtning av badge-typer");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, refetch: load };
}
