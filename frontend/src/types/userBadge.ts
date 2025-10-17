export interface UserBadge {
  userId: number;
  badgeId: number;
  awardedAt: string; // ISO date string
  progress: number;
  claimStatus: "unclaimed" | "claimed";
}