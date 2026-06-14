import { describe, expect, it } from "vitest";
import {
  compareTimelineDates,
  getDateDayIndex,
  normalizeTimelineDate,
  parseTimelineDate,
} from "./date-utils";

describe("date-utils", () => {
  it("parses BC storage dates", () => {
    const parts = parseTimelineDate("-4300-01-01");
    expect(parts?.year).toBe(-4300);
  });

  it("normalizes Tiki-Toki BC dates", () => {
    expect(normalizeTimelineDate("4300 BC-01-01 00:00:00")).toBe("-4300-01-01");
  });

  it("orders BC dates correctly", () => {
    expect(compareTimelineDates("-1000-01-01", "-2000-01-01")).toBeGreaterThan(0);
    expect(compareTimelineDates("-2000-01-01", "-1000-01-01")).toBeLessThan(0);
  });

  it("orders BC before AD", () => {
    expect(compareTimelineDates("0001-01-01", "-0001-01-01")).toBeGreaterThan(0);
  });

  it("returns monotonic day indices for BC years", () => {
    const earlier = getDateDayIndex("-2000-06-15");
    const later = getDateDayIndex("-1000-06-15");
    expect(earlier).not.toBeNull();
    expect(later).not.toBeNull();
    expect(later!).toBeGreaterThan(earlier!);
  });
});
