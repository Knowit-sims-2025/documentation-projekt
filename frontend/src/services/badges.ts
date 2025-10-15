import type { Badge } from "../types/badge";

// Typalias för råa JSON-objekt från backend (okända fält och format)
type RawBadge = Record<string, any>;

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
function normalizeBadge(b: RawBadge): Badge {
  const id = Number(b.id ?? b.ID);
  const name = b.name ?? b.Name ?? b.badgeName ?? "(unknown)";
  const description = b.description ?? b.Description ?? "";
  const iconUrl = pickString(b.iconUrl) ?? pickString(b.iconURL) ?? pickString(b.icon_url);
  const criteriaValue = b.criteriaValue ?? b.CriteriaValue ?? b.criteria_value;

  return { id, name, description, iconUrl, criteriaValue };
}

/* ========================================================================== 
   getBadges()
   --------------------------------------------------------------------------
   Hämtar badge-data från backendens /api/v1/badges-endpoint.
   ========================================================================== */
export async function getBadges(): Promise<Badge[]> {
  const res = await fetch("/api/v1/badges");
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  const data = await res.json();
  const raw: RawBadge[] = Array.isArray(data?.badges) ? data.badges : data;

  return raw.map(normalizeBadge);
}