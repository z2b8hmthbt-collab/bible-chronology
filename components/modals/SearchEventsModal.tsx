"use client";

import { useMemo, useState } from "react";
import { ModalOverlay } from "../ui/ModalOverlay";
import { inputClass } from "../ui/FormField";
import { useTimelineStore } from "@/lib/store";
import { formatTimelineDate, getEventStartDayIndex } from "@/lib/date-utils";
import { useTimelineController } from "@/lib/timeline-controller";
import { getCategoryById } from "@/lib/merge";

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
      .filter((e) => cleanTitle(e.title).toLowerCase().includes(q))
      .sort(
        (a, b) => getEventStartDayIndex(a) - getEventStartDayIndex(b)
      )
      .slice(0, 50);
  }, [events, query]);

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
          placeholder="Search by title…"
          autoFocus
        />

        {query.trim() && results.length === 0 && (
          <p className="text-sm text-[var(--muted)]">No events match your search.</p>
        )}

        {results.length > 0 && (
          <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
            {results.map((event) => {
              const category = getCategoryById(categories, event.categoryId);
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => selectEvent(event.id)}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[var(--background)]"
                  >
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: category?.color ?? "#6366f1" }}
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
                        {category && ` · ${category.name}`}
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
