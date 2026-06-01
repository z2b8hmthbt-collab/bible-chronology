import { useMemo } from "react";
import type { TimelineEvent, Background } from "./types";
import {
  getTimelineBounds,
  getEventStartDayIndex,
  getEventEndDayIndex,
  getDateDayIndex,
  dateToX,
} from "./date-utils";

export const MIN_PIXELS_PER_DAY_ABSOLUTE = 0.000001;
export const MAX_PIXELS_PER_DAY = 64;
export const DEFAULT_PIXELS_PER_DAY = 0.5;
export const ZOOM_FACTOR = 1.45;

/** @deprecated use clampZoom with dynamic min from fitAllPixelsPerDay */
export const MIN_PIXELS_PER_DAY = MIN_PIXELS_PER_DAY_ABSOLUTE;

export function clampZoom(
  pixelsPerDay: number,
  min = MIN_PIXELS_PER_DAY_ABSOLUTE,
  max = MAX_PIXELS_PER_DAY
): number {
  return Math.min(max, Math.max(min, pixelsPerDay));
}

/** Zoom level that fits the entire timeline span in the viewport. */
export function fitAllPixelsPerDay(
  totalDays: number,
  viewportWidth: number
): number {
  if (totalDays <= 0 || viewportWidth <= 0) return DEFAULT_PIXELS_PER_DAY;
  return clampZoom((viewportWidth * 1) / totalDays);
}

export function minPixelsPerDay(
  totalDays: number,
  viewportWidth: number
): number {
  return fitAllPixelsPerDay(totalDays, viewportWidth);
}

export function zoomIn(
  pixelsPerDay: number,
  min = MIN_PIXELS_PER_DAY_ABSOLUTE
): number {
  return clampZoom(pixelsPerDay * ZOOM_FACTOR, min);
}

export function zoomOut(
  pixelsPerDay: number,
  min = MIN_PIXELS_PER_DAY_ABSOLUTE
): number {
  return clampZoom(pixelsPerDay / ZOOM_FACTOR, min);
}

export interface LayoutEvent {
  event: TimelineEvent;
  x: number;
  width: number;
  lane: number;
}

export interface LayoutBackground {
  background: Background;
  x: number;
  width: number;
}

export interface TimelineLayout {
  timelineStartDay: number;
  timelineEndDay: number;
  totalWidth: number;
  pixelsPerDay: number;
  events: LayoutEvent[];
  backgrounds: LayoutBackground[];
  laneCount: number;
}

function eventsOverlap(a: TimelineEvent, b: TimelineEvent): boolean {
  const aStart = getEventStartDayIndex(a);
  const aEnd = getEventEndDayIndex(a);
  const bStart = getEventStartDayIndex(b);
  const bEnd = getEventEndDayIndex(b);
  return aStart <= bEnd && bStart <= aEnd;
}

function assignLanes(events: TimelineEvent[]): Map<string, number> {
  const sorted = [...events].sort(
    (a, b) => getEventStartDayIndex(a) - getEventStartDayIndex(b)
  );

  const lanes: TimelineEvent[][] = [];
  const laneMap = new Map<string, number>();

  for (const event of sorted) {
    let assigned = -1;
    for (let i = 0; i < lanes.length; i++) {
      const lastInLane = lanes[i][lanes[i].length - 1];
      if (!eventsOverlap(lastInLane, event)) {
        assigned = i;
        break;
      }
    }
    if (assigned === -1) {
      assigned = lanes.length;
      lanes.push([]);
    }
    lanes[assigned].push(event);
    laneMap.set(event.id, assigned);
  }

  return laneMap;
}

export function computeTimelineLayout(
  events: TimelineEvent[],
  backgrounds: Background[],
  pixelsPerDay: number,
  paddingDays = 30
): TimelineLayout {
  const bounds = getTimelineBounds(events, backgrounds);
  const timelineStartDay = bounds.startDay - paddingDays;
  const timelineEndDay = bounds.endDay + paddingDays;
  const totalDays = timelineEndDay - timelineStartDay;
  const totalWidth = totalDays * pixelsPerDay;

  const laneMap = assignLanes(events);
  const maxLane = events.length > 0 ? Math.max(...laneMap.values()) + 1 : 1;

  const layoutEvents: LayoutEvent[] = events.map((event) => {
    const startDay = getEventStartDayIndex(event);
    const endDay = getEventEndDayIndex(event);
    const x = dateToX(startDay, timelineStartDay, pixelsPerDay);
    const endX = dateToX(endDay, timelineStartDay, pixelsPerDay);
    const width = Math.max(endX - x + pixelsPerDay, pixelsPerDay * 0.8);

    return {
      event,
      x,
      width,
      lane: laneMap.get(event.id) ?? 0,
    };
  });

  const layoutBackgrounds: LayoutBackground[] = backgrounds.map((bg) => {
    const startDay = getDateDayIndex(bg.startDate) ?? timelineStartDay;
    const endDay = getDateDayIndex(bg.endDate) ?? startDay;
    const x = dateToX(startDay, timelineStartDay, pixelsPerDay);
    const endX = dateToX(endDay, timelineStartDay, pixelsPerDay);
    const width = Math.max(endX - x + pixelsPerDay, pixelsPerDay);
    return { background: bg, x, width };
  });

  return {
    timelineStartDay,
    timelineEndDay,
    totalWidth,
    pixelsPerDay,
    events: layoutEvents,
    backgrounds: layoutBackgrounds,
    laneCount: maxLane,
  };
}

export function useTimelineLayout(
  events: TimelineEvent[],
  backgrounds: Background[],
  pixelsPerDay: number
): TimelineLayout {
  const ppd = clampZoom(pixelsPerDay);

  return useMemo(
    () => computeTimelineLayout(events, backgrounds, ppd),
    [events, backgrounds, ppd]
  );
}

export function sortVisibleEventsForRender(
  events: LayoutEvent[]
): LayoutEvent[] {
  const sorted = [...events];
  sorted.sort((a, b) => {
    const aPoint =
      !a.event.endDate || a.event.endDate === a.event.startDate;
    const bPoint =
      !b.event.endDate || b.event.endDate === b.event.startDate;
    if (aPoint === bPoint) return 0;
    return aPoint ? 1 : -1;
  });
  return sorted;
}

export function filterVisibleEvents(
  layout: TimelineLayout,
  scrollLeft: number,
  viewportWidth: number,
  buffer = 200
): LayoutEvent[] {
  const minX = scrollLeft - buffer;
  const maxX = scrollLeft + viewportWidth + buffer;

  return layout.events.filter(
    (e) => e.x + e.width >= minX && e.x <= maxX
  );
}

export function filterVisibleBackgrounds(
  layout: TimelineLayout,
  scrollLeft: number,
  viewportWidth: number,
  buffer = 200
): LayoutBackground[] {
  const minX = scrollLeft - buffer;
  const maxX = scrollLeft + viewportWidth + buffer;

  return layout.backgrounds.filter(
    (b) => b.x + b.width >= minX && b.x <= maxX
  );
}
