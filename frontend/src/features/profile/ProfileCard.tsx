// import { Avatar } from "../../components/Avatar";
import Avatar from "../../components/Avatar";
import { useAuth } from "../auth/AuthContext";
import type { User } from "../../types/user";
import ProgressBar from "../../components/progressbar/progressbar";
import { useUserStats } from "../../hooks/useUserStats";
import { UserLifeTimeStats } from "./UserLifeTimeStats";
import {
  getNextRankThreshold,
  getNextRankTier,
  getPreviousRankThreshold,
} from "../../services/config/rank";

export function ProfileCard({ user }: { user: User }) {
  const { data: stats, loading: loadingStats } = useUserStats(user.id);
  const { allUsers } = useAuth();

  // Hitta användarens globala rankning.
  // Vi sorterar alla användare efter poäng och hittar indexet för den aktuella användaren.
  // findIndex returnerar -1 om användaren inte hittas, så vi lägger till 1 för att få rank 1, 2, 3...
  // Om användaren inte hittas (vilket inte borde hända), visas inget.
  const userRank =
    allUsers
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .findIndex((u) => u.id === user.id) + 1;

  return (
    <div className="profile-widget">
      <div className="profile-cover">
        <div className="profile-avatar-wrapper">
          <Avatar name={user.displayName} src={user.avatarUrl} />
        </div>
      </div>

      <div className="profile-info">
        <h2 className="profile-name">
          {user.displayName}
          {user.isAdmin && (
            <span
              className="leaderboard__admin"
              title="User is admin"
              aria-label="User is admin"
            />
          )}
        </h2>
      </div>

      {stats && !loadingStats && <UserLifeTimeStats stats={stats} />}

      <div className="profile-progress">
        <ProgressBar
          value={user.totalPoints}
          max={getNextRankThreshold(user.totalPoints) ?? 1}
          min={getPreviousRankThreshold(user.totalPoints) ?? 1}
          label={`Next rank: ${getNextRankTier(user.totalPoints)}`}
        />
      </div>
    </div>
  );
}
