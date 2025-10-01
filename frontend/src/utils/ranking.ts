/**
 * Beräknar en rankningsnivå (t.ex. "Gold", "Silver") baserat på poäng.
 * @param points Antalet poäng.
 * @returns En sträng som representerar rankningsnivån.
 */
export const getRankTier = (points: number): string => {
  if (points >= 5000) return "Platinum";
  if (points >= 3000) return "Gold";
  if (points >= 1000) return "Silver";
  if (points >= 500) return "Bronze";
  return "Iron";
};
