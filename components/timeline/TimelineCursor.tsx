"use client";

import { useEffect, useRef, useState } from "react";
import { dayIndexToTimelineDate } from "@/lib/date-utils";

interface TimelineCursorProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  timelineStartDay: number;
  pixelsPerDay: number;
  height: number;
}

/**
 * A hairline + date chip that follows the mouse so the precise date under the
 * pointer is always readable. Mouse-only (hidden on touch / no-hover devices)
 * and hidden while a drag-pan is in progress.
 */
export function TimelineCursor({
  containerRef,
  timelineStartDay,
  pixelsPerDay,
  height,
}: TimelineCursorProps) {
  const [contentX, setContentX] = useState<number | null>(null);
  const pressedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      !window.matchMedia("(hover: hover)").matches
    ) {
      return;
    }

    const onMove = (e: MouseEvent) => {
      if (pressedRef.current) {
        setContentX(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      const x = el.scrollLeft + (e.clientX - rect.left);
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setContentX(x);
      });
    };
    const onLeave = () => setContentX(null);
    const onDown = () => {
      pressedRef.current = true;
      setContentX(null);
    };
    const onUp = () => {
      pressedRef.current = false;
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef]);

  if (contentX == null) return null;

  const dayIndex = Math.round(timelineStartDay + contentX / pixelsPerDay);
  const parts = dayIndexToTimelineDate(dayIndex);
  const label =
    parts.year < 0 ? `${Math.abs(parts.year)} BC` : `AD ${parts.year}`;

  return (
    <div
      className="pointer-events-none absolute top-0 z-40"
      style={{ left: contentX, height }}
    >
      <div className="absolute inset-y-0 w-px bg-indigo-400/70" />
      <div className="absolute top-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-indigo-500 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white shadow-sm">
        {label}
      </div>
    </div>
  );
}
