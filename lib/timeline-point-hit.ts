import type { TimelineEvent } from "./types";

/** Minimum click/tap target width for single-day (point) events. */
export const MIN_POINT_HIT_WIDTH = 44;

/** Max label bubble width for point events (matches TimelineEventBlock). */
export const POINT_LABEL_MAX_WIDTH = 140;

/** Rendered height of a point-event label bubble (px). */
export const POINT_LABEL_ROW_HEIGHT = 26;

/** Zoom level above which point events show labels above the pin. */
export const LABEL_ZOOM_THRESHOLD = 0.15;

export function isPointEvent(event: {
  startDate: string;
  endDate?: string;
}): boolean {
  return !event.endDate || event.endDate === event.startDate;
}

/** Horizontal hit target for a point marker (matches TimelineEventBlock). */
export function getPointHitRect(
  x: number,
  width: number
): { left: number; right: number } {
  const hitWidth = Math.max(width, MIN_POINT_HIT_WIDTH);
  const markerWidth = Math.max(width, 3);
  const hitLeft = x - (hitWidth - markerWidth) / 2;
  return { left: hitLeft, right: hitLeft + hitWidth };
}

/** Label footprint used for lane assignment when labels are visible. */
export function getPointLabelHitRect(
  x: number,
  width: number
): { left: number; right: number } {
  const markerWidth = Math.max(width, 3);
  const centerX = x + markerWidth / 2;
  const hitWidth = Math.max(MIN_POINT_HIT_WIDTH, POINT_LABEL_MAX_WIDTH);
  return { left: centerX - hitWidth / 2, right: centerX + hitWidth / 2 };
}

/** Hit rect for lane placement — widens to label footprint when labels show. */
export function getPointLaneHitRect(
  x: number,
  width: number,
  pixelsPerDay: number
): { left: number; right: number } {
  if (pixelsPerDay >= LABEL_ZOOM_THRESHOLD) {
    return getPointLabelHitRect(x, width);
  }
  return getPointHitRect(x, width);
}

export function pointHitRectsOverlap(
  a: { left: number; right: number },
  b: { left: number; right: number }
): boolean {
  return a.left < b.right && b.left < a.right;
}

export function laneHasPointHitCollision(
  hitRects: ({ left: number; right: number } | null)[],
  hitRect: { left: number; right: number }
): boolean {
  return hitRects.some(
    (occ) => occ && pointHitRectsOverlap(occ, hitRect)
  );
}

export type { TimelineEvent };
