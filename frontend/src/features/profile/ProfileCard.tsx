import { Avatar } from "../../components/Avatar";
import type { User } from "../../types/user";
import ProgressBar from "../../components/progressbar/progressbar";
import {
  getNextRankThreshold,
  getPreviousRankThreshold,
} from "../../services/config/rank";

export function ProfileCard({ user }: { user: User }) {
  return (
    <div className="profile-widget card">
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
        <ProgressBar
          value={user.totalPoints}
          max={getNextRankThreshold(user.totalPoints) ?? 1}
          min={getPreviousRankThreshold(user.totalPoints) ?? 1}
          label={`Next rank`}
        />
      </div>
    </div>
  );
}
