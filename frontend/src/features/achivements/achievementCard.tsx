import { useState } from "react";
import { useBadges } from "../../hooks/useBadges";
import { useUserBadges } from "../../hooks/useUserBadges";
import { ErrorMessage } from "../../components/ErrorMessage";
import type { Badge } from "../../types/badge";
import type { User } from "../../types/user";
import ProgressBar from "../../components/progressbar/progressbar";
import { Overlay } from "../pages/leaderboard/Overlay";
import type { UserBadge } from "../../types/userBadge";
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

// Create a mapping from the icon key (from the database) to the imported image asset.
const iconMap: { [key: string]: string } = {
  "documents0": documents0,
  "documents1": documents1,
  "documents2": documents2,
  "documents3": documents3,
  "comments0": comments0,
  "comments1": comments1,
  "comments2": comments2,
  "comments3": comments3,
  "edits0": edits0,
  "edits1": edits1,
  "edits2": edits2,
  "edits3": edits3,
};

interface AchievementCardProps {
  user: User;
}

const getUserProgressForBadge = (badgeId: number, userBadges: UserBadge[]): number => {
  const userBadge = userBadges.find(ub => ub.badgeId === badgeId);
  return userBadge?.progress ?? 0;
};

const sortBadges = (badges: Badge[], userBadges: UserBadge[]): Badge[] => {
  // Create a copy to avoid mutating the original array
  return [...badges].sort((a, b) => {
    const userProgressA = getUserProgressForBadge(a.id, userBadges);
    const userProgressB = getUserProgressForBadge(b.id, userBadges);
    const badgeCriteriaValueA = a.criteriaValue ?? 100;
    const badgeCriteriaValueB = b.criteriaValue ?? 100;

    const progressA = badgeCriteriaValueA > 0 ? userProgressA / badgeCriteriaValueA : 0;
    const progressB = badgeCriteriaValueB > 0 ? userProgressB / badgeCriteriaValueB : 0;

    // Sort descending (from most complete to least complete)
    return progressB - progressA;
  });
};

export default function AchievementCard({ user }: AchievementCardProps) {
  const { data: badges, loading: loadingBadges, error: errorBadges } = useBadges();
  const { data: userBadges, loading: loadingUserBadges, error: errorUserBadges } = useUserBadges(user.id);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  if (loadingBadges || loadingUserBadges) return <div>Laddar badges...</div>;
  if (errorBadges || errorUserBadges) return <ErrorMessage message={`Kunde inte hämta badges: ${errorBadges ?? errorUserBadges}`} />;

  const badgeList = sortBadges((badges ?? []), (userBadges ?? []));

  if(badgeList.length === 0) {
    return <ErrorMessage message="Inga badges hittades." />;
  }

  return (
    <>
      <div className="achievements-list">
        {badgeList.map((badge) => {
          const userProgress = getUserProgressForBadge(badge.id, userBadges);
          const maxValue = badge.criteriaValue ?? 100;
          const progressLabel = `${badge.name}`;

          return (
            <div
              className="achievement-item"
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedBadge(badge)}
            >
              <ProgressBar
                value={userProgress}
                max={maxValue}
                label={progressLabel}
                description={badge.description}
                src={badge.iconUrl ? iconMap[badge.iconUrl] : undefined}
              />
            </div>
          );
        })}
      </div>
      {selectedBadge && (
        (() => { // IIFE to calculate progress for selected badge
          const userProgress = getUserProgressForBadge(selectedBadge.id, userBadges);
          return (
        <Overlay
          onClose={() => setSelectedBadge(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <h2>{selectedBadge.name}</h2>
            <p>{selectedBadge.description}</p>
            <img src={selectedBadge.iconUrl ? iconMap[selectedBadge.iconUrl] : undefined} alt={selectedBadge.name} style={{ width: '100px', height: '100px' }} />
            <div style={{ width: '100%' }}>
              <ProgressBar
                value={userProgress}
                max={selectedBadge.criteriaValue ?? 100}
              />
            </div>
            <p>Progress: {userProgress} / {selectedBadge.criteriaValue ?? 100}</p>
          </div>
        </Overlay>
          );
        })()
      )}
    </>
  );
}
