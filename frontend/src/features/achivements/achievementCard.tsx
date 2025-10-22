// src/features/achivements/achievementCard.tsx
import { useState, useEffect, useRef, useMemo } from "react";
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
  /** Om ett ID skickas med, scrolla till den badgen direkt. */
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
  return [...badges].sort((a, b) => {
    const userProgressA = getUserProgressForBadge(a.id, userBadges);
    const userProgressB = getUserProgressForBadge(b.id, userBadges);
    const badgeCriteriaValueA = a.criteriaValue ?? 100;
    const badgeCriteriaValueB = b.criteriaValue ?? 100;

    const progressA =
      badgeCriteriaValueA > 0 ? userProgressA / badgeCriteriaValueA : 0;
    const progressB =
      badgeCriteriaValueB > 0 ? userProgressB / badgeCriteriaValueB : 0;

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
  const listRef = useRef<HTMLDivElement>(null);

  // ➕ Sammanfattning för .ach-summary
  const summary = useMemo(() => {
    const list = badges ?? [];
    const ub = userBadges ?? [];
    const total = list.length;
    const unlockedCount = list.reduce((acc, b) => {
      const v = getUserProgressForBadge(b.id, ub);
      const m = b.criteriaValue ?? 100;
      return acc + (v >= m ? 1 : 0);
    }, 0);
    return {
      total,
      unlockedCount,
      percent: total ? Math.round((unlockedCount / total) * 100) : 0,
    };
  }, [badges, userBadges]);

  // Scrolla till initial badge (utan att öppna overlay)
  useEffect(() => {
    if (initialSelectedBadgeId && listRef.current) {
      const el = listRef.current.querySelector(
        `[data-badge-id="${initialSelectedBadgeId}"]`
      ) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("highlight-initial");
        setTimeout(() => el.classList.remove("highlight-initial"), 1500);
      }
    }
  }, [initialSelectedBadgeId, loadingBadges, loadingUserBadges]);

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

  // Detaljvy (oförändrad)
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

  // ✅ LISTVY med SUMMARY som direkt grid-barn (ingen yttre div → inga dubbla ramar)
  return (
    <section className="achievements">
      <div className="achievements-list" ref={listRef}>
        {/* Direkt barn till grid: .ach-summary */}
        <article className="ach-summary">
          <ProgressBar
            value={summary.unlockedCount}
            max={summary.total}
            label={`You've unlocked ${summary.unlockedCount}/${summary.total} (${summary.percent}%)`}
          />
        </article>

        {badgeList.map((badge) => {
          const userProgress = getUserProgressForBadge(
            badge.id,
            userBadges ?? []
          );
          const maxValue = badge.criteriaValue ?? 100;
          const progressLabel = `${badge.name}`;

          return (
            <div
              className="achievement-item"
              key={badge.id}
              data-badge-id={badge.id}
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
    </section>
  );
}
