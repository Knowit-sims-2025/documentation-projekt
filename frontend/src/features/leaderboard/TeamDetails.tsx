import { useMemo } from "react";
import type { Team, RankedTeam, User } from "../../types/types";
import { Avatar } from "../../components/ui/Avatar";
import { useAuth } from "../auth/AuthContext";

type TeamLike = Pick<Team | RankedTeam, "id" | "name" | "members">;

interface TeamDetailsProps {
  team: TeamLike;
  /** Valfritt: skicka med om du vill öppna user-overlay vid klick */
  onSelectUser?: (user: User) => void;
}

export function TeamDetails({ team, onSelectUser }: TeamDetailsProps) {
  const { currentUser } = useAuth();

  // Sortera efter poäng och fyll i rank om den saknas
  const members = useMemo(() => {
    const sorted = [...team.members].sort(
      (a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0)
    );
    return sorted.map((u, i) => ({ ...u, rank: u.rank ?? i + 1 }));
  }, [team.members]);

  if (members.length === 0) {
    return (
      <div className="team-details team-details--empty">
        <p>Detta team har inga medlemmar än.</p>
      </div>
    );
  }

  return (
    <div className="team-details">
      <ul className="leaderboard__list">
        {members.map((user) => {
          const isCurrentUser = currentUser?.id === user.id;
          return (
            <li
              key={user.id}
              className={`leaderboard__item ${
                isCurrentUser ? "is-current-user" : ""
              }`}
              onClick={onSelectUser ? () => onSelectUser(user) : undefined}
              style={onSelectUser ? { cursor: "pointer" } : undefined}
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
                title={
                  user.rankTier
                    ? `${user.displayName} is rank: ${user.rankTier}`
                    : undefined
                }
              >
                {user.totalPoints.toLocaleString("sv-SE")} p
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
