"use client";

import { useMemo, useState } from "react";
import type { Background } from "@/lib/types";
import { getBackgroundImageOpacity } from "@/lib/types";
import {
  BACKGROUND_TILE_WIDTH_PX,
  getVisibleBackgroundTileRange,
} from "@/lib/background-tiles";

interface BackgroundImageColumnProps {
  background: Background;
  x: number;
  width: number;
  /** Full scrollable canvas height (sticky band moves within this). */
  canvasHeight: number;
  /** Visible scrollport height — each tile uses this fixed height. */
  viewportHeight: number;
  scrollLeft: number;
  viewportWidth: number;
}

export function BackgroundImageColumn({
  background,
  x,
  width,
  canvasHeight,
  viewportHeight,
  scrollLeft,
  viewportWidth,
}: BackgroundImageColumnProps) {
  const imageUrl = background.imageUrl?.trim();
  const [failed, setFailed] = useState(false);

  const columnWidth = Math.max(width, 24);
  const tileWidth = BACKGROUND_TILE_WIDTH_PX;
  const bandHeight = viewportHeight > 0 ? viewportHeight : 0;

  const tileRange = useMemo(
    () =>
      getVisibleBackgroundTileRange(
        x,
        columnWidth,
        tileWidth,
        scrollLeft,
        viewportWidth
      ),
    [x, columnWidth, tileWidth, scrollLeft, viewportWidth]
  );

  const tiles = useMemo(() => {
    if (tileRange.endIndex < tileRange.startIndex) return [];
    const list: number[] = [];
    for (let i = tileRange.startIndex; i <= tileRange.endIndex; i++) {
      list.push(i);
    }
    return list;
  }, [tileRange.startIndex, tileRange.endIndex]);

  if (!imageUrl || bandHeight <= 0) return null;

  const imageStrength = getBackgroundImageOpacity(background);
  const veilOpacity = 1 - imageStrength;

  return (
    <div
      className="pointer-events-none absolute top-0"
      style={{ left: x, width: columnWidth, height: canvasHeight }}
      aria-hidden
    >
      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: bandHeight }}
      >
        <div className="relative" style={{ width: columnWidth, height: bandHeight }}>
          {!failed &&
            tiles.map((index) => (
              <div
                key={`${background.id}-tile-${index}`}
                className="absolute top-0 overflow-hidden"
                style={{
                  left: index * tileWidth,
                  width: tileWidth,
                  height: bandHeight,
                }}
              >
                <img
                  src={imageUrl}
                  alt=""
                  width={tileWidth}
                  height={bandHeight}
                  className="block h-full w-full object-cover object-center"
                  draggable={false}
                  decoding="async"
                  onError={() => setFailed(true)}
                />
              </div>
            ))}

          {!failed && (
            <>
              <div
                className="pointer-events-none absolute inset-0 bg-[var(--background)]"
                style={{ opacity: veilOpacity }}
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[var(--surface)]/25 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--background)]/30 to-transparent" />
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
