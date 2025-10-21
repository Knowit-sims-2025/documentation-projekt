import { useState } from "react";
import { useBadges } from "../../hooks/useBadges";
import { useUserBadges } from "../../hooks/useUserBadges";
import { ErrorMessage } from "../../components/ErrorMessage";
import { updateUserBadgeStatus } from "../../services/userBadge";
import type { Badge } from "../../types/badge";
import type { User } from "../../types/user";
import ProgressBar from "../../components/progressbar/progressbar";
import { Overlay } from "../pages/leaderboard/Overlay";
import { groupBadgesByType, getNextBadge, getUserBadgeForBadge, sortBadgesByCompletion } from "./badgeUtils";
import { useBadgeTypes } from "../../hooks/useBadgeTypes";
import Switch from "../../components/switch";
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

export default function AchievementCard({ user }: AchievementCardProps) {
  const { data: badges, loading: loadingBadges, error: errorBadges } = useBadges();
  const { data: userBadges, loading: loadingUserBadges, error: errorUserBadges, mutate } = useUserBadges(user.id);
  const { data: badgeTypes, loading: loadingBadgeTypes, error: errorBadgeTypes } = useBadgeTypes();
  const [showAll, setShowAll] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Optimistic Update for claiming a badge
  const handleClaimBadge = async (badgeId: number) => {
    if (!userBadges) return; // Should not happen if button is visible

    // Find the badge we are about to claim
    const badgeToClaim = userBadges.find(ub => ub.badgeId === badgeId);
    if (!badgeToClaim) return;

    // 1. Create the "optimistic" new state
    const optimisticBadges = userBadges.map(ub => 
      ub.badgeId === badgeId ? { ...ub, claimStatus: 'claimed' as const } : ub
    );
    mutate(optimisticBadges);

    try {
      // 3. Send the actual request to the server
      await updateUserBadgeStatus(user.id, badgeId, 'claimed');
    } catch (error) {
      console.error("Failed to claim badge:", error);
      // 4. If the request fails, roll back to the original state
      mutate(userBadges); // Revert to the original data
    }
  };

  if (loadingBadges || loadingUserBadges || loadingBadgeTypes) return <div>Laddar badges...</div>;
  if (errorBadges || errorUserBadges || errorBadgeTypes) return <ErrorMessage message={`Kunde inte hämta badges: ${errorBadges ?? errorUserBadges ?? errorBadgeTypes}`} />;

  const renderBadge = (badge: Badge) => {
    const userBadge = getUserBadgeForBadge(badge.id, userBadges ?? []);
    const userProgress = userBadge?.progress ?? 0;
    const maxValue = badge.criteriaValue ?? 100;
    const progressLabel = `${badge.name}`;
    const isClaimed = userBadge?.claimStatus === 'claimed';
    const isClaimable = userProgress >= maxValue && !isClaimed;
    const claimText = isClaimed ? "Claimed" : isClaimable ? "COLLECT" : "";

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
          claimText={claimText}
          onClaim={isClaimable ? () => handleClaimBadge(badge.id) : undefined}
        />
      </div>
    );
  };

  return (
    <>
      <div className="achievements-list">
        <div className="achievements-header">
          <div className="completed">Completed: {(userBadges ?? []).filter(ub => ub.claimStatus === 'claimed').length} / {(badges ?? []).length}</div>
          <div
            title="Filter Achievements"
            className="leaderboard-filter leaderboard__filter_button"
          >
            <span style={{ minWidth: 60, textAlign: "right" }}>
              {showAll ? "Show Next" : "Show All"}
            </span>
            <Switch
              checked={showAll}
              onChange={(next) => setShowAll(next)}
              ariaLabel="Toggle all achievements"
            />
          </div>
        </div>
        
        {showAll
          ? sortBadgesByCompletion(badges ?? [], userBadges ?? []).map(renderBadge)
          : (() => {
              const nextBadgesPerType = badgeTypes
                .map((badgeType) => {
                  const badgesForThisType = groupBadgesByType(badges ?? [])[badgeType.typeName] ?? [];
                  return getNextBadge(badgesForThisType, userBadges ?? []);
                })
                .filter((b): b is Badge => !!b);
              return sortBadgesByCompletion(nextBadgesPerType, userBadges ?? []).map(renderBadge);
            })()}
      </div>
      {selectedBadge && (
        (() => { // IIFE to calculate progress for selected badge
          const userBadge = getUserBadgeForBadge(selectedBadge.id, userBadges ?? []);
          const userProgress = userBadge?.progress ?? 0;
          const isClaimed = userBadge?.claimStatus === 'claimed';
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
                claimText=""
              />
            </div>
            <p>Progress: {userProgress} / {selectedBadge.criteriaValue ?? 100}</p>
            {isClaimed && <p style={{ color: 'green', fontWeight: 'bold' }}>Status: Claimed</p>}
          </div>
        </Overlay>
          );
        })()
      )}
    </>
  );
}
