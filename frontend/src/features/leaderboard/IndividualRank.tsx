import type { User } from "../../types/user";
import { Avatar } from "../../components/Avatar";

export function IndividualRank({ user }: { user: User }) {
  return (
    <li className="leaderboard-item">
      <span className="leaderboard-rank">{user.rank}.</span>
      <Avatar name={user.displayName} src={user.avatarUrl} />
      <span className="leaderboard-name">{user.displayName}</span>
      <span className="leaderboard-admin">{user.isAdmin ? "⭐" : ""}</span>
      <span className="leaderboard-points">{user.totalPoints} p</span>
    </li>
  );
}
