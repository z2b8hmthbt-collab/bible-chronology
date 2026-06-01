"use client";

import type { Background } from "@/lib/types";
import { getBackgroundImageOpacity } from "@/lib/types";

interface BackgroundImageColumnProps {
  background: Background;
  x: number;
  width: number;
  height: number;
}

export function BackgroundImageColumn({
  background,
  x,
  width,
  height,
}: BackgroundImageColumnProps) {
  const columnWidth = Math.max(width, 24);
  const opacity = getBackgroundImageOpacity(background);
  const imageUrl = background.imageUrl?.trim();

  return (
    <div
      className="pointer-events-none absolute top-0 overflow-hidden"
      style={{ left: x, width: columnWidth, height }}
      aria-hidden
    >
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{ opacity }}
            draggable={false}
          />
          <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[var(--surface)]/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--background)]/45 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-indigo-400/[0.07] dark:bg-indigo-400/[0.09]" />
      )}
    </div>
  );
}
