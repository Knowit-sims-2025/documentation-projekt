import type { BadgeType } from "../types/badgeType";

// Typalias för råa JSON-objekt från backend
type RawBadgeType = Record<string, any>;

/**
 * Normaliserar ett "rått" badge-typ-objekt från backend till ett konsekvent
 * frontend-format som följer typen `BadgeType`.
 */
function normalizeBadgeType(bt: RawBadgeType): BadgeType {
  const id = Number(bt.id ?? bt.ID);
  const typeName = bt.type_name ?? bt.typeName ?? bt.TypeName ?? "Unknown Type";
  return { id, typeName };
}

/**
 * Hämtar alla badge-typer från backendens /api/v1/badgetypes-endpoint.
 */
export async function getBadgeTypes(): Promise<BadgeType[]> {
  const res = await fetch("/api/v1/badgetypes");
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeBadgeType) : [];
}
