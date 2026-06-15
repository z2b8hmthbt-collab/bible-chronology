"use client";

import { memo, useCallback, useRef } from "react";
import type { TimelineEvent, Background, Category } from "@/lib/types";
import type { ScrollStore } from "@/lib/scroll-store";
import { useScrollStore } from "@/lib/use-scroll-store";
import {
  getEventStartDayIndex,
  getEventEndDayIndex,
  getDateDayIndex,
} from "@/lib/date-utils";
import { getAdMarkerX } from "@/lib/timeline-ticks";
import { colorWithAlpha } from "@/lib/color-utils";
import { getPrimaryCategoryId } from "@/lib/event-categories";

interface TimelineMinimapProps {
  events: TimelineEvent[];
  backgrounds: Background[];
  categories: Category[];
  timelineStartDay: number;
  timelineEndDay: number;
  pixelsPerDay: number;
  totalWidth: number;
  scrollStore: ScrollStore;
  viewportWidth: number;
  onScrollTo: (scrollLeft: number) => void;
}

export const TimelineMinimap = memo(function TimelineMinimap({
  events,
  backgrounds,
  categories,
  timelineStartDay,
  timelineEndDay,
  pixelsPerDay,
  totalWidth,
  scrollStore,
  viewportWidth,
  onScrollTo,
}: TimelineMinimapProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const totalDays = timelineEndDay - timelineStartDay;

  const navigate = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || totalWidth <= 0) return;
      const rect = track.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const target = ratio * totalWidth - viewportWidth / 2;
      const maxScroll = Math.max(0, totalWidth - viewportWidth);
      onScrollTo(Math.max(0, Math.min(target, maxScroll)));
    },
    [totalWidth, viewportWidth, onScrollTo]
  );

  if (totalDays <= 0 || totalWidth <= 0) return null;

  const scale = (dayOffset: number) => (dayOffset / totalDays) * 100;

  const adX = getAdMarkerX(timelineStartDay, timelineEndDay, pixelsPerDay);
  const adPct = adX != null ? (adX / totalWidth) * 100 : null;

  return (
    <div className="shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
      <div
        ref={trackRef}
        className="relative h-7 w-full cursor-pointer overflow-hidden rounded-md bg-[var(--background)] ring-1 ring-[var(--border)]"
        onClick={(e) => navigate(e.clientX)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(
              trackRef.current!.getBoundingClientRect().left +
                trackRef.current!.clientWidth / 2
            );
          }
        }}
        role="slider"
        aria-label="Timeline overview"
        tabIndex={0}
      >
        {backgrounds.map((bg) => {
          const start = getDateDayIndex(bg.startDate);
          const end = getDateDayIndex(bg.endDate);
          if (start == null || end == null) return null;
          const left = scale(start - timelineStartDay);
          const width = scale(end - start + 1);
          return (
            <div
              key={bg.id}
              className="absolute top-0 h-full bg-indigo-400/20"
              style={{ left: `${left}%`, width: `${Math.max(width, 0.2)}%` }}
            />
          );
        })}

        {events.map((event) => {
          const start = getEventStartDayIndex(event);
          const end = getEventEndDayIndex(event);
          const category = categories.find(
            (c) => c.id === getPrimaryCategoryId(event)
          );
          const color = category?.color ?? "#6366f1";
          const isPoint = !event.endDate || event.endDate === event.startDate;
          const left = scale(start - timelineStartDay);
          const width = isPoint ? 0.35 : scale(Math.max(end - start, 1));

          return (
            <div
              key={event.id}
              className={`absolute top-1/2 -translate-y-1/2 ${
                isPoint ? "h-1.5 w-1.5 rounded-full" : "h-2 rounded-sm"
              } ${event.featured ? "ring-1 ring-amber-400" : ""}`}
              style={{
                left: `${left}%`,
                width: isPoint ? undefined : `${Math.max(width, 0.25)}%`,
                backgroundColor: colorWithAlpha(
                  color,
                  event.featured ? 1 : 0.85
                ),
              }}
            />
          );
        })}

        {adPct != null && (
          <div
            className="absolute top-0 h-full w-px bg-amber-500/80"
            style={{ left: `${adPct}%` }}
          />
        )}

        <MinimapViewport
          scrollStore={scrollStore}
          totalWidth={totalWidth}
          viewportWidth={viewportWidth}
        />
      </div>
    </div>
  );
});

function MinimapViewport({
  scrollStore,
  totalWidth,
  viewportWidth,
}: {
  scrollStore: ScrollStore;
  totalWidth: number;
  viewportWidth: number;
}) {
  const scrollLeft = useScrollStore(scrollStore);
  const viewportLeft =
    totalWidth > 0 ? (scrollLeft / totalWidth) * 100 : 0;
  const viewportWidthPct =
    totalWidth > 0 ? (viewportWidth / totalWidth) * 100 : 100;

  return (
    <div
      className="absolute top-0 h-full rounded-sm border border-indigo-500/60 bg-indigo-500/10"
      style={{
        left: `${viewportLeft}%`,
        width: `${Math.min(viewportWidthPct, 100 - viewportLeft)}%`,
      }}
      aria-hidden
    />
  );
}
