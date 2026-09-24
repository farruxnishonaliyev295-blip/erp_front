export const UZ_MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

export const UZ_DAYS: Record<string, string> = {
  MONDAY: "Du",
  TUESDAY: "Se",
  WEDNESDAY: "Ch",
  THURSDAY: "Pa",
  FRIDAY: "Ju",
  SATURDAY: "Sh",
  SUNDAY: "Ya",
};

export function formatDate(d?: string | Date | null): string {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.getDate() + " " + UZ_MONTHS[dt.getMonth()] + ", " + dt.getFullYear();
}

export function timeOf(d?: string | Date | null): string {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return String(dt.getHours()).padStart(2, "0") + ":" + String(dt.getMinutes()).padStart(2, "0");
}

export function formatDateTime(d?: string | Date | null): string {
  if (!d) return "—";
  return formatDate(d) + " • " + timeOf(d);
}

export function timeRange(start?: string | null, end?: string | null): string {
  if (!start) return "—";
  const s = String(start).slice(0, 5);
  if (!end) return s;
  return s + " - " + String(end).slice(0, 5);
}

export function weekDaysShort(days?: Array<{ weekDay: string }>): string {
  if (!days || days.length === 0) return "—";
  return days.map((d) => UZ_DAYS[d.weekDay] || d.weekDay).join(", ");
}

export function formatMoney(v: number | string): string {
  const n = Number(v);
  return (isNaN(n) ? 0 : n).toLocaleString("uz-UZ") + " so'm";
}

export function initialsOf(first?: string | null, last?: string | null): string {
  const s = ((first || "").charAt(0) + (last || "").charAt(0)).toUpperCase();
  return s || "?";
}
