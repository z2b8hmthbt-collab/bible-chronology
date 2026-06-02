import type { TimelineEvent } from "./types";

/** Minimum click/tap target width for single-day (point) events. */
export const MIN_POINT_HIT_WIDTH = 44;

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
