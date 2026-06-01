"use client";

import { memo, useCallback } from "react";
import type { TimelineEvent, Category } from "@/lib/types";
import { formatTimelineDate } from "@/lib/date-utils";
import { colorWithAlpha } from "@/lib/color-utils";
import { useTimelineStore } from "@/lib/store";

const MIN_TAP_WIDTH = 44;
const LABEL_INSIDE_MIN = 56;
const LABEL_ZOOM_THRESHOLD = 0.15;
const FEATURED_LABEL_ZOOM_THRESHOLD = 0.05;

/** True when this event reads scrollLeft for sticky in-span labels. */
export function eventUsesStickyScrollLeft(
  event: TimelineEvent,
  width: number
): boolean {
  const isPoint = !event.endDate || event.endDate === event.startDate;
  if (isPoint) return false;
  const featured = Boolean(event.featured);
  const min = featured ? LABEL_INSIDE_MIN - 12 : LABEL_INSIDE_MIN;
  return width >= min;
}

interface TimelineEventBlockProps {
  event: TimelineEvent;
  category?: Category;
  x: number;
  width: number;
  top: number;
  eventHeight?: number;
  labelHeight?: number;
  pixelsPerDay: number;
  scrollLeft?: number;
}

export const TimelineEventBlock = memo(function TimelineEventBlock({
  event,
  category,
  x,
  width,
  top,
  eventHeight = 36,
  labelHeight = 18,
  pixelsPerDay,
  scrollLeft = 0,
}: TimelineEventBlockProps) {
  const setDetailItem = useTimelineStore((s) => s.setDetailItem);

  const handleClick = useCallback(() => {
    setDetailItem({ type: "event", data: event });
  }, [event, setDetailItem]);
  const color = category?.color ?? "#6366f1";
  const isPoint = !event.endDate || event.endDate === event.startDate;
  const featured = Boolean(event.featured);
  const labelThreshold = featured
    ? FEATURED_LABEL_ZOOM_THRESHOLD
    : LABEL_ZOOM_THRESHOLD;
  const showLabelsAbove = pixelsPerDay >= labelThreshold;
  const showLabelInside =
    !isPoint && width >= (featured ? LABEL_INSIDE_MIN - 12 : LABEL_INSIDE_MIN);
  const showLabelAbove =
    showLabelsAbove && (isPoint || width < LABEL_INSIDE_MIN || featured);

  const pinSize = featured ? 12 : 10;
  const hitWidth = Math.max(width, isPoint ? MIN_TAP_WIDTH : 24);
  const hitLeft = isPoint ? x - (hitWidth - Math.max(width, 3)) / 2 : x;
  const markerWidth = isPoint ? Math.max(width, 3) : width;

  const blockWithLabelHeight = eventHeight + labelHeight;
  const pinBottom = Math.round(eventHeight * 0.36);
  const stickBottom = Math.round(eventHeight * 0.5);
  const stickHeight = Math.round(eventHeight * 0.28);

  // Keep the span's title pinned to the visible left edge while scrolling,
  // so long bars stay identifiable instead of losing their label off-screen.
  const stickyLabelLeft = Math.max(0, scrollLeft - x) + 6;

  const dateLabel = formatTimelineDate(event.startDate);

  return (
    <button
      onClick={handleClick}
      className={`group absolute cursor-pointer hover:z-30 focus-visible:z-30 ${
        isPoint ? "z-20" : "z-[1]"
      }`}
      style={{
        left: hitLeft,
        width: hitWidth,
        top: top - (showLabelAbove ? labelHeight : 0),
        height: showLabelAbove ? blockWithLabelHeight : eventHeight,
        paddingTop: showLabelAbove ? labelHeight : 0,
      }}
      aria-label={`${event.title}, ${dateLabel}${featured ? ", featured" : ""}`}
    >
      {showLabelAbove && (
        <span
          className={`font-serif pointer-events-none absolute left-1/2 top-0 max-w-[140px] -translate-x-1/2 truncate rounded-md bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-medium leading-tight text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)] transition group-hover:scale-105 group-hover:ring-indigo-400 group-hover:shadow-md group-focus-visible:scale-105 group-focus-visible:ring-indigo-400 ${
            featured ? "ring-amber-400/50" : ""
          }`}
          style={{ borderBottom: `2px solid ${color}` }}
        >
          {featured && <span className="mr-0.5 text-amber-500">★</span>}
          {event.title}
        </span>
      )}

      {isPoint ? (
        <>
          <span
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full shadow-sm transition group-hover:scale-125 group-hover:shadow-md group-hover:brightness-110 group-focus-visible:scale-125 active:scale-[0.98] ${
              featured
                ? "border-2 border-white ring-2 ring-amber-400/80"
                : "border-2 border-white"
            }`}
            style={{
              width: pinSize,
              height: pinSize,
              backgroundColor: color,
              bottom: pinBottom,
            }}
          />
          <span
            className="pointer-events-none absolute left-1/2 w-0.5 -translate-x-1/2 rounded-full"
            style={{ height: stickHeight, bottom: stickBottom, backgroundColor: color }}
          />
        </>
      ) : (
        <span
          className={`absolute bottom-0 left-0 block overflow-hidden rounded-md border border-black/5 text-left text-xs font-medium shadow-sm transition group-hover:shadow-md group-hover:ring-2 group-hover:ring-indigo-400/60 group-hover:brightness-105 group-focus-visible:ring-2 group-focus-visible:ring-indigo-400/60 active:scale-[0.98] ${
            featured ? "ring-1 ring-amber-400/60" : ""
          }`}
          style={{
            width: markerWidth,
            height: eventHeight,
            left: (hitWidth - markerWidth) / 2,
            backgroundColor: colorWithAlpha(color, 0.22),
            borderLeft: `3px solid ${color}`,
            color: "var(--foreground)",
          }}
        >
          {showLabelInside && (
            <span
              className="font-serif pointer-events-none absolute top-1/2 -translate-y-1/2 truncate"
              style={{
                left: stickyLabelLeft,
                maxWidth: Math.max(24, markerWidth - stickyLabelLeft - 6),
              }}
            >
              {event.title}
            </span>
          )}
        </span>
      )}

      {!showLabelInside && !showLabelAbove && (
        <span className="font-serif pointer-events-none absolute bottom-full left-1/2 z-30 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:block">
          {featured && <span className="text-amber-400">★ </span>}
          {event.title}
          <span className="mx-1 text-neutral-400">·</span>
          <span className="tabular-nums">{dateLabel}</span>
        </span>
      )}
    </button>
  );
});
