import { useEffect, useMemo, useRef, useState } from "react";

export interface DailyEntry {
  userId: number;
  displayName: string;
  avatarUrl?: string | null;
  totalPoints: number; // poäng för det givna datumet
}

function formatLocalDateYYYYMMDD(d = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalize(raw: any): DailyEntry {
  return {
    userId: Number(raw.userId ?? raw.user_id ?? raw.id),
    displayName: String(raw.displayName ?? raw.display_name ?? "Okänd"),
    avatarUrl: raw.avatarUrl ?? raw.avatar_url ?? null,
    totalPoints: Number(raw.totalPoints ?? raw.total_points ?? 0),
  };
}

async function fetchDaily(date: string, signal?: AbortSignal): Promise<DailyEntry[]> {
  const res = await fetch(`/api/v1/leaderboard?date=${encodeURIComponent(date)}`, { signal });
  if (!res.ok) throw new Error(`Kunde inte hämta leaderboard (${date}): ${res.status} ${res.statusText}`);
  const json = await res.json();
  return (Array.isArray(json) ? json : []).map(normalize);
}

export function useDailyLeaderboard(options?: { date?: string; refreshMs?: number }) {
  const { date = formatLocalDateYYYYMMDD(), refreshMs = 30000 } = options ?? {};
  const [data, setData] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const dateRef = useRef(date);
  dateRef.current = date;

  const sorted = useMemo(() => [...data].sort((a, b) => b.totalPoints - a.totalPoints), [data]);

  const load = async (isInitial = false, abort?: AbortSignal) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const list = await fetchDaily(dateRef.current, abort);
      setData(list);
      setUpdatedAt(new Date());
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message ?? "Kunde inte hämta dagens leaderboard");
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(true, controller.signal);
    const id = setInterval(() => load(false), refreshMs);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [date, refreshMs]);

  return { date, data: sorted, loading, error, updatedAt, refetch: () => load(false) };
}
