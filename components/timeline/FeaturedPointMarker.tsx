"use client";

import { memo, useState } from "react";
import type { TimelineEvent, Category } from "@/lib/types";
import {
  formatTimelineDateParts,
  parseTimelineDate,
} from "@/lib/date-utils";
import {
  getFeaturedCircleDiameter,
  getFeaturedLabelFontSize,
  getFeaturedMarkerOverflow,
  getFeaturedStemHeight,
} from "@/lib/featured-marker-size";
import { MIN_POINT_HIT_WIDTH } from "@/lib/timeline-point-hit";

interface FeaturedPointMarkerProps {
  event: TimelineEvent;
  category?: Category;
  x: number;
  width: number;
  top: number;
  eventHeight: number;
  floatTier: number;
  pixelsPerDay: number;
  onClick: () => void;
}

export const FeaturedPointMarker = memo(function FeaturedPointMarker({
  event,
  category,
  x,
  width,
  top,
  eventHeight,
  floatTier,
  pixelsPerDay,
  onClick,
}: FeaturedPointMarkerProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const color = category?.color ?? "#6366f1";
  const imageUrl = event.imageUrl?.trim() ?? "";

  const diameter = getFeaturedCircleDiameter(pixelsPerDay);
  const labelFontSize = getFeaturedLabelFontSize(diameter);
  const stemHeight = getFeaturedStemHeight(diameter);
  const stackOverflow = getFeaturedMarkerOverflow(
    diameter,
    labelFontSize,
    floatTier
  );

  const markerWidth = Math.max(width, 3);
  const centerX = x + markerWidth / 2;
  const hitWidth = Math.max(diameter + 8, MIN_POINT_HIT_WIDTH);
  const hitLeft = centerX - hitWidth / 2;

  const parsed = parseTimelineDate(event.startDate);
  const dateShort = parsed
    ? formatTimelineDateParts(parsed, "short")
    : event.startDate;

  const labelBlockHeight = labelFontSize * 2.6 + 4;
  const anchorSize = 5;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group absolute z-20 cursor-pointer overflow-visible hover:z-30 focus-visible:z-30"
      style={{
        left: hitLeft,
        width: hitWidth,
        top: top - stackOverflow,
        height: stackOverflow + eventHeight,
      }}
      aria-label={`${event.title}, ${dateShort}, featured`}
    >
      <span
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full ring-2 ring-white"
        style={{
          width: anchorSize,
          height: anchorSize,
          backgroundColor: color,
        }}
      />

      <span
        className="pointer-events-none absolute left-1/2 w-px -translate-x-1/2 bg-[var(--foreground)]/35"
        style={{
          bottom: anchorSize,
          height: stemHeight,
        }}
      />

      <span
        className="pointer-events-none absolute left-1/2 flex w-full -translate-x-1/2 flex-col items-center text-center leading-tight"
        style={{
          bottom: anchorSize + stemHeight + 2,
          fontSize: labelFontSize,
          maxWidth: Math.max(160, diameter + 48),
        }}
      >
        <span className="tabular-nums font-semibold text-[var(--foreground)]">
          {dateShort}
        </span>
        <span className="font-serif line-clamp-2 font-medium text-[var(--foreground)]">
          {event.title}
        </span>
      </span>

      <span
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-full bg-[var(--surface)] shadow-lg ring-[3px] ring-amber-400/85"
        style={{
          bottom: anchorSize + stemHeight + labelBlockHeight + 4,
          width: diameter,
          height: diameter,
        }}
      >
        {!imageFailed && imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover object-center"
            draggable={false}
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-lg font-bold text-white"
            style={{ backgroundColor: color }}
            aria-hidden
          >
            ★
          </span>
        )}
      </span>
    </button>
  );
});
