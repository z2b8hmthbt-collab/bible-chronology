import {
  dayIndexToTimelineDate,
  formatTimelineDateParts,
  timelineDateToDayIndex,
} from "./date-utils";

const YEAR_DAYS = 365.25;
const TARGET_MARKER_COUNT = 7;
const NICE_YEAR_INTERVALS = [
  1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000,
];

export interface MinimapYearMarker {
  year: number;
  dayIndex: number;
  leftPct: number;
  label: string;
}

function getYearInterval(totalDays: number): number {
  const targetYears = totalDays / YEAR_DAYS / TARGET_MARKER_COUNT;
  return (
    NICE_YEAR_INTERVALS.find((interval) => interval >= targetYears) ??
    NICE_YEAR_INTERVALS[NICE_YEAR_INTERVALS.length - 1]
  );
}

function firstAlignedYear(startYear: number, interval: number): number {
  const aligned = Math.ceil(startYear / interval) * interval;
  return aligned === 0 ? 1 : aligned;
}

export function getMinimapYearMarkers(
  timelineStartDay: number,
  timelineEndDay: number
): MinimapYearMarker[] {
  const totalDays = timelineEndDay - timelineStartDay;
  if (totalDays <= 0) return [];

  const startYear = dayIndexToTimelineDate(timelineStartDay).year;
  const endYear = dayIndexToTimelineDate(timelineEndDay).year;
  const interval = getYearInterval(totalDays);
  const totalWidthDays = Math.max(totalDays, 1);
  const markers: MinimapYearMarker[] = [];
  const seenYears = new Set<number>();

  let rawYear = firstAlignedYear(startYear, interval);
  while (rawYear <= endYear) {
    const markerYear = rawYear === 0 ? 1 : rawYear;
    if (seenYears.has(markerYear)) {
      rawYear += interval;
      continue;
    }
    seenYears.add(markerYear);

    const dayIndex = timelineDateToDayIndex({
      year: markerYear,
      month: 1,
      day: 1,
    });
    if (dayIndex >= timelineStartDay && dayIndex <= timelineEndDay) {
      markers.push({
        year: markerYear,
        dayIndex,
        leftPct: ((dayIndex - timelineStartDay) / totalWidthDays) * 100,
        label:
          markerYear === 1
            ? "AD 1"
            : formatTimelineDateParts(
                { year: markerYear, month: 1, day: 1 },
                "short"
              ),
      });
    }

    rawYear += interval;
  }

  return markers;
}
