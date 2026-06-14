import { describe, expect, it } from "vitest";
import {
  hasValidationErrors,
  validateBackgroundDraft,
  validateEventDraft,
} from "./validate-timeline-item";

describe("validate-timeline-item", () => {
  it("requires event title and start date", () => {
    const errors = validateEventDraft({ title: " ", startDate: "" });
    expect(errors.title).toBeTruthy();
    expect(errors.startDate).toBeTruthy();
    expect(hasValidationErrors(errors)).toBe(true);
  });

  it("rejects end before start for events", () => {
    const errors = validateEventDraft({
      title: "Test",
      startDate: "-1000-01-01",
      endDate: "-2000-01-01",
    });
    expect(errors.endDate).toBeTruthy();
  });

  it("rejects end before start for backgrounds", () => {
    const errors = validateBackgroundDraft({
      title: "Era",
      startDate: "0100-01-01",
      endDate: "0050-01-01",
    });
    expect(errors.endDate).toBeTruthy();
  });
});
