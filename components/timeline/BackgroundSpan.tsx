"use client";

import type { Background } from "@/lib/types";

interface BackgroundSpanProps {
  background: Background;
  x: number;
  width: number;
  top: number;
  height: number;
  scrollLeft?: number;
  onInfoClick: () => void;
}

const CHIP_WIDTH = 28;

export function BackgroundSpan({
  background,
  x,
  width,
  top,
  height,
  scrollLeft = 0,
  onInfoClick,
}: BackgroundSpanProps) {
  const spanWidth = Math.max(width, 24);
  const stickyOffset = Math.max(0, Math.min(scrollLeft - x, spanWidth - CHIP_WIDTH));

  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: x, top, width: spanWidth, height }}
    >
      {/* Full date-range rail in the background band */}
      <div
        className="absolute inset-0 rounded-sm bg-indigo-400/18 ring-1 ring-inset ring-indigo-400/25 dark:bg-indigo-500/12 dark:ring-indigo-500/20"
        aria-hidden
      />

      <div
        className="pointer-events-auto absolute top-1/2 z-10 flex max-w-full items-center gap-1 rounded-md border border-indigo-200/60 bg-[var(--surface)]/90 py-0.5 pl-0.5 pr-1.5 shadow-sm backdrop-blur-sm dark:border-indigo-800/50"
        style={{ transform: `translate(${stickyOffset}px, -50%)` }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInfoClick();
          }}
          className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold leading-none text-white transition hover:bg-indigo-600 active:scale-95"
          aria-label={`Info: ${background.title}`}
          title={background.title}
        >
          ⓘ
        </button>

        {width > 48 && (
          <span className="truncate text-[10px] font-medium text-indigo-800 dark:text-indigo-200">
            {background.title}
          </span>
        )}
      </div>
    </div>
  );
}
