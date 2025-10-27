import React, {
  useMemo,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  useRef,
} from "react";
import { useBadges } from "./useBadges";
import { useUserBadges } from "./useUserBadges";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import ProgressBar from "../../components/ui/progressbar";

import type { Badge } from "../../types/badge";
import { AchievementHoverCard } from "./AchievementHoverCard";
import type { User } from "../../types/user";
import type { UserBadge } from "../../types/userBadge";

/** Centraliserad ikon-mappning */
import { iconMap } from "../../assets/badges/iconMap";

/** Hjälpare: progress för en given badge */
function getUserProgressForBadge(id: number, userBadges: UserBadge[]): number {
  return userBadges.find((ub) => ub.badgeId === id)?.progress ?? 0;
}

type Props = {
  user: User;
  onIconClick: (badgeId: number) => void;
};

/**
 * AchievementIconDisplay
 * - Header: total progress
 * - Grid: ikonknappar (unlocked först, låsta gråskaliga)
 * - Overlay: detaljvy för klickad ikon (återanvänder ProgressBar)
 */
export default function AchievementIconDisplay({ user, onIconClick }: Props) {
  const { data: badgesRaw = [], loading: lb, error: eb } = useBadges();
  const {
    data: userBadgesRaw = [],
    loading: lu,
    error: eu,
  } = useUserBadges(user.id);

  const [hovered, setHovered] = useState<{
    badge: Badge;
    position: { x: number; y: number };
  } | null>(null);

  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  const badges = badgesRaw ?? [];
  const userBadges = userBadgesRaw ?? [];

  const sorted = useMemo(() => {
    const withMeta = badges.map((b) => {
      const v = getUserProgressForBadge(b.id, userBadges);
      const m = b.criteriaValue ?? 100;
      const pct = m > 0 ? v / m : 0;
      const unlocked = v >= m;
      return { badge: b, v, m, pct, unlocked };
    });
    return withMeta.sort((a, b) =>
      a.unlocked !== b.unlocked ? (a.unlocked ? -1 : 1) : b.pct - a.pct
    );
  }, [badges, userBadges]);

  const summary = useMemo(() => {
    const total = badges.length;
    const unlockedCount = badges.reduce((acc, b) => {
      const v = getUserProgressForBadge(b.id, userBadges);
      return acc + (v >= (b.criteriaValue ?? 100) ? 1 : 0);
    }, 0);
    const percent = total ? Math.round((unlockedCount / total) * 100) : 0;
    return { total, unlockedCount, percent };
  }, [badges, userBadges]);

  if (lb || lu) return <div>Laddar achievements…</div>;
  if (eb || eu)
    return <ErrorMessage message={`Kunde inte hämta badges: ${eb ?? eu}`} />;
  if (summary.total === 0)
    return <ErrorMessage message="Inga badges hittades." />;

  const handleKey = (b: Badge) => (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onIconClick(b.id);
    }
  };

  const handlePointerEnter = (
    badge: Badge,
    e: PointerEvent<HTMLButtonElement>
  ) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    const { clientX, clientY } = e;
    hoverTimer.current = setTimeout(() => {
      setHovered({ badge, position: { x: clientX, y: clientY } });
    }, 150);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!hovered) return;
    setHovered((prev) =>
      prev ? { ...prev, position: { x: e.clientX, y: e.clientY } } : prev
    );
  };

  const handlePointerLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHovered(null);
  };

  return (
    <section className="achicons">
      <ProgressBar
        value={summary.unlockedCount}
        max={summary.total}
        label={`${user.displayName} have unlocked ${summary.unlockedCount}/${summary.total} (${summary.percent}%)`}
      />

      <div
        className="achicons__grid"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {sorted.map(({ badge, v, m, unlocked }) => {
          const src = badge.iconUrl ? iconMap[badge.iconUrl] : undefined;
          return (
            <button
              key={badge.id}
              type="button"
              className="achicons__btn"
              aria-label={`${badge.name} (${v}/${m})`}
              data-state={unlocked ? "unlocked" : "locked"}
              onClick={() => onIconClick(badge.id)}
              onKeyDown={handleKey(badge)}
              onPointerEnter={(e) => handlePointerEnter(badge, e)}
            >
              {src ? (
                <img className="achicons__img" src={src} alt="" aria-hidden />
              ) : (
                <div className="achicons__fallback" aria-hidden>
                  {badge.name[0] ?? "?"}
                </div>
              )}
              <div className="achicons__mini">
                <div
                  className="achicons__mini-bar"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, (v / Math.max(m, 1)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {hovered && (
        <AchievementHoverCard
          badge={hovered.badge}
          userBadges={userBadges}
          position={hovered.position}
        />
      )}
    </section>
  );
}
