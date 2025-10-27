import React from "react";
import type { User } from "../../../types/types";
import { IndividualRank } from "../IndividualRank";

export function TotalList({
  users,
  onSelect,
}: {
  users: User[];
  onSelect: (u: User) => void;
}) {
  return (
    <ul className="leaderboard__list">
      {users.map((user) => (
        <IndividualRank key={user.id} user={user} onSelect={onSelect} />
      ))}
    </ul>
  );
}
