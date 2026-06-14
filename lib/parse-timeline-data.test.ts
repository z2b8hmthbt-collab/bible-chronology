import { describe, expect, it } from "vitest";
import {
  createBackupFile,
  parseTimelineData,
  unwrapBackupPayload,
} from "./parse-timeline-data";
import { createEmptyData } from "./types";

const now = "2024-01-01T00:00:00.000Z";

describe("parse-timeline-data", () => {
  it("unwraps versioned backup files", () => {
    const data = createEmptyData();
    const file = createBackupFile(data);
    const payload = unwrapBackupPayload(file);
    expect(payload).toEqual(data);
  });

  it("parses valid events and rejects end-before-start", () => {
    const { data, warnings } = parseTimelineData({
      events: [
        {
          id: "e1",
          title: "Good",
          startDate: "-1000-01-01",
          endDate: "-0999-12-31",
          notes: "",
          categoryId: "cat-default",
          links: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "e2",
          title: "Bad",
          startDate: "-1000-01-01",
          endDate: "-2000-01-01",
          notes: "",
          categoryId: "cat-default",
          links: [],
          createdAt: now,
          updatedAt: now,
        },
      ],
      backgrounds: [],
      categories: createEmptyData().categories,
    });

    expect(data.events).toHaveLength(1);
    expect(data.events[0].title).toBe("Good");
    expect(warnings.some((w) => w.includes("Bad"))).toBe(true);
  });

  it("throws on invalid backup shape", () => {
    expect(() => parseTimelineData({ foo: "bar" })).toThrow(
      "Invalid backup format"
    );
  });
});
