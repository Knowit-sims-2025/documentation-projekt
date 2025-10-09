import type { User } from "../types/user";
import { getRankTier } from "./config/rank";

// Typalias för råa JSON-objekt från backend (okända fält och format)
type RawUser = Record<string, any>;

/* ==========================================================================
   pickString(v)
   --------------------------------------------------------------------------
   Hanterar Go:s `sql.NullString`-objekt som backend kan returnera.
   Exempel:
     { String: "iron-man", Valid: true } → "iron-man"
   Om värdet redan är en vanlig sträng returneras det direkt.
   Om `Valid` = false eller fältet saknas → undefined.
   ========================================================================== */
function pickString(v: any): string | undefined {
  if (typeof v === "string") return v;
  if (v && typeof v.String === "string" && (v.Valid === undefined || v.Valid === true)) {
    return v.String;
  }
  return undefined;
}


/* ==========================================================================
   normalize(u)
   --------------------------------------------------------------------------
   Gör om ett "rått" användarobjekt från backend till ett konsekvent
   frontend-format som följer typen `User`.

   Hanterar:
     - snake_case, PascalCase och camelCase-fältnamn
     - Go:s NullString-objekt
     - fallback för confluenceAuthorId om det saknas
   ========================================================================== */
export function normalizeUser(u: RawUser) {
  // id kan komma som "id" eller "ID"
  const id = Number(u.id ?? u.ID);

  // displayName i flera varianter
  const displayName =
    u.displayName ?? u.DisplayName ?? u.display_name ?? "(unknown)";

  // avatarUrl kan vara sträng eller {String, Valid}
  const avatarUrl =
    pickString(u.avatarUrl) ??
    pickString(u.AvatarURL) ??
    pickString(u.avatar_url);

  // confluenceAuthorId – vi läser bara det backend faktiskt skickar
  const confluenceAuthorId: string | null =
    (u.confluenceAuthorId ??
      u.ConfluenceAuthorID ??
      u.confluence_author_id ??
      null) ?? null;

  // poäng och admin-stöd med fallback
  const totalPoints = Number(u.totalPoints ?? u.TotalPoints ?? u.total_points ?? 0);
  const isAdmin = Boolean(u.isAdmin ?? u.IsAdmin ?? u.is_admin ?? false);

  return { id, displayName, confluenceAuthorId, avatarUrl, totalPoints, isAdmin };
}

/* ==========================================================================
   getUsers()
   --------------------------------------------------------------------------
   Hämtar användardata från backendens /api/v1/users-endpoint.

   Flöde:
     1) Hämta data via fetch()
     2) Hantera både { users: [...] } och bara [...]
     3) Normalisera varje användare med normalize()
     4) Sortera efter totalPoints (högst först)
     5) Lägg till rank och rankTier (via getRankTier)
   ========================================================================== */
export async function getUsers(): Promise<User[]> {
  const res = await fetch("/api/v1/users");
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  
  const data = await res.json();
  const raw: RawUser[] = Array.isArray(data?.users) ? data.users : data;

  const list = raw
    .map(normalizeUser)
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return list.map((u, i) => ({
    ...u,
    rank: i + 1,
    rankTier: getRankTier(u.totalPoints),
  }));
}
