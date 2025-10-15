import { useState } from "react";
import { useBadges } from "../../hooks/useBadges";
import { ErrorMessage } from "../../components/ErrorMessage";
import type { Badge } from "../../types/badge";
import { HexProgress } from "./hexProgress";
import type { User } from "../../types/user";
import ProgressBar from "../../components/progressbar/progressbar";
import { Overlay } from "../pages/leaderboard/Overlay";
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

const sortBadges = (badges: Badge[], user: User): Badge[] => {
  // Create a copy to avoid mutating the original array
  return [...badges].sort((a, b) => {
    // TODO: Replace this with your actual progress calculation logic
    const userProgressA = 5; // Example: calculateUserProgress(a, user);
    const userProgressB = 5; // Example: calculateUserProgress(b, user);
    const badgeCriteriaValueA = a.criteriaValue ?? 100;
    const badgeCriteriaValueB = b.criteriaValue ?? 100;

    const progressA = (a.criteriaValue ?? 0) > 0 ? userProgressA / badgeCriteriaValueA : 0;
    const progressB = (b.criteriaValue ?? 0) > 0 ? userProgressB / badgeCriteriaValueB : 0;

    // Sort descending (from most complete to least complete)
    return progressB - progressA;
  });
};

export default function AchievementCard({ user }: AchievementCardProps) {
  const { data: badges, loading, error } = useBadges();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  if (loading) return <div>Laddar badges...</div>;
  if (error) return <ErrorMessage message={`Kunde inte hämta badges: ${error}`} />;

  const badgeList = sortBadges((badges ?? []) as Badge[], user);

  // Split badges into alternating rows: 3 / 2 / 3 / 2
  // or 2/3/2/3... depending on odd/even number of badges.
  const rows: Badge[][] = [];
  let i = 0;
  if(badgeList.length % 2 === 1) {
  while (i < badgeList.length) {
      const rowCount = rows.length % 2 === 0 ? 3 : 2;
      rows.push(badgeList.slice(i, i + rowCount));
      i += rowCount;
    }
  }
  else {
  while (i < badgeList.length) {
      const rowCount = rows.length % 2 === 0 ? 2 : 3;
      rows.push(badgeList.slice(i, i + rowCount));
      i += rowCount;
    }
  }

  if(badgeList.length === 0) {
    return <ErrorMessage message="Inga badges hittades." />;
  }

  return (
    <>
      <div className="hex-grid">
        {rows.map((row, rowIndex) => (
          <div
            className={`hex-row ${rowIndex % 2 === 1 ? "offset" : ""}`}
            key={rowIndex}
          >
            {row.map((badge) => {
              // TODO: Replace this with your actual progress calculation logic
              const userProgress = 5; // Example: calculateUserProgress(badge, user);
              const maxValue = badge.criteriaValue ?? 100;
              const progress =
                maxValue > 0 ? Math.min(userProgress / maxValue, 1) : 0;
              const progress_label = `${userProgress} / ${maxValue}`;

              return (
                <div
                  className="achievement-item"
                  key={badge.id ?? Math.random()}
                  onClick={() => setSelectedBadge(badge)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedBadge(badge)}
                >
                  <HexProgress
                    progress={progress}
                    label={progress_label}
                    src={badge.iconUrl ? iconMap[badge.iconUrl] : undefined}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {selectedBadge && (
        <Overlay
          onClose={() => setSelectedBadge(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <h2>{selectedBadge.name}</h2>
            <p>{selectedBadge.description}</p>
            <img src={selectedBadge.iconUrl ? iconMap[selectedBadge.iconUrl] : undefined} alt={selectedBadge.name} style={{ width: '100px', height: '100px' }} />
            <div style={{ width: '100%' }}>
              <ProgressBar
                value={5} // TODO: Replace with actual progress
                max={selectedBadge.criteriaValue ?? 100}
              />
            </div>
            <p>Progress: 5 / {selectedBadge.criteriaValue ?? 100}</p>
          </div>
        </Overlay>
      )}
    </>
  );
}
