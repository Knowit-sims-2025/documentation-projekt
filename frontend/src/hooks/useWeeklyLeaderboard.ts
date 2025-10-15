import { useEffect, useMemo, useRef, useState } from "react";
import { fetchDailyLeaderboard } from "../services/leaderboard"; // du har redan denna
import { startOfISOWeek, endOfISOWeek, enumerateDates, clampEndToToday } from "../utils/week";
import { toLocalYYYYMMDD } from "../utils/date";

export interface WeeklyEntry {
  userId: number;
  displayName: string;
  avatarUrl?: string | null;
  totalPointsWeek: number;
}

// Begränsa parallella anrop
function createLimiter(max = 4) {
  let active = 0;
  const q: Array<() => void> = [];
  const next = () => { active--; q.shift()?.(); };
  return async <T,>(task: () => Promise<T>): Promise<T> => {
    if (active >= max) await new Promise<void>(res => q.push(res));
    active++;
    try { return await task(); } finally { next(); }
  };
}

/**
 * Weekly runt ett valt datum (YYYY-MM-DD).
 * - Vecka = ISO (mån–sön)
 * - Slutdatum klampas till idag om veckan inte är klar
 */
export function useWeeklyLeaderboard(options?: { date?: string; refreshMs?: number }) {
  const { date = toLocalYYYYMMDD(), refreshMs = 30000 } = options ?? {};
  const [data, setData] = useState<WeeklyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const dateRef = useRef(date);
  dateRef.current = date;

  const limit = useMemo(() => createLimiter(4), []);

  const load = async (isInitial = false, abort?: AbortSignal) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const day = new Date(dateRef.current);
      const weekStart = startOfISOWeek(day);
      const weekEndRaw = endOfISOWeek(day);
      const weekEnd = clampEndToToday(weekEndRaw);

      const days = enumerateDates(weekStart, weekEnd);

      // Hämta all daily parallellt
      const dailyLists = await Promise.all(days.map(d => limit(() => fetchDailyLeaderboard(d, abort))));

      // Summera per userId
      const map = new Map<number, WeeklyEntry>();
      for (const list of dailyLists) {
        for (const e of list) {
          const prev = map.get(e.userId);
          if (prev) prev.totalPointsWeek += e.totalPoints;
          else map.set(e.userId, {
            userId: e.userId,
            displayName: e.displayName,
            avatarUrl: e.avatarUrl,
            totalPointsWeek: e.totalPoints,
          });
        }
      }

      const merged = Array.from(map.values()).sort((a, b) => b.totalPointsWeek - a.totalPointsWeek);
      setData(merged);
      setUpdatedAt(new Date());
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message ?? "Kunde inte hämta veckans leaderboard");
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(true, controller.signal);
    const id = setInterval(() => load(false), refreshMs);
    return () => { controller.abort(); clearInterval(id); };
  }, [date, refreshMs]);

  // För UI: returnera även veckans start/slut som Date
  const weekRange = useMemo(() => {
    const d = new Date(date);
    const s = startOfISOWeek(d);
    const e = clampEndToToday(endOfISOWeek(d));
    return { start: s, end: e };
  }, [date]);

  return { date, data, loading, error, updatedAt, weekRange, refetch: () => load(false) };
}

export default useWeeklyLeaderboard;
