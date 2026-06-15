import { describe, expect, it } from "vitest";
import { sortEvents } from "./merge";
import type { TimelineEvent } from "./types";

function makeEvent(id: string, startDate: string): TimelineEvent {
  const now = "2024-01-01T00:00:00.000Z";
  return {
    id,
    title: id,
    startDate,
    notes: "",
    categoryIds: ["cat-default"],
    links: [],
    createdAt: now,
    updatedAt: now,
  };
}

describe("merge", () => {
  it("sorts BC events in chronological order", () => {
    const sorted = sortEvents([
      makeEvent("c", "0001-01-01"),
      makeEvent("a", "-2000-01-01"),
      makeEvent("b", "-1000-01-01"),
    ]);

    expect(sorted.map((e) => e.id)).toEqual(["a", "b", "c"]);
  });
});
