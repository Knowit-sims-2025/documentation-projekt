import type { Badge } from "../../types/badge";
import type { UserBadge } from "../../types/userBadge";

export const getUserProgressForBadge = (badgeId: number, userBadges: UserBadge[]): number => {
  const userBadge = userBadges.find(ub => ub.badgeId === badgeId);
  return userBadge?.progress ?? 0;
};

export const sortBadgesByCompletion = (badges: Badge[], userBadges: UserBadge[]): Badge[] => {
  // Create a copy to avoid mutating the original array
  return [...badges].sort((a, b) => {
    const userProgressA = getUserProgressForBadge(a.id, userBadges);
    const userProgressB = getUserProgressForBadge(b.id, userBadges);
    const badgeCriteriaValueA = a.criteriaValue ?? 100;
    const badgeCriteriaValueB = b.criteriaValue ?? 100;

    const progressA = badgeCriteriaValueA > 0 ? userProgressA / badgeCriteriaValueA : 0;
    const progressB = badgeCriteriaValueB > 0 ? userProgressB / badgeCriteriaValueB : 0;

    // Sort descending (from most complete to least complete)
    return progressB - progressA;
  });
};