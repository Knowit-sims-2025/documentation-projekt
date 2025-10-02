import type { User } from "../../types/user";
import { Avatar } from "../../components/Avatar";

export function IndividualRank({ user }: { user: User }) {
  return (
    <li className="leaderboard-item">
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
        {user.displayName}
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
