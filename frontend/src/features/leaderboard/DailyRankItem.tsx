import React from "react";
import { useAuth } from "../auth/AuthContext";
import { Avatar } from "../../components/ui/Avatar";

export function DailyRankItem({
  index,
  userId,
  displayName,
  avatarUrl,
  pointsToday,
  onSelect,
}: {
  index: number;
  userId: number;
  displayName: string;
  avatarUrl?: string | null;
  pointsToday: number;
  onSelect?: (userId: number) => void;
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

      <Avatar name={displayName} src={avatarUrl ?? undefined} />

      <span
        className="leaderboard__name"
        title="Click on username to view profile"
      >
        {isCurrentUser ? "You" : displayName}
      </span>

      <span className="leaderboard__points" title={`${displayName} poäng idag`}>
        {pointsToday} p
      </span>
    </li>
  );
}
