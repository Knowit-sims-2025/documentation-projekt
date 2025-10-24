import React from "react";
import { createPortal } from "react-dom";
import type { Badge } from "../types/badge";
import type { UserBadge } from "../types/userBadge";
import { iconMap } from "../assets/badges/iconMap";
import ProgressBar from "./progressbar/progressbar";

interface Props {
  badge: Badge;
  userBadges: UserBadge[];
  position: { x: number; y: number }; // rå musposition (clientX/Y)
}

function getUserProgressForBadge(id: number, userBadges: UserBadge[]): number {
  return userBadges.find((ub) => ub.badgeId === id)?.progress ?? 0;
}

export const AchievementHoverCard: React.FC<Props> = ({
  badge,
  userBadges,
  position,
}) => {
  const progress = getUserProgressForBadge(badge.id, userBadges);
  const max = badge.criteriaValue ?? 100;
  const iconSrc = badge.iconUrl ? iconMap[badge.iconUrl] : undefined;

  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 300, h: 120 }); // startvärden (css: width:300px)
  const OFFSET = 16;

  // Mät verklig storlek när innehåll ändras
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const { offsetWidth, offsetHeight } = ref.current;
    setSize({ w: offsetWidth || 300, h: offsetHeight || 120 });
  }, [badge.id, progress, max]);

  // Klamra koordinater till viewport
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const left = Math.min(
    Math.max(OFFSET, position.x + OFFSET),
    vw - size.w - OFFSET
  );
  const top = Math.min(
    Math.max(OFFSET, position.y + OFFSET),
    vh - size.h - OFFSET
  );

  const node = (
    <div
      ref={ref}
      className="ach-hover-card"
      role="tooltip"
      style={{ position: "fixed", left, top, width: 300 }}
    >
      <header className="ach-hover-card__header">
        {iconSrc && (
          <img src={iconSrc} alt="" className="ach-hover-card__icon" />
        )}
        <h3>{badge.name}</h3>
      </header>

      <p className="ach-hover-card__desc">{badge.description}</p>

      <div className="ach-hover-card__progress">
        <ProgressBar value={progress} max={max} />
        <span className="ach-hover-card__progress-text">
          {progress} / {max}
        </span>
      </div>
    </div>
  );

  // 🚪 Portal till <body> för att undvika att klippas av containers
  return createPortal(node, document.body);
};
