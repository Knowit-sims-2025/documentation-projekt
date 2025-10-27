import React from "react";
import type { UserStats } from "../../types/types";

/**
 * En liten, lokal komponent för att visa en enskild statistikpost.
 */
function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="profile-stat-item">
      <span className="profile-stat-value">{value}</span>
      <span className="profile-stat-label">{label}</span>
    </div>
  );
}

interface UserLifeTimeStatsProps {
  stats: UserStats;
}

/**
 * Visar en grid med en användares livstidsstatistik.
 */
export function UserLifeTimeStats({ stats }: UserLifeTimeStatsProps) {
  return (
    <div className="profile-stats">
      {/* <-- container wrapper */}
      <div className="profile-stats-grid">
        <StatItem label=" Total Comments" value={stats.totalComments} />
        <StatItem label=" Pages Created" value={stats.totalCreatedPages} />
        <StatItem label=" Pages Edited" value={stats.totalEditsMade} />
        <StatItem
          label=" Total Resolved Comments "
          value={stats.totalResolvedComments}
        />
      </div>
    </div>
  );
}
