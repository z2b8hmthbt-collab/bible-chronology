"use client";

import { useEffect } from "react";
import { useTimelineController } from "@/lib/timeline-controller";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

interface KeyboardShortcutsOptions {
  onOpenSearch: () => void;
  /** Skip shortcuts while a modal or detail panel is open. */
  disabled?: boolean;
}

export function useKeyboardShortcuts({
  onOpenSearch,
  disabled = false,
}: KeyboardShortcutsOptions) {
  const controller = useTimelineController();

  useEffect(() => {
    if (disabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "+":
        case "=":
          e.preventDefault();
          if (controller.canZoomIn) controller.zoomIn();
          break;
        case "-":
        case "_":
          e.preventDefault();
          if (controller.canZoomOut) controller.zoomOut();
          break;
        case "f":
        case "F":
          e.preventDefault();
          controller.fitAll();
          break;
        case "/":
          e.preventDefault();
          onOpenSearch();
          break;
        case "ArrowLeft":
          e.preventDefault();
          controller.panLeft();
          break;
        case "ArrowRight":
          e.preventDefault();
          controller.panRight();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [controller, onOpenSearch, disabled]);
}
