"use client";

import { useEffect, useRef, useCallback } from "react";
import { clampZoom } from "@/lib/timeline-layout";

interface PinchZoomOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  pixelsPerDay: number;
  timelineStartDay: number;
  minPixelsPerDay: number;
  onPixelsPerDayChange: (ppd: number) => void;
  onScrollPositionChange?: (scrollLeft: number) => void;
}

function getTouchDistance(touches: TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function getTouchMidpointX(touches: TouchList, rect: DOMRect): number {
  return (touches[0].clientX + touches[1].clientX) / 2 - rect.left;
}

/** Pinch-to-zoom on trackpad (ctrl/meta + scroll) and touch devices. */
export function usePinchZoom({
  containerRef,
  pixelsPerDay,
  timelineStartDay,
  minPixelsPerDay,
  onPixelsPerDayChange,
  onScrollPositionChange,
}: PinchZoomOptions) {
  const pixelsPerDayRef = useRef(pixelsPerDay);
  const timelineStartDayRef = useRef(timelineStartDay);
  const minPixelsPerDayRef = useRef(minPixelsPerDay);

  pixelsPerDayRef.current = pixelsPerDay;
  timelineStartDayRef.current = timelineStartDay;
  minPixelsPerDayRef.current = minPixelsPerDay;

  const onScrollPositionChangeRef = useRef(onScrollPositionChange);
  onScrollPositionChangeRef.current = onScrollPositionChange;

  const applyZoomAt = useCallback(
    (nextPixelsPerDay: number, focalXInViewport: number) => {
      const el = containerRef.current;
      const clamped = clampZoom(nextPixelsPerDay, minPixelsPerDayRef.current);
      if (!el) {
        onPixelsPerDayChange(clamped);
        return;
      }

      const currentPpd = pixelsPerDayRef.current;
      const startDay = timelineStartDayRef.current;
      const focalScrollX = el.scrollLeft + focalXInViewport;
      const focalDay = startDay + focalScrollX / currentPpd;
      const newScrollLeft =
        (focalDay - startDay) * clamped - focalXInViewport;

      onPixelsPerDayChange(clamped);
      requestAnimationFrame(() => {
        const next = Math.max(0, newScrollLeft);
        el.scrollLeft = next;
        onScrollPositionChangeRef.current?.(next);
      });
    },
    [containerRef, onPixelsPerDayChange]
  );

  const applyZoomAtRef = useRef(applyZoomAt);
  applyZoomAtRef.current = applyZoomAt;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const focalX = e.clientX - rect.left;
      const factor = Math.exp(-e.deltaY * 0.008);
      const next = clampZoom(
        pixelsPerDayRef.current * factor,
        minPixelsPerDayRef.current
      );
      applyZoomAtRef.current(next, focalX);
    };

    let pinchStart: { distance: number; ppd: number } | null = null;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchStart = {
          distance: getTouchDistance(e.touches),
          ppd: pixelsPerDayRef.current,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinchStart) return;
      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const distance = getTouchDistance(e.touches);
      if (pinchStart.distance < 10) return;

      const scale = distance / pinchStart.distance;
      const next = clampZoom(
        pinchStart.ppd * scale,
        minPixelsPerDayRef.current
      );
      const focalX = getTouchMidpointX(e.touches, rect);
      applyZoomAtRef.current(next, focalX);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchStart = null;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [containerRef]);

  return applyZoomAt;
}
