import type { TimelineEvent } from "./types";
import { isPointEvent } from "./timeline-point-hit";

const MIN_DIAMETER = 52;
const MAX_DIAMETER = 132;
const BASE_DIAMETER = 56;
/** Matches DEFAULT_PIXELS_PER_DAY in timeline-layout. */
const REF_PIXELS_PER_DAY = 0.5;

/** Featured + image + single-day → circular timeline marker. */
export function usesFeaturedCircle(event: TimelineEvent): boolean {
  return (
    Boolean(event.featured) &&
    Boolean(event.imageUrl?.trim()) &&
    isPointEvent(event)
  );
}

export function getFeaturedCircleDiameter(pixelsPerDay: number): number {
  const ratio = pixelsPerDay / REF_PIXELS_PER_DAY;
  // Slightly gentler than linear so zoom-in does not explode too fast.
  const scaled = BASE_DIAMETER * Math.pow(ratio, 0.42);
  return Math.round(Math.min(MAX_DIAMETER, Math.max(MIN_DIAMETER, scaled)));
}

export function getFeaturedLabelFontSize(diameter: number): number {
  return Math.round(Math.min(14, Math.max(10, diameter * 0.13)));
}

export function getFeaturedStemHeight(diameter: number): number {
  return Math.max(8, Math.round(diameter * 0.18));
}

/** Single stack: circle + label block + stem (excluding lane anchor). */
export function getFeaturedMarkerStackHeight(
  diameter: number,
  labelFontSize: number
): number {
  const labelBlock = labelFontSize * 2.6 + 6;
  return diameter + labelBlock + getFeaturedStemHeight(diameter) + 4;
}

/** Total height above the lane row baseline for one marker at a float tier. */
export function getFeaturedMarkerOverflow(
  diameter: number,
  labelFontSize: number,
  floatTier: number
): number {
  const stack = getFeaturedMarkerStackHeight(diameter, labelFontSize);
  const tierGap = 8;
  return stack + floatTier * (stack + tierGap);
}

export function getMaxFeaturedFloatTier(
  events: { event: TimelineEvent; floatTier?: number }[]
): number {
  let max = 0;
  for (const entry of events) {
    if (!usesFeaturedCircle(entry.event)) continue;
    max = Math.max(max, entry.floatTier ?? 0);
  }
  return max;
}
