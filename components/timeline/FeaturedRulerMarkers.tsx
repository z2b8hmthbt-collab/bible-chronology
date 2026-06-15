"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { Category, TimelineEvent } from "@/lib/types";
import {
  formatTimelineDateParts,
  parseTimelineDate,
} from "@/lib/date-utils";
import { getPrimaryCategoryId } from "@/lib/event-categories";
import { usesFeaturedCircle } from "@/lib/featured-marker-size";
import { useTimelineController } from "@/lib/timeline-controller";
import type { FeaturedRulerMarker } from "@/lib/ruler-featured-markers";

interface FeaturedRulerMarkersProps {
  markers: FeaturedRulerMarker[];
  categoryById: Map<string, Category>;
}

function FeaturedRulerPreview({
  event,
  category,
  anchorRect,
  showCircle,
  onViewEvent,
  onClose,
}: {
  event: TimelineEvent;
  category?: Category;
  anchorRect: DOMRect;
  showCircle: boolean;
  onViewEvent: () => void;
  onClose: () => void;
}) {
  const imageUrl = event.imageUrl?.trim() ?? "";
  const parsed = parseTimelineDate(event.startDate);
  const dateLabel = parsed
    ? formatTimelineDateParts(parsed, "medium")
    : event.startDate;
  const color = category?.color ?? "#6366f1";

  const previewWidth = 168;
  const gap = 8;
  const top = Math.max(8, anchorRect.top - gap);
  const left = anchorRect.left + anchorRect.width / 2;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Dismiss preview"
        className="fixed inset-0 z-[79] cursor-default bg-transparent"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        className="fixed z-[80]"
        style={{
          top,
          left,
          width: previewWidth,
          transform: "translate(-50%, -100%)",
        }}
        role="tooltip"
      >
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
        {showCircle && imageUrl ? (
          <div className="flex justify-center bg-[var(--background)] p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-2 ring-amber-400/85"
              draggable={false}
            />
          </div>
        ) : (
          <div
            className="flex h-12 items-center justify-center text-lg text-white"
            style={{ backgroundColor: color }}
            aria-hidden
          >
            ★
          </div>
        )}
        <div className="space-y-1 px-3 py-2">
          <p className="font-serif line-clamp-2 text-sm font-medium leading-snug text-[var(--foreground)]">
            {event.title}
          </p>
          <p className="tabular-nums text-xs text-[var(--muted)]">{dateLabel}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewEvent();
            }}
            className="mt-1 hidden w-full rounded-lg bg-indigo-500 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-600 active:scale-[0.98] [@media(hover:none)]:block"
          >
            View on timeline
          </button>
        </div>
      </div>
      </div>
    </>,
    document.body
  );
}

const FeaturedRulerStar = memo(function FeaturedRulerStar({
  marker,
  onPreviewChange,
  previewEventId,
}: {
  marker: FeaturedRulerMarker;
  onPreviewChange: (eventId: string | null, anchor: DOMRect | null) => void;
  previewEventId: string | null;
}) {
  const { scrollToEvent } = useTimelineController();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { event, x } = marker;

  const parsed = parseTimelineDate(event.startDate);
  const dateShort = parsed
    ? formatTimelineDateParts(parsed, "short")
    : event.startDate;

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const showPreview = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) onPreviewChange(event.id, rect);
  }, [event.id, onPreviewChange]);

  const hidePreview = useCallback(() => {
    onPreviewChange(null, null);
  }, [onPreviewChange]);

  useEffect(() => () => clearHoverTimer(), []);

  const handlePointerEnter = () => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    clearHoverTimer();
    hoverTimerRef.current = setTimeout(showPreview, 150);
  };

  const handlePointerLeave = () => {
    clearHoverTimer();
    if (!window.matchMedia("(hover: none)").matches) {
      hidePreview();
    }
  };

  const handleClick = () => {
    if (window.matchMedia("(hover: none)").matches) {
      if (previewEventId === event.id) {
        scrollToEvent(event.id);
        hidePreview();
      } else {
        showPreview();
      }
      return;
    }
    scrollToEvent(event.id);
    hidePreview();
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="absolute top-0.5 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-md text-amber-500 transition hover:scale-110 hover:bg-amber-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500 active:scale-95"
      style={{ left: x }}
      aria-label={`Featured: ${event.title}, ${dateShort}`}
      aria-expanded={previewEventId === event.id}
    >
      <span className="text-[11px] leading-none" aria-hidden>
        ★
      </span>
    </button>
  );
});

export const FeaturedRulerMarkers = memo(function FeaturedRulerMarkers({
  markers,
  categoryById,
}: FeaturedRulerMarkersProps) {
  const [preview, setPreview] = useState<{
    eventId: string;
    rect: DOMRect;
  } | null>(null);
  const { scrollToEvent } = useTimelineController();

  const handlePreviewChange = useCallback(
    (eventId: string | null, rect: DOMRect | null) => {
      if (eventId && rect) {
        setPreview({ eventId, rect });
      } else {
        setPreview(null);
      }
    },
    []
  );

  if (markers.length === 0) return null;

  const previewMarker = preview
    ? markers.find((m) => m.event.id === preview.eventId)
    : null;

  return (
    <>
      {markers.map((marker) => (
        <FeaturedRulerStar
          key={marker.event.id}
          marker={marker}
          onPreviewChange={handlePreviewChange}
          previewEventId={preview?.eventId ?? null}
        />
      ))}

      {preview && previewMarker && (
        <FeaturedRulerPreview
          event={previewMarker.event}
          category={categoryById.get(getPrimaryCategoryId(previewMarker.event))}
          anchorRect={preview.rect}
          showCircle={usesFeaturedCircle(previewMarker.event)}
          onViewEvent={() => {
            scrollToEvent(previewMarker.event.id);
            setPreview(null);
          }}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
});
