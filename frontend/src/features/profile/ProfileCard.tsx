import { Avatar } from "../../components/Avatar";
import type { User } from "../../types/user";
import ProgressBar from "../../components/progressbar/progressbar";
import { useBadges } from "../../hooks/useBadges";
import { sortBadgesByCompletion } from "../achivements/badgeUtils";
import { HexProgress } from "../achivements/hexProgress";
import {
  getNextRankThreshold,
  getNextRankTier,
  getPreviousRankThreshold,
} from "../../services/config/rank";
// This icon map is needed to render the badge icon.
// In a larger app, this could also be moved to a shared utility.
import documents0 from "../../assets/badges/documents0.svg";
import documents1 from "../../assets/badges/documents1.svg";
import documents2 from "../../assets/badges/documents2.svg";
import documents3 from "../../assets/badges/documents3.svg";
import comments0 from "../../assets/badges/comments0.svg";
import comments1 from "../../assets/badges/comments1.svg";
import comments2 from "../../assets/badges/comments2.svg";
import comments3 from "../../assets/badges/comments3.svg";
import edits0 from "../../assets/badges/edits0.svg";
import edits1 from "../../assets/badges/edits1.svg";
import edits2 from "../../assets/badges/edits2.svg";
import edits3 from "../../assets/badges/edits3.svg";

const iconMap: { [key: string]: string } = {
  documents0: documents0,
  documents1: documents1,
  documents2: documents2,
  documents3: documents3,
  comments0: comments0,
  comments1: comments1,
  comments2: comments2,
  comments3: comments3,
  edits0: edits0,
  edits1: edits1,
  edits2: edits2,
  edits3: edits3,
};

export function ProfileCard({ user }: { user: User }) {
  const { data: badges } = useBadges();

  const sortedBadges = badges ? sortBadgesByCompletion(badges, user) : [];
  // Find the first badge in the sorted list that is not yet 100% complete.
  const topBadge =
    sortedBadges.find((badge) => {
      const currentUserProgress = 5; // TODO: Replace with actual progress calculation
      const badgeCriteriaValue = badge.criteriaValue ?? 100;
      const progress =
        (badge.criteriaValue ?? 0) > 0
          ? currentUserProgress / badgeCriteriaValue
          : 0;
      return progress < 1;
    }) ?? (sortedBadges.length > 0 ? sortedBadges[0] : null); // Fallback to top badge if all are complete

  // Declare these variables here to make them accessible to the JSX below.
  let userProgressForBadge = 0;
  let topBadgeHexProgress = 0;

  if (topBadge) {
    // TODO: Replace this with your actual progress calculation logic
    userProgressForBadge = 5;
    const maxValue = topBadge.criteriaValue ?? 100;
    topBadgeHexProgress =
      maxValue > 0 ? Math.min(userProgressForBadge / maxValue, 1) : 0;
  }

  {
    console.log("ProfileCard avatarUrl:", JSON.stringify(user.avatarUrl));
  }

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
      </div>

      {/* NYTT: grupp som vi kan trycka till botten */}
      <div className="profile-progress">
        {topBadge && (
          <ProgressBar
            value={userProgressForBadge}
            max={topBadge.criteriaValue ?? 100}
            min={0}
            label={`Next badge: ${topBadge.name}`}
            src={topBadge.iconUrl ? iconMap[topBadge.iconUrl] : undefined}
          />
        )}
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
