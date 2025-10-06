
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
  confluenceAuthorId: string;
  avatarUrl?: string;
  totalPoints: number;
  rank: number;
  rankTier: RankTier;
  isAdmin: boolean;
}