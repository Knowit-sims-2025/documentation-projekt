import type { UserBadge } from "../types/userBadge";

// Typalias för råa JSON-objekt från backend (okända fält och format)
type RawUserBadge = Record<string, any>;

/* ========================================================================== 
   pickString(v)
   --------------------------------------------------------------------------
   Hanterar Go:s `sql.NullString`-objekt som backend kan returnera.
   ========================================================================== */
function pickString(v: any): string | undefined {
  if (typeof v === "string") return v;
  if (v && typeof v.String === "string" && (v.Valid === undefined || v.Valid === true)) {
    return v.String;
  }
  return undefined;
}

/* ========================================================================== 
   normalizeBadge(b)
   --------------------------------------------------------------------------
   Gör om ett "rått" badge-objekt från backend till ett konsekvent
   frontend-format som följer typen `Badge`.
   ========================================================================== */
function normalizeUserBadge(b: RawUserBadge): UserBadge {
  const userId = Number(b.user_id ?? b.userId ?? b.UserID);
  const badgeId = Number(b.badge_id ?? b.badgeId ?? b.BadgeID);
  const awardedAt = b.awarded_at ?? b.awardedAt ?? b.AwardedAt ?? new Date().toISOString();
  const progress = Number(b.progress ?? b.Progress ?? 0);

  return { userId, badgeId, awardedAt, progress };
}

/* ========================================================================== 
   getUserBadges()
   --------------------------------------------------------------------------
   Hämtar badge-data från backendens /api/v1/badges-endpoint.
   ========================================================================== */
export async function getUserBadges(): Promise<UserBadge[]> {
  const res = await fetch("/api/v1/userbadges");
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  const data = await res.json();
  const raw: RawUserBadge[] = Array.isArray(data?.userBadges) ? data.userBadges : data;

  return raw.map(normalizeUserBadge);
}

/* ==========================================================================
   getUserBadgesByUserId(userId)
   --------------------------------------------------------------------------
   Hämtar alla badges för en specifik användare.
   ========================================================================== */
export async function getUserBadgesByUserId(userId: number): Promise<UserBadge[]> {
  // For debugging: Log which user we are fetching badges for.
  // console.log(`Fetching badges for userId: ${userId}`);

  const res = await fetch(`/api/v1/users/${userId}/badges`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  const data = await res.json();
  // For debugging: Log the raw data received from the API.
  console.log(`Raw data from /api/v1/users/${userId}/badges:`, data);

  const raw: RawUserBadge[] = Array.isArray(data) ? data : [];
  return raw.map(normalizeUserBadge);
}
