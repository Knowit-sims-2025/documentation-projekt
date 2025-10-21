import type { Badge } from "../../types/badge";
import type { UserBadge } from "../../types/userBadge";

export const getUserBadgeForBadge = (badgeId: number, userBadges: UserBadge[]): UserBadge | undefined => {
  return userBadges.find(ub => ub.badgeId === badgeId);
};

/**
 * Gets the user's progress for a specific badge.
 */
export const getUserProgressForBadge = (badgeId: number, userBadges: UserBadge[]): number => {
  const userBadge = getUserBadgeForBadge(badgeId, userBadges);
  return userBadge?.progress ?? 0;
};

export function groupBadgesByType(badges: Badge[]): Record<string, Badge[]> {
  const grouped = badges.reduce((acc, badge) => {
    const typeName = badge.typeName || 'Uncategorized';
    if (!acc[typeName]) {
      acc[typeName] = [];
    }
    acc[typeName].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  // Sort badges within each group by their criteria value
  for (const typeName in grouped) {
    grouped[typeName].sort((a, b) => (a.criteriaValue ?? 0) - (b.criteriaValue ?? 0));
  }

  return grouped;
}

export function getNextBadge(badgesForType: Badge[], userBadges: UserBadge[]): Badge | undefined {
  if (!badgesForType || badgesForType.length === 0) {
    return undefined;
  }

  const nextBadge = badgesForType.find(badge => {
    const userBadge = getUserBadgeForBadge(badge.id, userBadges);
    return userBadge?.claimStatus !== 'claimed';
  });

  // If all badges are claimed, return the last one in the series.
  return nextBadge ?? badgesForType[badgesForType.length - 1];
}

/**
 * Sorts badges by completion percentage, from most complete to least complete.
 * @param badges - An array of all available badges.
 * @param userBadges - The user's current badge progress.
 * @returns A sorted array of badges.
 */
export function sortBadgesByCompletion(badges: Badge[], userBadges: UserBadge[]): Badge[] {
  return [...badges].sort((a, b) => {
    const userBadgeA = getUserBadgeForBadge(a.id, userBadges);
    const userBadgeB = getUserBadgeForBadge(b.id, userBadges);

    const isClaimedA = userBadgeA?.claimStatus === 'claimed';
    const isClaimedB = userBadgeB?.claimStatus === 'claimed';

    // Rule 2: If both are claimed or both are unclaimed, sort by completion percentage.
    const userProgressA = userBadgeA?.progress ?? 0;
    const userProgressB = userBadgeB?.progress ?? 0;
    
    // Rule 1: If one badge is claimed and the other isn't, the unclaimed one comes first.
    if (isClaimedA && !isClaimedB) return 1;  // a is claimed, so it goes after b.
    if (!isClaimedA && isClaimedB) return -1; // b is claimed, so it goes after a.

    
    // Use 1 as a fallback to prevent division by zero for badges with no criteria value.
    const criteriaA = a.criteriaValue || 1;
    const criteriaB = b.criteriaValue || 1;

    const completionB = userProgressB / criteriaB;
    const completionA = userProgressA / criteriaA;

    return completionB - completionA; // Sort descending by completion percentage.
  });
}

export function getCompletionPercentage(userBadges: UserBadge[]): number {
  if (!userBadges || userBadges.length === 0) return 0;

  const claimedCount = userBadges.filter(ub => ub.claimStatus === 'claimed').length;
  const totalCount = userBadges.length;
  return totalCount > 0 ? Math.round((claimedCount / totalCount) * 100) : 0;
}

/**
 * Calculates the completion percentage for a specific group of badges (e.g., by type).
 * @param badgesForType - The group of badges to check against (e.g., all "Documents" badges).
 * @param userBadges - The user's entire badge progress.
 * @returns The percentage of claimed badges within that specific group.
 */
export function getCompletionPercentageForType(userBadges: UserBadge[]): number {
  if (userBadges.length === 0) return 0;
  
  const claimedCount = userBadges.filter(ub => 
    ub.claimStatus === 'claimed'
  ).length;

  return Math.round((claimedCount / userBadges.length) * 100);
}