"use client";

import { useEffect } from "react";

interface DragPanOptions {
  containerRef: React.RefObject<HTMLElement | null>;
}

const DRAG_THRESHOLD = 5;

/**
 * Click-and-drag panning for mouse users (touch/trackpad already pan natively).
 * A small movement threshold distinguishes a pan from a click, and the click
 * that follows a real drag is swallowed so events don't open accidentally.
 */
export function useDragPan({ containerRef }: DragPanOptions) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let pointerDown = false;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      // Leave clicks on interactive elements alone.
      if (target?.closest("button, a, input, textarea, select")) return;

      pointerDown = true;
      dragging = false;
      startX = e.clientX;
      startY = e.clientY;
      startScrollLeft = el.scrollLeft;
      startScrollTop = el.scrollTop;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!pointerDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

      if (!dragging) {
        dragging = true;
        el.style.cursor = "grabbing";
        el.style.userSelect = "none";
      }
      e.preventDefault();
      el.scrollLeft = startScrollLeft - dx;
      el.scrollTop = startScrollTop - dy;
    };

    const endDrag = () => {
      if (!pointerDown) return;
      pointerDown = false;
      if (dragging) {
        const swallow = (ev: MouseEvent) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        el.addEventListener("click", swallow, { capture: true, once: true });
      }
      dragging = false;
      el.style.cursor = "";
      el.style.userSelect = "";
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", endDrag);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", endDrag);
      el.style.cursor = "";
      el.style.userSelect = "";
    };
  }, [containerRef]);
}
