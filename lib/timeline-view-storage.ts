export const TIMELINE_VIEW_STORAGE_KEY = "timeline-view-v1";
export const TIMELINE_DATA_CLEARED_EVENT = "timeline-data-cleared";

export interface SavedTimelineView {
  pixelsPerDay: number;
  scrollLeft: number;
}

export function loadSavedTimelineView(): SavedTimelineView | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TIMELINE_VIEW_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.pixelsPerDay === "number" &&
      parsed.pixelsPerDay > 0 &&
      typeof parsed?.scrollLeft === "number"
    ) {
      return {
        pixelsPerDay: parsed.pixelsPerDay,
        scrollLeft: Math.max(0, parsed.scrollLeft),
      };
    }
  } catch {
    // ignore malformed/unavailable storage
  }
  return null;
}

export function saveTimelineView(view: SavedTimelineView): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TIMELINE_VIEW_STORAGE_KEY, JSON.stringify(view));
  } catch {
    // ignore quota/unavailable storage
  }
}

export function clearSavedTimelineView(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TIMELINE_VIEW_STORAGE_KEY);
  } catch {
    // ignore unavailable storage
  }
}

export function notifyTimelineDataCleared(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TIMELINE_DATA_CLEARED_EVENT));
}
