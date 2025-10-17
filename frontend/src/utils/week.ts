import { toLocalYYYYMMDD } from "./date";

/**
 * lokal parsing av "YYYY-MM-DD".
 * new Date("YYYY-MM-DD") kan tolkas som UTC-midnatt, vilket kan leda till fel datum
 * beroende på tidszon. Denna funktion säkerställer att datumet skapas i lokal tid.
 */
export function parseLocalDate(yyyyMmDd: string): Date {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isMonday(yyyyMmDd: string): boolean {
  const d = parseLocalDate(yyyyMmDd);
  return d.getDay() === 1; // 1 = måndag (0=söndag)
}

/** Snäpper ett datum till veckans måndag (ISO) i lokal tid */
export function snapToMonday(yyyyMmDd: string): string {
  const d = parseLocalDate(yyyyMmDd);
  const day = (d.getDay() + 6) % 7; // 0=Mon ... 6=Sun
  d.setDate(d.getDate() - day);
  return toLocalYYYYMMDD(d);
}

/** Ger söndagen (måndag + 6) för en given måndag */
export function sundayFromMonday(mondayYmd: string): string {
  const d = parseLocalDate(mondayYmd);
  d.setDate(d.getDate() + 6);
  return toLocalYYYYMMDD(d);
}

/** ISO-veckonummer (1..53) för ett datum */
export function getISOWeekNumber(d: Date = new Date()): number {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  // ISO: hitta torsdag i denna vecka, räkna från första torsdagen i året
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day + 3);
  const firstThu = new Date(date.getFullYear(), 0, 4);
  const firstThuDay = (firstThu.getDay() + 6) % 7;
  firstThu.setDate(firstThu.getDate() - firstThuDay + 3);
  return 1 + Math.round((date.getTime() - firstThu.getTime()) / (7 * 24 * 3600 * 1000));
}

/** ISO-veckoår (kan avvika från kalenderår vid årsskiftet) */
export function getISOWeekYear(d: Date = new Date()): number {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day + 3);
  return date.getFullYear();
}

/** Konvertera "YYYY-MM-DD" → "YYYY-Www" (ISO) */
export function dateToISOWeekString(yyyyMmDd: string): string {
  const d = parseLocalDate(yyyyMmDd);
  const y = getISOWeekYear(d);
  const w = getISOWeekNumber(d);
  return `${y}-W${String(w).padStart(2, "0")}`;
}

/** Konvertera "YYYY-Www" → veckans måndag "YYYY-MM-DD" (lokal tid) */
export function isoWeekStringToMonday(isoWeek: string): string {
  // format "2025-W41"
  const m = isoWeek.match(/^(\d{4})-W(\d{2})$/);
  if (!m) throw new Error(`Felaktigt week-värde: ${isoWeek}`);
  const y = Number(m[1]);
  const w = Number(m[2]);

  // ISO: Vecka 1 = veckan med 4 jan. Ta måndagen den veckan, lägg (w-1)*7 dagar.
  const jan4 = new Date(y, 0, 4); // lokal tid
  const day = (jan4.getDay() + 6) % 7; // 0=Mon...6=Sun
  const mondayWeek1 = new Date(y, 0, 4 - day);
  const mondayTarget = new Date(mondayWeek1);
  mondayTarget.setDate(mondayWeek1.getDate() + (w - 1) * 7);
  return toLocalYYYYMMDD(mondayTarget);
}

/** 🔧 Viktigt: exportera denna – klampa till *idag* (00:00 lokal tid) om end ligger i framtiden */
export function clampEndToToday(end: Date): Date {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return end > today ? today : end;
}

/** Max-veckosträng för idag (för att låsa framtida veckor i <input type="week">) */
export function maxISOWeekStringForToday(): string {
  const today = new Date();
  return dateToISOWeekString(toLocalYYYYMMDD(today));
}

/** Hjälptext för UI: "v. 41 · 2025-10-06 — 2025-10-12" */
export function weekRangeLabelFromMonday(mondayYmd: string): string {
  const mon = parseLocalDate(mondayYmd);
  const iso = getISOWeekNumber(mon);
  const start = toLocalYYYYMMDD(mon);
  const end = sundayFromMonday(mondayYmd);
  return `v. ${iso} · ${start} — ${end}`;
}

/* =========================
   Nya helpers som hooken behöver
   ========================= */

/** ISO-vecka: returnera veckans måndag (Date) för ett givet datum */
export function startOfISOWeek(d = new Date()): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (date.getDay() + 6) % 7; // 0=Mon ... 6=Sun
  date.setDate(date.getDate() - day);
  return date;
}

/** ISO-vecka: returnera veckans söndag (Date) */
export function endOfISOWeek(d = new Date()): Date {
  const s = startOfISOWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  return e;
}

/** Lista alla datum mellan start–slut (inklusive båda) som "YYYY-MM-DD" */
export function enumerateDates(start: Date, end: Date): string[] {
  const out: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    out.push(toLocalYYYYMMDD(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
