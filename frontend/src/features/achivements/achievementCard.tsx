import { useState, useEffect, useRef } from "react";
import { useBadges } from "../../hooks/useBadges";
import { useUserBadges } from "../../hooks/useUserBadges";
import { ErrorMessage } from "../../components/ErrorMessage";
import type { Badge } from "../../types/badge";
import type { User } from "../../types/user";
import ProgressBar from "../../components/progressbar/progressbar";
import type { UserBadge } from "../../types/userBadge";
import { iconMap } from "../../assets/badges/iconMap";

interface AchievementCardProps {
  user: User;
  /** Om ett ID skickas med, öppnas overlayen för den badgen direkt. */
  initialSelectedBadgeId?: number | null;
}

const getUserProgressForBadge = (
  badgeId: number,
  userBadges: UserBadge[]
): number => {
  const userBadge = userBadges.find((ub) => ub.badgeId === badgeId);
  return userBadge?.progress ?? 0;
};

const sortBadges = (badges: Badge[], userBadges: UserBadge[]): Badge[] => {
  // Create a copy to avoid mutating the original array
  return [...badges].sort((a, b) => {
    const userProgressA = getUserProgressForBadge(a.id, userBadges);
    const userProgressB = getUserProgressForBadge(b.id, userBadges);
    const badgeCriteriaValueA = a.criteriaValue ?? 100;
    const badgeCriteriaValueB = b.criteriaValue ?? 100;

    const progressA =
      badgeCriteriaValueA > 0 ? userProgressA / badgeCriteriaValueA : 0;
    const progressB =
      badgeCriteriaValueB > 0 ? userProgressB / badgeCriteriaValueB : 0;

    // Sort descending (from most complete to least complete)
    return progressB - progressA;
  });
};

export default function AchievementCard({
  user,
  initialSelectedBadgeId,
}: AchievementCardProps) {
  const {
    data: badges,
    loading: loadingBadges,
    error: errorBadges,
  } = useBadges();
  const {
    data: userBadges,
    loading: loadingUserBadges,
    error: errorUserBadges,
  } = useUserBadges(user.id);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Ref för att kunna scrolla till ett element
  const listRef = useRef<HTMLDivElement>(null);

  // Effekt för att scrolla till den initialt valda badgen, istället för att öppna den.
  useEffect(() => {
    // Körs bara när listan har renderats och vi har ett ID att leta efter.
    if (initialSelectedBadgeId && listRef.current) {
      const element = listRef.current.querySelector(
        `[data-badge-id="${initialSelectedBadgeId}"]`
      );
      if (element) {
        // Scrolla elementet till mitten av vyn och lägg till en highlight-klass.
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("highlight-initial");
        setTimeout(() => element.classList.remove("highlight-initial"), 1500);
      }
    }
  }, [initialSelectedBadgeId, loadingBadges, loadingUserBadges]); // Kör när laddning är klar

  if (loadingBadges || loadingUserBadges) return <div>Laddar badges...</div>;
  if (errorBadges || errorUserBadges)
    return (
      <ErrorMessage
        message={`Kunde inte hämta badges: ${errorBadges ?? errorUserBadges}`}
      />
    );

  const badgeList = sortBadges(badges ?? [], userBadges ?? []);

  if (badgeList.length === 0) {
    return <ErrorMessage message="Inga badges hittades." />;
  }

  // Om en badge är vald, visa detaljvyn istället för listan.
  if (selectedBadge) {
    const userProgress = getUserProgressForBadge(
      selectedBadge.id,
      userBadges ?? []
    );
    return (
      <div className="achievements-detail-view">
        <button
          onClick={() => setSelectedBadge(null)}
          className="achievements-detail-view__back-btn"
        >
          &larr; Tillbaka till listan
        </button>
        <h2>{selectedBadge.name}</h2>
        <p>{selectedBadge.description}</p>
        <img
          src={
            selectedBadge.iconUrl ? iconMap[selectedBadge.iconUrl] : undefined
          }
          alt={selectedBadge.name}
          className="achievements-detail-view__img"
        />
        <div style={{ width: "100%" }}>
          <ProgressBar
            value={userProgress}
            max={selectedBadge.criteriaValue ?? 100}
          />
        </div>
        <p>
          Progress: {userProgress} / {selectedBadge.criteriaValue ?? 100}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="achievements-list" ref={listRef}>
        {badgeList.map((badge) => {
          const userProgress = getUserProgressForBadge(badge.id, userBadges);
          const maxValue = badge.criteriaValue ?? 100;
          const progressLabel = `${badge.name}`;

          return (
            <div
              className="achievement-item"
              key={badge.id}
              data-badge-id={badge.id} // Lägg till ID för att kunna hitta elementet
              onClick={() => setSelectedBadge(badge)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && setSelectedBadge(badge)
              }
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
    </>
  );
}
