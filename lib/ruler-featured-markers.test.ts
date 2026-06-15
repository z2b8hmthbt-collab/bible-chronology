import { describe, expect, it } from "vitest";
import { getEventStartDayIndex } from "./date-utils";
import { getVisibleFeaturedRulerMarkers } from "./ruler-featured-markers";
import type { TimelineEvent } from "./types";

function makeFeaturedEvent(id: string, startDate: string): TimelineEvent {
  const now = "2024-01-01T00:00:00.000Z";
  return {
    id,
    title: id,
    startDate,
    notes: "",
    categoryIds: ["cat-default"],
    links: [],
    featured: true,
    createdAt: now,
    updatedAt: now,
  };
}

describe("getVisibleFeaturedRulerMarkers", () => {
  const pixelsPerDay = 1;

  it("returns only featured events in the visible day range", () => {
    const events = [
      makeFeaturedEvent("visible", "2000-01-01"),
      makeFeaturedEvent("hidden", "5000-01-01"),
      {
        ...makeFeaturedEvent("not-featured", "2000-06-01"),
        featured: false,
      },
    ];
    const timelineStartDay = getEventStartDayIndex(events[0]) - 100;

    const markers = getVisibleFeaturedRulerMarkers(
      events,
      timelineStartDay,
      pixelsPerDay,
      0,
      4000
    );

    expect(markers.map((m) => m.event.id)).toEqual(["visible"]);
    expect(markers[0].x).toBeGreaterThan(0);
  });

  it("sorts markers left to right", () => {
    const events = [
      makeFeaturedEvent("later", "2000-06-01"),
      makeFeaturedEvent("earlier", "2000-01-01"),
    ];
    const timelineStartDay = getEventStartDayIndex(events[1]) - 100;

    const markers = getVisibleFeaturedRulerMarkers(
      events,
      timelineStartDay,
      pixelsPerDay,
      0,
      10000
    );

    expect(markers.map((m) => m.event.id)).toEqual(["earlier", "later"]);
    expect(markers[0].x).toBeLessThan(markers[1].x);
  });
});
