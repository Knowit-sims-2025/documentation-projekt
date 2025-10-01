import type { RankTier } from "../../types/user";

// Poängtrösklar, från högst till lägst
export const RANK_THRESHOLDS: { min: number; tier: RankTier }[] = [
  { min: 3000, tier: "Grandmaster" },
  { min: 2000, tier: "Master" },
  { min: 1500, tier: "Diamond" },
  { min: 1000, tier: "Platinum" },
  { min: 500,  tier: "Gold" },
  { min: 250,  tier: "Silver" },
  { min: 100,  tier: "Bronze" },
  { min: 0,    tier: "Iron" },
];

// Hjälpfunktion: ta fram nivå baserat på totalPoints
export function getRankTier(points: number): RankTier {
  for (const { min, tier } of RANK_THRESHOLDS) {
    if (points >= min) return tier;
  }
  return "Iron"; // fallback till grundnivån
}
