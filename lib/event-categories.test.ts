import { describe, expect, it } from "vitest";
import {
  getEventCategoryIds,
  getPrimaryCategoryId,
  isEventVisibleForCategories,
  normalizeEventCategories,
  normalizeEventCategoryIds,
} from "./event-categories";
import type { TimelineEvent } from "./types";

const now = "2024-01-01T00:00:00.000Z";

function makeEvent(
  overrides: Partial<TimelineEvent> & { categoryId?: string }
): TimelineEvent {
  const { categoryId: _legacy, ...rest } = overrides;
  return {
    id: "e1",
    title: "Test",
    startDate: "-1000-01-01",
    notes: "",
    categoryIds: overrides.categoryIds ?? ["cat-default"],
    links: [],
    createdAt: now,
    updatedAt: now,
    ...rest,
  };
}

describe("event-categories", () => {
  it("reads legacy categoryId as single-item array", () => {
    const legacy = { ...makeEvent({}), categoryId: "cat-life" } as TimelineEvent & {
      categoryId: string;
    };
    delete (legacy as { categoryIds?: string[] }).categoryIds;
    expect(getEventCategoryIds(legacy)).toEqual(["cat-life"]);
  });

  it("returns primary category as first id", () => {
    const event = makeEvent({ categoryIds: ["cat-life", "cat-work"] });
    expect(getPrimaryCategoryId(event)).toBe("cat-life");
  });

  it("normalizes invalid and duplicate ids", () => {
    const valid = new Set(["cat-default", "cat-life"]);
    expect(
      normalizeEventCategoryIds(
        ["cat-life", "cat-bad", "cat-life", "cat-default"],
        valid
      )
    ).toEqual(["cat-life", "cat-default"]);
  });

  it("falls back to default when all ids invalid", () => {
    expect(normalizeEventCategoryIds(["bad"], ["cat-default"])).toEqual([
      "cat-default",
    ]);
  });

  it("migrates legacy event on normalizeEventCategories", () => {
    const legacy = {
      ...makeEvent({}),
      categoryId: "cat-life",
    } as TimelineEvent & { categoryId: string };
    delete (legacy as { categoryIds?: string[] }).categoryIds;

    const normalized = normalizeEventCategories(legacy, ["cat-default", "cat-life"]);
    expect(normalized.categoryIds).toEqual(["cat-life"]);
    expect((normalized as { categoryId?: string }).categoryId).toBeUndefined();
  });

  it("is visible when any category is visible", () => {
    const event = makeEvent({ categoryIds: ["cat-a", "cat-b"] });
    const hidden = new Set(["cat-a"]);
    const isVisible = (id: string) => !hidden.has(id);
    expect(isEventVisibleForCategories(event, isVisible)).toBe(true);
  });

  it("is hidden when all categories are hidden", () => {
    const event = makeEvent({ categoryIds: ["cat-a", "cat-b"] });
    const hidden = new Set(["cat-a", "cat-b"]);
    const isVisible = (id: string) => !hidden.has(id);
    expect(isEventVisibleForCategories(event, isVisible)).toBe(false);
  });
});
