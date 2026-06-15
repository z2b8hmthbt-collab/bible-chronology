import { describe, expect, it } from "vitest";
import { computeTimelineLayout } from "./timeline-layout";
import type { TimelineEvent } from "./types";

function makePointEvent(id: string, startDate: string): TimelineEvent {
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

describe("timeline-layout lanes", () => {
  it("separates point events when label bubbles would overlap", () => {
    const layout = computeTimelineLayout(
      [
        makePointEvent("a", "-2370-01-01"),
        makePointEvent("b", "-2370-02-15"),
      ],
      [],
      2
    );

    const laneA = layout.events.find((e) => e.event.id === "a")!.lane;
    const laneB = layout.events.find((e) => e.event.id === "b")!.lane;
    expect(laneA).not.toBe(laneB);
  });

  it("checks all occupants in a lane, not only the last", () => {
    const now = "2024-01-01T00:00:00.000Z";
    const makeRange = (id: string, start: string, end: string): TimelineEvent => ({
      id,
      title: id,
      startDate: start,
      endDate: end,
      notes: "",
      categoryIds: ["cat-default"],
      links: [],
      createdAt: now,
      updatedAt: now,
    });

    const layout = computeTimelineLayout(
      [
        makeRange("early", "-3000-01-01", "-2900-01-01"),
        makeRange("mid", "-2500-01-01", "-2400-01-01"),
        makeRange("between", "-2950-01-01", "-2850-01-01"),
      ],
      [],
      0.5
    );

    const between = layout.events.find((e) => e.event.id === "between")!;
    const early = layout.events.find((e) => e.event.id === "early")!;
    const mid = layout.events.find((e) => e.event.id === "mid")!;

    expect(between.lane).not.toBe(early.lane);
    expect(between.lane).not.toBe(mid.lane);
  });

  it("assigns separate label rows when bubbles overlap horizontally", () => {
    const layout = computeTimelineLayout(
      [
        makePointEvent("a", "-2370-06-01"),
        makePointEvent("b", "-2370-06-15"),
        makePointEvent("c", "-2370-07-01"),
      ],
      [],
      4
    );

    const rows = layout.events.map((e) => e.labelRow);
    expect(new Set(rows).size).toBe(3);
  });
});
