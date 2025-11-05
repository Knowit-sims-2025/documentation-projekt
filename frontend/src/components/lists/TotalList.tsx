import React from "react";
import type { User } from "../../types/user";
import { IndividualRank } from "../../features/pages/leaderboard/IndividualRank";

export function TotalList({
  users,
  onSelect,
  onShowRankInfo,
}: {
  users: User[];
  onSelect: (u: User) => void;
  onShowRankInfo: () => void;
}) {
  return (
    <ul className="leaderboard__list">
      {users.map((user) => (
        <IndividualRank
          key={user.id}
          user={user}
          onSelect={onSelect}
          onShowRankInfo={onShowRankInfo}
        />
      ))}
    </ul>
  );
}
