"use client";

import {
  getTimelineTicks,
  getAdMarkerX,
  getVisibleDayRange,
} from "@/lib/timeline-ticks";

interface TimelineGridProps {
  timelineStartDay: number;
  timelineEndDay: number;
  pixelsPerDay: number;
  totalWidth: number;
  height: number;
  scrollLeft: number;
  viewportWidth: number;
}

export function TimelineGrid({
  timelineStartDay,
  timelineEndDay,
  pixelsPerDay,
  totalWidth,
  height,
  scrollLeft,
  viewportWidth,
}: TimelineGridProps) {
  const visibleRange = getVisibleDayRange(
    timelineStartDay,
    pixelsPerDay,
    scrollLeft,
    viewportWidth
  );
  const ticks = getTimelineTicks(
    timelineStartDay,
    timelineEndDay,
    pixelsPerDay,
    visibleRange
  );
  const adX = getAdMarkerX(timelineStartDay, timelineEndDay, pixelsPerDay);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{ width: totalWidth, height }}
      aria-hidden
    >
      {ticks.map((tick) => (
        <div
          key={`${tick.major ? "major" : "minor"}-${tick.dayIndex}`}
          className={`absolute top-0 ${
            tick.major
              ? "w-px bg-[var(--border)]/80"
              : "w-px bg-[var(--border)]/35"
          }`}
          style={{ left: tick.x, height }}
        />
      ))}

      {/* BC / AD boundary line (labels live in the date ruler) */}
      {adX != null && (
        <div
          className="absolute top-0 w-0.5 bg-amber-500/70"
          style={{ left: adX, height }}
        />
      )}
    </div>
  );
}
