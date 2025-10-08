import { Avatar } from "../../components/Avatar";
import type { User } from "../../types/user";

export function ProfileCard({ user }: { user: User }) {
  return (
    <>
      <div className="profile-cover">
        <div className="profile-avatar-bg">
          <Avatar name={user.displayName} src={user.avatarUrl} />
        </div>
      </div>
      <div className="profile-info">
        <h2 className="profile-name">{user.displayName}</h2>
        {user.isAdmin && <span className="profile-admin" title="Admin">⭐ Admin</span>}
      </div>
    </>
  );
}