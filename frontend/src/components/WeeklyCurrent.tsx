// components/WeeklyCurrent.tsx
import React, { useMemo, useState } from "react";
import { useWeeklyLeaderboard } from "../hooks/useWeeklyLeaderboard";
import { WeeklyControlsWeek } from "./WeeklyControls";
import { WeeklyList } from "./lists/WeeklyList";
import { Loading } from "./Loading";
import { ErrorMessage } from "./ErrorMessage";
import { toLocalYYYYMMDD } from "../utils/date";
import { getISOWeekNumber } from "../utils/week";
import { dateToISOWeekString } from "../utils/week";

// Lägg gärna till en enkel formatterare för Date → YYYY-MM-DD lokalt:
const fmtYYYYMMDD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

interface WeeklyCurrentProps {
  onSelectUserId?: (id: number) => void;
}

export default function WeeklyCurrent({ onSelectUserId }: WeeklyCurrentProps) {
  const today = toLocalYYYYMMDD();

  // starta på måndagen denna vecka
  const [mondayYmd, setMondayYmd] = useState(() => {
    const d = new Date();
    const day = (d.getDay() + 6) % 7; // 0=Mon..6=Sun
    d.setDate(d.getDate() - day);
    return toLocalYYYYMMDD(d);
  });

  const { data, loading, error, updatedAt, weekRange, refetch } =
    useWeeklyLeaderboard({ date: mondayYmd });

  const rangeLabel = useMemo(() => {
    if (!weekRange) return "—";
    const start = weekRange.start; // Date
    const end = weekRange.end; // Date
    const iso = getISOWeekNumber(start);
    return `v. ${iso} · ${fmtYYYYMMDD(start)} — ${fmtYYYYMMDD(end)}`;
  }, [weekRange]);

  return (
    <div className="leaderboard">
      <WeeklyControlsWeek
        monday={mondayYmd}
        updatedAt={updatedAt}
        onRefresh={() => {
          void refetch();
        }}
        onChange={(nextMonday) => {
          if (nextMonday > today) return; // spärr mot framtid i kalendern
          setMondayYmd(nextMonday);
        }}
        maxWeek={dateToISOWeekString(today)}
      />

      {loading ? (
        <Loading text="Laddar veckans leaderboard..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <WeeklyList data={data} onSelectUserId={onSelectUserId} />
      )}
    </div>
  );
}
