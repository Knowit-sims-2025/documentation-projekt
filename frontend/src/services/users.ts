import type { User } from "../types/user";
import { getRankTier } from "./config/rank";

type RawUser = Record<string, any>;

// Hämta sträng från ev. sql.NullString-liknande objekt
function pickString(v: any): string | undefined {
  if (typeof v === "string") return v;
  if (v && typeof v.String === "string" && (v.Valid === undefined || v.Valid === true)) {
    return v.String;
  }
  return undefined;
}

// Försök härleda slug från avatarUrl (ex: .../captain-america.png?size=150x150 -> "captain-america")
// eller från query-parametern ?u=iron-man
function deriveSlugFromAvatar(url?: string): string | null {
  if (!url) return null;
  try {
    // 1) Query-param ?u=
    const u = new URL(url, window.location.origin);
    const qp = u.searchParams.get("u");
    if (qp) return qp;

    // 2) Sista path-segmentet utan filändelse
    const last = u.pathname.split("/").filter(Boolean).pop();
    if (last) {
      const base = last.split(".")[0];       // "captain-america.png" -> "captain-america"
      if (base) return base;
    }
  } catch {
    // Om URL-konstruktorn inte klarar absolut/relativ blandning, gör enkel fallback:
    const m = url.match(/\/([^\/?#]+)(?:\?.*)?$/); // sista segmentet
    if (m?.[1]) return m[1].split(".")[0];
  }
  return null;
}

function normalize(u: RawUser) {
  const id = Number(u.id ?? u.ID);
  const displayName =
    u.displayName ?? u.DisplayName ?? u.display_name ?? "(unknown)";

  // 1) avatarUrl kan vara sträng ELLER {String, Valid}
  const avatarUrl =
    pickString(u.avatarUrl) ??
    pickString(u.AvatarURL) ??
    pickString(u.avatar_url);

  // 2) confluenceAuthorId: testa alla vanliga varianter
  let confluenceAuthorId: string | null =
    u.confluenceAuthorId ??
    u.ConfluenceAuthorID ??
    u.confluence_author_id ??
    null;

  // 3) Om fortfarande tom/null: härled från avatarUrl (matchar dina seed-slugs)
  if (!confluenceAuthorId) {
    confluenceAuthorId = deriveSlugFromAvatar(avatarUrl) ?? null;
  }

  const totalPoints = Number(u.totalPoints ?? u.TotalPoints ?? u.total_points ?? 0);
  const isAdmin = Boolean(u.isAdmin ?? u.IsAdmin ?? u.is_admin ?? false);

  return { id, displayName, confluenceAuthorId, avatarUrl, totalPoints, isAdmin };
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch("/api/v1/users");
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const data = await res.json();

  const raw: RawUser[] = Array.isArray(data?.users) ? data.users : data;

  const list = raw.map(normalize).sort((a, b) => b.totalPoints - a.totalPoints);

  return list.map((u, i) => ({
    ...u,
    rank: i + 1,
    rankTier: getRankTier(u.totalPoints),
  }));
}
