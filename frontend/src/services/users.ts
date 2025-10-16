// src/services/users.ts
import type { User } from "../types/user";
import { getRankTier } from "./config/rank";
import { authFetch } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

// Rå-objekt från backend
type RawUser = Record<string, any>;

/** Hanterar Go:s sql.NullString → string | undefined */
export function pickString(v: any): string | undefined {
  if (typeof v === "string") return v;
  if (v && typeof v.String === "string" && (v.Valid === undefined || v.Valid === true)) {
    return v.String;
  }
  return undefined;
}

export function pickDateString(v: any): string | undefined {
  if (!v) return undefined;

  if (typeof v === "string") {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d.toISOString();
    return undefined;
  }
  if (typeof v === "object") {
    const candidate = v.Time ?? v.time ?? v.date ?? v.String;
    if (candidate) return pickDateString(candidate);
  }
  if (typeof v === "number") {
    const isSeconds = v < 10_000_000_000;
    const d = new Date(isSeconds ? v * 1000 : v);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return undefined;
}

/** Normalisera backend → User */
export function normalizeUser(u: RawUser) {
  const id = Number(u.id ?? u.ID);
  const displayName = u.displayName ?? u.DisplayName ?? u.display_name ?? "(unknown)";
  const avatarUrl =
    pickString(u.avatarUrl) ?? pickString(u.AvatarURL) ?? pickString(u.avatar_url);
  const confluenceAuthorId: string | null =
    (u.confluenceAuthorId ?? u.ConfluenceAuthorID ?? u.confluence_author_id ?? null) ?? null;
  const totalPoints = Number(u.totalPoints ?? u.TotalPoints ?? u.total_points ?? 0);
  const isAdmin = Boolean(u.isAdmin ?? u.IsAdmin ?? u.is_admin ?? false);

  const createdAt =
    pickDateString(u.createdAt) ??
    pickDateString(u.CreatedAt) ??
    pickDateString(u.created_at) ??
    new Date(0).toISOString();

  // plocka rankTier om backend skickar, annars beräkna
  const rankTier: string =
    (u.rankTier as string) ?? getRankTier(totalPoints);

  return {
    id,
    displayName,
    confluenceAuthorId,
    avatarUrl,
    totalPoints,
    isAdmin,
    createdAt,
    rankTier,
  };
}

/** Skyddat anrop: GET /users → normaliserad lista med rank+rankTier */
export async function getUsers(): Promise<User[]> {
  const res = await authFetch(`${API_BASE}/users`, { method: "GET" });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);

  const data = await res.json();
  const raw: RawUser[] = Array.isArray(data?.users) ? data.users : data;

  const list = raw
    .map(normalizeUser)
    .sort((a, b) => b.totalPoints - a.totalPoints);

const users: User[] = list.map((u, i) => ({
  ...u,
  rank: i + 1,
  rankTier: u.rankTier ?? getRankTier(u.totalPoints), // ← if-null fallback
}));

  return users;
}
