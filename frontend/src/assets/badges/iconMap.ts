/**
 * =========================================================================
 * Icon Map
 * -------------------------------------------------------------------------
 * Denna fil centraliserar importen och mappningen av badge-ikoner.
 * Genom att ha detta på ett ställe undviker vi kodduplicering och gör
 * det enkelt att lägga till eller ändra ikoner i framtiden.
 *
 * Användning:
 * import { iconMap } from '../../assets/badges/iconMap';
 * const iconSrc = iconMap[badge.iconUrl];
 * =========================================================================
 */
import documents0 from "./documents0.svg";
import documents1 from "./documents1.svg";
import documents2 from "./documents2.svg";
import documents3 from "./documents3.svg";
import comments0 from "./comments0.svg";
import comments1 from "./comments1.svg";
import comments2 from "./comments2.svg";
import comments3 from "./comments3.svg";
import edits0 from "./edits0.svg";
import edits1 from "./edits1.svg";
import edits2 from "./edits2.svg";
import edits3 from "./edits3.svg";

export const iconMap: Record<string, string> = {
  documents0, documents1, documents2, documents3,
  comments0, comments1, comments2, comments3,
  edits0, edits1, edits2, edits3,
};