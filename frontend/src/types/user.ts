
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