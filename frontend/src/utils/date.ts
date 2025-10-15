export function toLocalYYYYMMDD(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function clampToToday(yyyyMmDd: string, today = toLocalYYYYMMDD()): string {
  return yyyyMmDd > today ? today : yyyyMmDd;
}
