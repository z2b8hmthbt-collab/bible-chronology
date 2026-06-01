"use client";

import { memo, type RefObject } from "react";
import { useElementScrollLeft } from "@/lib/use-element-scroll-left";
import { TimelineRuler } from "./TimelineRuler";
import type { TimelineLayout } from "@/lib/timeline-layout";

interface TimelineRulerStripProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  layout: TimelineLayout;
  viewportWidth: number;
  className?: string;
}

/** Date ruler pinned above the scroll canvas; syncs to the timeline scroll container. */
export const TimelineRulerStrip = memo(function TimelineRulerStrip({
  scrollRef,
  layout,
  viewportWidth,
  className = "",
}: TimelineRulerStripProps) {
  const scrollLeft = useElementScrollLeft(scrollRef);
  const width =
    viewportWidth > 0
      ? viewportWidth
      : scrollRef.current?.clientWidth ?? 0;

  return (
    <div
      className={`shrink-0 overflow-hidden border-b border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      <div
        className="relative h-8"
        style={{
          width: layout.totalWidth,
          transform: `translateX(${-scrollLeft}px)`,
        }}
      >
        <TimelineRuler
          timelineStartDay={layout.timelineStartDay}
          timelineEndDay={layout.timelineEndDay}
          pixelsPerDay={layout.pixelsPerDay}
          totalWidth={layout.totalWidth}
          scrollLeft={scrollLeft}
          viewportWidth={width}
        />
      </div>
    </div>
  );
});
