"use client";

import { useState } from "react";
import type { Background } from "@/lib/types";
import { getBackgroundImageOpacity } from "@/lib/types";

interface BackgroundImageColumnProps {
  background: Background;
  x: number;
  width: number;
  /** Full scrollable canvas height (sticky band moves within this). */
  canvasHeight: number;
  /** Visible scrollport height — each tile uses this fixed height. */
  viewportHeight: number;
}

export function BackgroundImageColumn({
  background,
  x,
  width,
  canvasHeight,
  viewportHeight,
}: BackgroundImageColumnProps) {
  const imageUrl = background.imageUrl?.trim();
  const [failed, setFailed] = useState(false);

  const columnWidth = Math.max(width, 24);
  const bandHeight = viewportHeight > 0 ? viewportHeight : 0;

  if (!imageUrl || bandHeight <= 0) return null;

  const imageStrength = getBackgroundImageOpacity(background);
  const veilOpacity = 1 - imageStrength;

  return (
    <div
      className="pointer-events-none absolute top-0"
      style={{ left: x, width: columnWidth, height: canvasHeight }}
      aria-hidden
    >
      {/* Detect load failures without painting a stretched <img> */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        className="hidden"
        onError={() => setFailed(true)}
      />

      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: bandHeight }}
      >
        <div className="relative h-full w-full">
          {!failed && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundRepeat: "repeat-x",
                // Scale to full band height; width follows aspect ratio per tile.
                backgroundSize: `auto ${bandHeight}px`,
                backgroundPosition: "left top",
              }}
            />
          )}

          {!failed && (
            <>
              <div
                className="pointer-events-none absolute inset-0 bg-[var(--background)]"
                style={{ opacity: veilOpacity }}
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[var(--surface)]/20 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[var(--background)]/20 to-transparent" />
            </>
          )}

          {failed && (
            <div className="absolute inset-0 bg-indigo-400/[0.12] dark:bg-indigo-400/[0.14]" />
          )}
        </div>
      </div>
    </div>
  );
}
