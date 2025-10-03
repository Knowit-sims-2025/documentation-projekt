// Minimal rank-beräkning: returnerar en RankTier
import type { RankTier, User } from "../types/user";

export function getRankTier(points: number): RankTier {
  const p = Math.max(0, Math.floor(points || 0));
  if (p >= 10000) return "Grandmaster";
  if (p >= 8000)  return "Master";
  if (p >= 6000)  return "Diamond";
  if (p >= 5000)  return "Platinum";
  if (p >= 3000)  return "Gold";
  if (p >= 1000)  return "Silver";
  if (p >= 500)   return "Bronze";
  return "Iron";
}

// Fyller i rankTier om det inte finns på backend.
export function withComputedTier(
  u: Omit<User, "rankTier"> & Partial<Pick<User, "rankTier">>
): User {
  return { ...u, rankTier: u.rankTier ?? getRankTier(u.totalPoints) };
}
