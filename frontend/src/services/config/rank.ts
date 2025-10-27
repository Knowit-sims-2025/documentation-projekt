import type { RankTier } from "../../types/types";

// Poängtrösklar, från högst till lägst
export const RANK_THRESHOLDS: { min: number; tier: RankTier }[] = [
  { min: 5000, tier: "Grandmaster" },
  { min: 3000, tier: "Master" },
  { min: 2500, tier: "Diamond" },
  { min: 2000, tier: "Platinum" },
  { min: 1500,  tier: "Gold" },
  { min: 1000,  tier: "Silver" },
  { min: 500,  tier: "Bronze" },
  { min: 0,    tier: "Iron" },
];

// Hjälpfunktion: ta fram nivå baserat på totalPoints
export function getRankTier(points: number): RankTier {
  for (const { min, tier } of RANK_THRESHOLDS) {
    if (points >= min) return tier;
  }
  return "Iron"; // fallback till grundnivån
}

export function getNextRankTier(points: number): RankTier {
  var previous = RANK_THRESHOLDS[0].tier; // starta på högsta tröskeln
  for (const { tier, min } of RANK_THRESHOLDS) {
    if (points > min) return previous; // first threshold above current points
    previous = tier;
  }
  return RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1].tier; // Already at highest rank, return highest
}

export function getNextRankThreshold(points: number): number | null {
  var previous = RANK_THRESHOLDS[0].min; // starta på högsta tröskeln
  for (const { min } of RANK_THRESHOLDS) {
    if (points > min) return previous; // first threshold above current points
    previous = min;
  }
  return 1; // Cannot be 0 due to division, so return 1 if already at highest rank
}

export function getPreviousRankThreshold(points: number): number | null {
  for (const { min } of RANK_THRESHOLDS) {
    if (points >= min) return min; // first threshold above current points
  }
  return 1; // Cannot be 0 due to division, so return 1 if already at highest rank
}
