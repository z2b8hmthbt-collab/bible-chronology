import {
  dayIndexToTimelineDate,
  formatTimelineDateParts,
  timelineDateToDayIndex,
} from "./date-utils";

const YEAR_DAYS = 365.25;

const NICE_INTERVALS_DAYS = [
  1,
  7,
  14,
  30,
  60,
  91,
  182,
  Math.round(YEAR_DAYS),
  Math.round(2 * YEAR_DAYS),
  Math.round(5 * YEAR_DAYS),
  Math.round(10 * YEAR_DAYS),
  Math.round(25 * YEAR_DAYS),
  Math.round(50 * YEAR_DAYS),
  Math.round(100 * YEAR_DAYS),
  Math.round(250 * YEAR_DAYS),
  Math.round(500 * YEAR_DAYS),
  Math.round(1000 * YEAR_DAYS),
  Math.round(2500 * YEAR_DAYS),
  Math.round(5000 * YEAR_DAYS),
  Math.round(10000 * YEAR_DAYS),
];

/** Day index for 1 Jan 1 AD — BC/AD boundary marker. */
export const AD1_DAY_INDEX = timelineDateToDayIndex({
  year: 1,
  month: 1,
  day: 1,
});

export function getMajorTickIntervalDays(pixelsPerDay: number): number {
  const targetPx = 90;
  const minDays = targetPx / Math.max(pixelsPerDay, 0.000001);

  for (const days of NICE_INTERVALS_DAYS) {
    if (days >= minDays) return days;
  }

  return NICE_INTERVALS_DAYS[NICE_INTERVALS_DAYS.length - 1];
}

export function getMinorTickIntervalDays(majorIntervalDays: number): number {
  if (majorIntervalDays <= 1) return 1;
  if (majorIntervalDays <= 7) return 1;
  if (majorIntervalDays <= 30) return Math.max(1, Math.round(majorIntervalDays / 4));
  if (majorIntervalDays <= 365) return Math.max(1, Math.round(majorIntervalDays / 4));
  return Math.round(majorIntervalDays / 5);
}

export interface TimelineTick {
  x: number;
  dayIndex: number;
  label: string;
  major: boolean;
}

export interface VisibleTickRange {
  startDayOffset: number;
  endDayOffset: number;
}

export function getTimelineTicks(
  timelineStartDay: number,
  timelineEndDay: number,
  pixelsPerDay: number,
  visibleRange?: VisibleTickRange
): TimelineTick[] {
  const totalDays = timelineEndDay - timelineStartDay;
  const majorInterval = getMajorTickIntervalDays(pixelsPerDay);
  const majorPx = majorInterval * pixelsPerDay;
  const minorInterval =
    majorPx >= 120 ? getMinorTickIntervalDays(majorInterval) : majorInterval;
  const useMinor = minorInterval < majorInterval;

  const rangeStart = visibleRange
    ? Math.max(0, visibleRange.startDayOffset)
    : 0;
  const rangeEnd = visibleRange
    ? Math.min(totalDays, visibleRange.endDayOffset)
    : totalDays;

  const ticks: TimelineTick[] = [];
  const seen = new Set<number>();

  const pushMajor = (dayOffset: number) => {
    if (dayOffset < 0 || dayOffset > totalDays) return;
    const dayIndex = timelineStartDay + dayOffset;
    if (seen.has(dayIndex)) return;
    seen.add(dayIndex);
    const parts = dayIndexToTimelineDate(dayIndex);
    ticks.push({
      x: dayOffset * pixelsPerDay,
      dayIndex,
      label: formatTimelineDateParts(parts, "short"),
      major: true,
    });
  };

  // Major labels always follow the major grid (do not rely on minor step alignment).
  const majorStart = Math.floor(rangeStart / majorInterval) * majorInterval;
  for (let d = majorStart; d <= rangeEnd; d += majorInterval) {
    pushMajor(d);
  }

  if (useMinor) {
    const minorStart = Math.floor(rangeStart / minorInterval) * minorInterval;
    for (let d = minorStart; d <= rangeEnd; d += minorInterval) {
      if (d % majorInterval === 0) continue;
      const dayIndex = timelineStartDay + d;
      if (seen.has(dayIndex)) continue;
      ticks.push({
        x: d * pixelsPerDay,
        dayIndex,
        label: "",
        major: false,
      });
    }
  }

  ticks.sort((a, b) => a.x - b.x);
  return ticks;
}

export function getVisibleDayRange(
  timelineStartDay: number,
  pixelsPerDay: number,
  scrollLeft: number,
  viewportWidth: number,
  bufferPx = 200
): VisibleTickRange {
  const startDayOffset = Math.max(
    0,
    Math.floor((scrollLeft - bufferPx) / Math.max(pixelsPerDay, 0.000001))
  );
  const endDayOffset = Math.ceil(
    (scrollLeft + viewportWidth + bufferPx) / Math.max(pixelsPerDay, 0.000001)
  );

  return { startDayOffset, endDayOffset };
}

export function getAdMarkerX(
  timelineStartDay: number,
  timelineEndDay: number,
  pixelsPerDay: number
): number | null {
  if (AD1_DAY_INDEX < timelineStartDay || AD1_DAY_INDEX > timelineEndDay) {
    return null;
  }
  return (AD1_DAY_INDEX - timelineStartDay) * pixelsPerDay;
}
