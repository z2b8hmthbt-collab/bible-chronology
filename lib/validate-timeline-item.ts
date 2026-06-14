import { compareTimelineDates } from "./date-utils";

export interface ValidationErrors {
  [field: string]: string;
}

export function validateEventDraft(draft: {
  title: string;
  startDate: string;
  endDate?: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!draft.title.trim()) errors.title = "Title is required";
  if (!draft.startDate) errors.startDate = "Start date is required";
  if (
    draft.endDate &&
    draft.startDate &&
    compareTimelineDates(draft.endDate, draft.startDate) < 0
  ) {
    errors.endDate = "End date must be on or after start";
  }
  return errors;
}

export function validateBackgroundDraft(draft: {
  title: string;
  startDate: string;
  endDate: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!draft.startDate) errors.startDate = "Start date is required";
  if (!draft.endDate) errors.endDate = "End date is required";
  if (
    draft.startDate &&
    draft.endDate &&
    compareTimelineDates(draft.endDate, draft.startDate) < 0
  ) {
    errors.endDate = "End date must be on or after start";
  }
  if (!draft.title.trim()) errors.title = "Title is required";
  return errors;
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
