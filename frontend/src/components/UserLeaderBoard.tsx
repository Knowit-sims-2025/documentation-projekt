// src/features/leaderboard/SimpleUserList.tsx
import React from "react";
import { useUsers } from "../hooks/useUsers";
import { Loading } from "./Loading";
import { ErrorMessage } from "./ErrorMessage";
import { IndividualRank } from "../features/leaderboard/IndividualRank";

export default function UserLeaderBoard() {
  const { data: users, loading, error } = useUsers();

  if (loading) return <Loading text="Laddar användare..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="leaderboard-container">
      <h2>Individual ranking</h2>
      <ul className="leaderboard-list">
        {users.map((user) => (
          <IndividualRank key={user.id} user={user} />
        ))}
      </ul>
    </div>
  );
}
