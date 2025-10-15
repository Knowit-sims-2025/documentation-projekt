// components/lists/WeeklyList.tsx
import React from "react";
import { useAuth } from "../../features/auth/AuthContext"; // anpassa path om din AuthContext ligger annorstädes
import { Avatar } from "../../components/Avatar"; // global komponent
import type { WeeklyEntry } from "../../hooks/useWeeklyLeaderboard";

export function WeeklyList({
  data,
  onSelectUserId,
}: {
  data: WeeklyEntry[];
  onSelectUserId?: (id: number) => void;
}) {
  if (data.length === 0) {
    return (
      <div className="leaderboard__placeholder">
        <p>Inga poäng registrerade den veckan.</p>
      </div>
    );
  }

  return (
    <ul className="leaderboard__list">
      {data.map((u, i) => (
        <WeeklyRow
          key={u.userId}
          index={i}
          userId={u.userId}
          displayName={u.displayName}
          avatarUrl={u.avatarUrl ?? undefined}
          pointsWeek={u.totalPointsWeek}
          onSelect={onSelectUserId}
        />
      ))}
    </ul>
  );
}

function WeeklyRow({
  index,
  userId,
  displayName,
  avatarUrl,
  pointsWeek,
  onSelect,
}: {
  index: number;
  userId: number;
  displayName: string;
  avatarUrl?: string;
  pointsWeek: number;
  onSelect?: (id: number) => void;
}) {
  const { currentUser } = useAuth();
  const isCurrentUser = !!currentUser && currentUser.id === userId;

  return (
    <li
      className={`leaderboard__item ${isCurrentUser ? "is-current-user" : ""}`}
      onClick={() => onSelect?.(userId)}
      title={`Visa profil för ${displayName}`}
    >
      <span
        className="leaderboard__rank"
        title={`${displayName} rank ${index + 1}`}
      >
        {index + 1}.
      </span>

      <Avatar name={displayName} src={avatarUrl} />

      <span
        className="leaderboard__name"
        title="Click on username to view profile"
      >
        {isCurrentUser ? "You" : displayName}
      </span>

      <span
        className="leaderboard__points"
        title={`${displayName} poäng denna vecka`}
      >
        {pointsWeek} p
      </span>
    </li>
  );
}
