import type { TimelineEvent } from "./types";

export const DEFAULT_CATEGORY_ID = "cat-default";

/** Legacy single-field or modern array — read category ids from any event shape. */
export function getEventCategoryIds(
  event: TimelineEvent | ({ categoryIds?: string[]; categoryId?: string })
): string[] {
  if (Array.isArray(event.categoryIds) && event.categoryIds.length > 0) {
    return event.categoryIds;
  }
  const legacy = (event as { categoryId?: string }).categoryId;
  if (legacy) return [legacy];
  return [DEFAULT_CATEGORY_ID];
}

/** First category id — used for timeline pin/bar color. */
export function getPrimaryCategoryId(event: TimelineEvent): string {
  return getEventCategoryIds(event)[0] ?? DEFAULT_CATEGORY_ID;
}

/** Dedupe, drop invalid ids, ensure at least one default. Preserves order. */
export function normalizeEventCategoryIds(
  categoryIds: string[],
  validCategoryIds: Set<string> | string[]
): string[] {
  const valid =
    validCategoryIds instanceof Set
      ? validCategoryIds
      : new Set(validCategoryIds);

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const id of categoryIds) {
    if (!id || seen.has(id) || !valid.has(id)) continue;
    seen.add(id);
    normalized.push(id);
  }

  if (normalized.length === 0) {
    return valid.has(DEFAULT_CATEGORY_ID)
      ? [DEFAULT_CATEGORY_ID]
      : [Array.from(valid)[0] ?? DEFAULT_CATEGORY_ID];
  }

  return normalized;
}

/** Normalize categories on an event (handles legacy categoryId field). */
export function normalizeEventCategories(
  event: TimelineEvent & { categoryId?: string },
  validCategoryIds: Set<string> | string[]
): TimelineEvent {
  const ids = getEventCategoryIds(event);
  const categoryIds = normalizeEventCategoryIds(ids, validCategoryIds);
  const { categoryId: _legacy, ...rest } = event;
  return { ...rest, categoryIds };
}

/** Tag-style filter: visible if any category is shown. */
export function isEventVisibleForCategories(
  event: TimelineEvent,
  isCategoryVisible: (categoryId: string) => boolean
): boolean {
  return getEventCategoryIds(event).some((id) => isCategoryVisible(id));
}
