"use client";

import { useState } from "react";
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
  const imageUrl = background.imageUrl?.trim();
  const [failed, setFailed] = useState(false);

  if (!imageUrl) return null;

  const columnWidth = Math.max(width, 24);
  const imageStrength = getBackgroundImageOpacity(background);
  const veilOpacity = 1 - imageStrength;

  return (
    <div
      className="pointer-events-none absolute top-0 overflow-hidden"
      style={{ left: x, width: columnWidth, height }}
      aria-hidden
    >
      {!failed && (
        <>
          <img
            key={`${background.id}-${background.updatedAt}-${imageUrl}`}
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            draggable={false}
            decoding="async"
            onError={() => setFailed(true)}
          />
          {/* Fade with the page background so the photo stays vivid underneath */}
          <div
            className="absolute inset-0 bg-[var(--background)]"
            style={{ opacity: veilOpacity }}
          />
          <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[var(--surface)]/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--background)]/30 to-transparent" />
        </>
      )}
      {failed && (
        <div className="absolute inset-0 bg-indigo-400/[0.12] dark:bg-indigo-400/[0.14]" />
      )}
    </div>
  );
}
