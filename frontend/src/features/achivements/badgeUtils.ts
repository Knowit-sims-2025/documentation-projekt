import type { Badge } from "../../types/badge";
import type { User } from "../../types/user";

export const sortBadgesByCompletion = (badges: Badge[], user: User): Badge[] => {
  // Create a copy to avoid mutating the original array
  return [...badges].sort((a, b) => {
    // TODO: Replace this with your actual progress calculation logic
    const userProgressA = 5; // Example: calculateUserProgress(a, user);
    const userProgressB = 5; // Example: calculateUserProgress(b, user);
    const badgeCriteriaValueA = a.criteriaValue ?? 100;
    const badgeCriteriaValueB = b.criteriaValue ?? 100;

    const progressA = (a.criteriaValue ?? 0) > 0 ? userProgressA / badgeCriteriaValueA : 0;
    const progressB = (b.criteriaValue ?? 0) > 0 ? userProgressB / badgeCriteriaValueB : 0;

    // Sort descending (from most complete to least complete)
    return progressB - progressA;
  });
};