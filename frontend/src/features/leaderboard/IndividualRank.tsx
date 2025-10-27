import type { User } from "../../types/types";
import { Avatar } from "../../components/ui/Avatar";
import { useAuth } from "../auth/AuthContext";

interface IndividualRankProps {
  user: User;
  onSelect: (user: User) => void;
}

export function IndividualRank({ user, onSelect }: IndividualRankProps) {
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
      className={`leaderboard__item ${isCurrentUser ? "is-current-user" : ""}`}
      onClick={() => onSelect(user)}
      title={`Visa profil för ${user.displayName}`}
    >
      <span
        className="leaderboard__rank"
        title={`${user.displayName} is rank ${user.rank}`}
      >
        {user.rank}.
      </span>

      <Avatar name={user.displayName} src={user.avatarUrl} />

      <span
        className="leaderboard__name"
        title="Click on username to view profile"
      >
        {isCurrentUser ? "You" : user.displayName}
      </span>

      {user.isAdmin && (
        <span
          className="leaderboard__admin"
          title="User is admin"
          aria-label="User is admin"
        />
      )}

      <span
        className="leaderboard__points"
        title={`${user.displayName} is rank: ${user.rankTier} `}
      >
        {user.totalPoints} p
      </span>
    </li>
  );
}
