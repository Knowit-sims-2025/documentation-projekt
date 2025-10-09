import { Avatar } from "../../components/Avatar";
import type { User } from "../../types/user";
import ProgressBar from "../../components/progressbar/progressbar";
import { getNextRankThreshold, getPreviousRankThreshold } from "../../services/config/rank";

export function ProfileCard({ user }: { user: User }) {
  return (
    <>
      <div className="profile-cover">
        <div className="profile-avatar-bg">
          <Avatar name={user.displayName} src={user.avatarUrl} />
        </div>
      </div>
      <div className="profile-info">
        <h2 className="profile-name">{user.displayName}
        {user.isAdmin && <span className="profile-admin" title="Admin">⭐</span>}</h2>
      <ProgressBar value={user.totalPoints} max={getNextRankThreshold(user.totalPoints) ?? 1} min={getPreviousRankThreshold(user.totalPoints) ?? 1} label={`Next rank`} src={'C:\SIMS_project\documentation-projekt\frontend\src\assets\react.svg'}/>
      </div>
    </>
  );
}