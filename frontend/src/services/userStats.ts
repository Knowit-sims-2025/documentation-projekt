import { authFetch } from "./auth";
import type { UserStats } from "../types/userStats";

/**
 * Normaliserar rådata från API:et till en UserStats-typ.
 * Detta gör koden mer robust mot små skillnader i fältnamn
 */
function normalize(raw: any, userId: number): UserStats {
  return {
    userId: userId,
    totalComments: Number(raw.totalComments ?? raw.total_comments ?? 0),
    totalCreatedPages: Number(
      raw.totalCreatedPages ?? raw.total_created_pages ?? 0
    ),
    totalEditsMade: Number(raw.totalEdits ?? raw.total_edits ?? 0),
    totalResolvedComments: Number(
      raw.totalResolvedComments ?? raw.total_resolved_comments ?? 0
    ),
  };
}

export async function getUserStats(
  userId: number,
  signal?: AbortSignal
): Promise<UserStats> {
  const res = await authFetch(`/api/v1/users/${userId}/stats`, { signal });
  const raw = await res.json();
  console.debug("getUserStats raw response:", raw);
  return normalize(raw, userId);
}