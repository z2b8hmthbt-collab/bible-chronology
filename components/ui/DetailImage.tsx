"use client";

import { useState } from "react";

interface DetailImageProps {
  src: string;
  alt: string;
}

export function DetailImage({ src, alt }: DetailImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[var(--background)] ring-1 ring-[var(--border)]">
      {!loaded && (
        <div
          className="image-shimmer absolute inset-0 bg-[var(--background)]"
          aria-hidden
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
