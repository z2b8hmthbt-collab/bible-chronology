import { describe, expect, it } from "vitest";
import { timelineDateToDayIndex } from "./date-utils";
import { getMinimapYearMarkers } from "./minimap-year-markers";

function dayForYear(year: number): number {
  return timelineDateToDayIndex({ year, month: 1, day: 1 });
}

describe("getMinimapYearMarkers", () => {
  it("creates sparse, aligned year markers for long timelines", () => {
    const markers = getMinimapYearMarkers(dayForYear(-2050), dayForYear(-1600));

    expect(markers.map((marker) => marker.label)).toEqual([
      "2000 BC",
      "1900 BC",
      "1800 BC",
      "1700 BC",
      "1600 BC",
    ]);
    expect(markers.every((marker) => marker.leftPct >= 0)).toBe(true);
    expect(markers.every((marker) => marker.leftPct <= 100)).toBe(true);
  });

  it("uses AD 1 once when markers cross the BC/AD boundary", () => {
    const markers = getMinimapYearMarkers(dayForYear(-2), dayForYear(3));

    expect(markers.map((marker) => marker.year)).toContain(1);
    expect(markers.filter((marker) => marker.year === 1)).toHaveLength(1);
    expect(markers.some((marker) => marker.year === 0)).toBe(false);
  });
});
