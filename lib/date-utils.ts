export interface TimelineDateParts {
  year: number; // negative = BC, positive = AD (no year 0)
  month: number;
  day: number;
}

/** Astronomical year for Gregorian day-index math (1 BC → 0, 2 BC → -1). */
function toAstroYear(year: number): number {
  return year >= 1 ? year : year + 1;
}

/** Proleptic Gregorian day index (compatible with negative / BC years). */
export function timelineDateToDayIndex(d: TimelineDateParts): number {
  const y = toAstroYear(d.year);
  const a = Math.floor((14 - d.month) / 12);
  const y2 = y + 4800 - a;
  const m = d.month + 12 * a - 3;
  return (
    d.day +
    Math.floor((153 * m + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045
  );
}

export function dayIndexToTimelineDate(jdn: number): TimelineDateParts {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const astroYear = 100 * b + d - 4800 + Math.floor(m / 10);
  const year = astroYear >= 1 ? astroYear : astroYear - 1;
  return { year, month, day };
}

export function formatTimelineDateParts(
  d: TimelineDateParts,
  style: "short" | "medium" = "medium"
): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  if (d.year < 0) {
    const bc = Math.abs(d.year);
    if (style === "short") return `${bc} BC`;
    return `${months[d.month - 1]} ${d.day}, ${bc} BC`;
  }

  if (style === "short") return `${d.year}`;
  return `${months[d.month - 1]} ${d.day}, ${d.year}`;
}

export function formatPartsToStorage(parts: TimelineDateParts): string {
  const y =
    parts.year < 0
      ? `-${String(Math.abs(parts.year)).padStart(4, "0")}`
      : String(parts.year).padStart(4, "0");
  const m = String(parts.month).padStart(2, "0");
  const d = String(parts.day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function compareTimelineDates(a: string, b: string): number {
  const da = getDateDayIndex(a);
  const db = getDateDayIndex(b);
  if (da == null && db == null) return 0;
  if (da == null) return -1;
  if (db == null) return 1;
  return da - db;
}

/** Parse stored or imported date strings (ISO, BC/AD, Tiki-Toki). */
export function parseTimelineDate(value: string): TimelineDateParts | null {
  if (!value) return null;
  const trimmed = value.trim();

  // Tiki-Toki: "4300 BC-01-01 00:00:00"
  const bcMatch = trimmed.match(/^(\d+)\s*BC-(\d{2})-(\d{2})/i);
  if (bcMatch) {
    return {
      year: -parseInt(bcMatch[1], 10),
      month: parseInt(bcMatch[2], 10),
      day: parseInt(bcMatch[3], 10),
    };
  }

  // Stored BC: "-4300-01-01"
  const negMatch = trimmed.match(/^(-\d{1,5})-(\d{2})-(\d{2})/);
  if (negMatch) {
    return {
      year: parseInt(negMatch[1], 10),
      month: parseInt(negMatch[2], 10),
      day: parseInt(negMatch[3], 10),
    };
  }

  // AD / ISO: "0033-01-01" or "2024-05-28"
  const isoMatch = trimmed.match(/^(\d{1,4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      month: parseInt(isoMatch[2], 10),
      day: parseInt(isoMatch[3], 10),
    };
  }

  // MM/DD/YYYY
  const slashMatch = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (slashMatch) {
    return {
      year: parseInt(slashMatch[3], 10),
      month: parseInt(slashMatch[1], 10),
      day: parseInt(slashMatch[2], 10),
    };
  }

  return null;
}

/** Normalize any supported date string to storage format (YYYY-MM-DD or -YYYY-MM-DD). */
export function normalizeTimelineDate(value: string): string {
  const parsed = parseTimelineDate(value);
  if (!parsed) return "";

  const y =
    parsed.year < 0
      ? `-${String(Math.abs(parsed.year)).padStart(4, "0")}`
      : String(parsed.year).padStart(4, "0");
  const m = String(parsed.month).padStart(2, "0");
  const d = String(parsed.day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatTimelineDate(value: string): string {
  const parsed = parseTimelineDate(value);
  if (!parsed) return value;
  return formatTimelineDateParts(parsed);
}

export function getDateDayIndex(value: string): number | null {
  const parsed = parseTimelineDate(value);
  if (!parsed) return null;
  return timelineDateToDayIndex(parsed);
}

export function getEventStartDayIndex(event: { startDate: string }): number {
  return getDateDayIndex(event.startDate) ?? 0;
}

export function getEventEndDayIndex(event: {
  startDate: string;
  endDate?: string;
}): number {
  const start = getDateDayIndex(event.startDate);
  if (!event.endDate) return start ?? 0;
  const end = getDateDayIndex(event.endDate);
  if (start != null && end != null && end >= start) return end;
  return start ?? 0;
}

export function getTimelineBounds(
  events: { startDate: string; endDate?: string }[],
  backgrounds: { startDate: string; endDate: string }[]
): { startDay: number; endDay: number } {
  const days: number[] = [];

  for (const e of events) {
    const s = getDateDayIndex(e.startDate);
    if (s != null) days.push(s);
    days.push(getEventEndDayIndex(e));
  }

  for (const b of backgrounds) {
    const s = getDateDayIndex(b.startDate);
    const e = getDateDayIndex(b.endDate);
    if (s != null) days.push(s);
    if (e != null) days.push(e);
  }

  if (days.length === 0) {
    const now = new Date();
    const today = parseTimelineDate(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    );
    const idx = today ? timelineDateToDayIndex(today) : 0;
    return { startDay: idx - 365, endDay: idx + 365 };
  }

  return {
    startDay: Math.min(...days),
    endDay: Math.max(...days),
  };
}

export function dateToX(
  dayIndex: number,
  timelineStartDay: number,
  pixelsPerDay: number
): number {
  return (dayIndex - timelineStartDay) * pixelsPerDay;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Legacy aliases used by forms
export function parseDate(value: string): TimelineDateParts | null {
  return parseTimelineDate(value);
}

export function formatDateInput(value: string): string {
  return normalizeTimelineDate(value) || value;
}
