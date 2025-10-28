// ========================================================================
// Centraliserade Typer för Applikationen
// Denna fil samlar alla delade TypeScript-typer för enkel import.
// ========================================================================


// Från: badge.ts
export interface Badge {
  id: number;
  name: string;
  description: string;
  iconUrl?: string;
  criteriaValue?: number; // e.g. points or actions needed for badge
}

// Från: leaderboard.ts
export interface LeaderboardEntry {
  userId: number;
  displayName: string;
  avatarUrl?: string | null;
  totalPoints: number; 
}

// Från: team.ts
/**
 * Bas-typ för ett team
 */
export interface Team {
  id: number;
  name: string;
  createdAt: string;
  totalPoints: number;
  members: User[]; 
}

/**
 * Utökad typ som inkluderar ranking, beräknad på frontend.
 */
export interface RankedTeam extends Team {
  rank: number;
}

// Från: user.ts
export type RankTier =
  | "Iron"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Master"
  | "Grandmaster";

export interface User {
  id: number;
  displayName: string;
  avatarUrl?: string;
  totalPoints: number;
  isAdmin: boolean;
  createdAt: string;
  rankTier?: string;
  rank?: number;
}

// Från: userBadge.ts
export interface UserBadge {
  userId: number;
  badgeId: number;
  awardedAt: string; // ISO date string
  progress: number;
}

// Från: userStats.ts
export interface UserStats {
  userId: number;
  totalComments: number;
  totalCreatedPages: number;
  totalEditsMade: number;
  totalResolvedComments: number;
}
