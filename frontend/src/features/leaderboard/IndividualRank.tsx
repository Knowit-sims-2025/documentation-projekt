import type { User } from "../../types/user";
import { Avatar } from "../../components/Avatar";
import { useAuth } from "../AuthContext";
import type { RankTier } from "../../types/user";

export function IndividualRank({ user }: { user: User }) {
  const { currentUser } = useAuth();
  const isCurrentUser = !!currentUser && currentUser.id === user.id;

  // console.log(
  //   "currentUser",
  //   currentUser,
  //   "row user",
  //   user,
  //   "isCurrentUser",
  //   isCurrentUser
  // );

  return (
    <li
      className={`leaderboard-item ${isCurrentUser ? "is-current-user" : ""}`}
    >
      <span
        className="leaderboard-rank"
        title={`${user.displayName} is rank ${user.rank}`}
      >
        {user.rank}.
      </span>

      <Avatar name={user.displayName} src={user.avatarUrl} />

      <span
        className="leaderboard-name"
        title="Click on username to view profile"
      >
        {isCurrentUser ? "You" : user.displayName}
      </span>

      <span className="leaderboard-admin" title="Admin">
        {user.isAdmin ? "⭐" : ""}
      </span>

      <span
        className="leaderboard-points"
        title={`${user.displayName}: ${user.totalPoints} poäng`}
      >
        {user.totalPoints} p
      </span>
    </li>
  );
}
