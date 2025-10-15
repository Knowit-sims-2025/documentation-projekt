import React from "react";
import { DailyRankItem } from "../../features/pages/leaderboard/DailyRankItem";

export interface DailyEntry {
  userId: number;
  displayName: string;
  avatarUrl?: string | null;
  totalPoints: number;
}

export function DailyList({
  data,
  onSelectUserId,
}: {
  data: DailyEntry[];
  onSelectUserId?: (id: number) => void;
}) {
  if (data.length === 0) {
    return (
      <div className="leaderboard__placeholder">
        <p>Inga poäng registrerade den här dagen.</p>
      </div>
    );
  }

  return (
    <ul className="leaderboard__list">
      {data.map((u, i) => (
        <DailyRankItem
          key={u.userId}
          index={i}
          userId={u.userId}
          displayName={u.displayName}
          avatarUrl={u.avatarUrl}
          pointsToday={u.totalPoints}
          onSelect={onSelectUserId}
        />
      ))}
    </ul>
  );
}
