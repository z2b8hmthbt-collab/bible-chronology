"use client";

import { useMemo, useState } from "react";
import { ModalOverlay } from "../ui/ModalOverlay";
import { inputClass } from "../ui/FormField";
import { useTimelineStore } from "@/lib/store";
import { formatTimelineDate, getEventStartDayIndex } from "@/lib/date-utils";
import { useTimelineController } from "@/lib/timeline-controller";
import { getCategoryById } from "@/lib/merge";
import {
  getEventCategoryIds,
  getPrimaryCategoryId,
} from "@/lib/event-categories";

interface SearchEventsModalProps {
  onClose: () => void;
}

function cleanTitle(text: string): string {
  return text.replace(/[\u2028\u2029]/g, " ").replace(/\s+/g, " ").trim();
}

export function SearchEventsModal({ onClose }: SearchEventsModalProps) {
  const events = useTimelineStore((s) => s.data.events);
  const categories = useTimelineStore((s) => s.data.categories);
  const controller = useTimelineController();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return events
      .filter((e) => {
        const titleMatch = cleanTitle(e.title).toLowerCase().includes(q);
        const categoryMatch = getEventCategoryIds(e).some((id) => {
          const cat = getCategoryById(categories, id);
          return cat?.name.toLowerCase().includes(q);
        });
        return titleMatch || categoryMatch;
      })
      .sort(
        (a, b) => getEventStartDayIndex(a) - getEventStartDayIndex(b)
      )
      .slice(0, 50);
  }, [events, categories, query]);

  const selectEvent = (eventId: string) => {
    controller.scrollToEvent(eventId);
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose} title="Search events">
      <div className="space-y-4">
        <input
          type="search"
          className={inputClass}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or category…"
          autoFocus
        />

        {query.trim() && results.length === 0 && (
          <p className="text-sm text-[var(--muted)]">No events match your search.</p>
        )}

        {results.length > 0 && (
          <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
            {results.map((event) => {
              const primaryCategory = getCategoryById(
                categories,
                getPrimaryCategoryId(event)
              );
              const categoryLabel = getEventCategoryIds(event)
                .map((id) => getCategoryById(categories, id)?.name)
                .filter(Boolean)
                .join(", ");
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => selectEvent(event.id)}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[var(--background)]"
                  >
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: primaryCategory?.color ?? "#6366f1",
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-serif block truncate text-sm font-medium">
                        {event.featured && (
                          <span className="mr-1 text-amber-500">★</span>
                        )}
                        {cleanTitle(event.title)}
                      </span>
                      <span className="tabular-nums mt-0.5 block text-xs text-[var(--muted)]">
                        {formatTimelineDate(event.startDate)}
                        {categoryLabel && ` · ${categoryLabel}`}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {results.length === 50 && (
          <p className="text-xs text-[var(--muted)]">
            Showing first 50 matches. Refine your search for more.
          </p>
        )}
      </div>
    </ModalOverlay>
  );
}
