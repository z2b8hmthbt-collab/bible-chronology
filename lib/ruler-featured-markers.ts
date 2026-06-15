import type { TimelineEvent } from "./types";
import { dateToX, getEventStartDayIndex } from "./date-utils";
import { getVisibleDayRange } from "./timeline-ticks";

export interface FeaturedRulerMarker {
  event: TimelineEvent;
  x: number;
}

/** Featured events whose start date falls in the visible ruler band. */
export function getVisibleFeaturedRulerMarkers(
  events: TimelineEvent[],
  timelineStartDay: number,
  pixelsPerDay: number,
  scrollLeft: number,
  viewportWidth: number,
  bufferPx = 200
): FeaturedRulerMarker[] {
  const { startDayOffset, endDayOffset } = getVisibleDayRange(
    timelineStartDay,
    pixelsPerDay,
    scrollLeft,
    viewportWidth,
    bufferPx
  );
  const minDay = timelineStartDay + startDayOffset;
  const maxDay = timelineStartDay + endDayOffset;

  return events
    .filter((event) => event.featured)
    .map((event) => ({
      event,
      x: dateToX(getEventStartDayIndex(event), timelineStartDay, pixelsPerDay),
      dayIndex: getEventStartDayIndex(event),
    }))
    .filter(({ dayIndex }) => dayIndex >= minDay && dayIndex <= maxDay)
    .sort((a, b) => a.x - b.x)
    .map(({ event, x }) => ({ event, x }));
}
