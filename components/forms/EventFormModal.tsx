"use client";

import { useState } from "react";
import { ModalOverlay } from "../ui/ModalOverlay";
import {
  FormField,
  inputClass,
  textareaClass,
  selectClass,
  buttonPrimaryClass,
} from "../ui/FormField";
import { LinksInput } from "./LinksInput";
import { ImageUpload } from "./ImageUpload";
import { DateInput } from "./DateInput";
import { useTimelineStore } from "@/lib/store";
import { compareTimelineDates } from "@/lib/date-utils";

interface EventFormModalProps {
  onClose: () => void;
  editId?: string;
}

export function EventFormModal({ onClose, editId }: EventFormModalProps) {
  const categories = useTimelineStore((s) => s.data.categories);
  const existing = useTimelineStore((s) =>
    editId ? s.data.events.find((e) => e.id === editId) : undefined
  );
  const addEvent = useTimelineStore((s) => s.addEvent);
  const updateEvent = useTimelineStore((s) => s.updateEvent);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [startDate, setStartDate] = useState(existing?.startDate ?? "");
  const [endDate, setEndDate] = useState(existing?.endDate ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [categoryId, setCategoryId] = useState(
    existing?.categoryId ?? categories[0]?.id ?? "cat-default"
  );
  const [links, setLinks] = useState<string[]>(existing?.links ?? []);
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl ?? "");
  const [featured, setFeatured] = useState(existing?.featured ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!startDate) e.startDate = "Start date is required";
    if (endDate && startDate && compareTimelineDates(endDate, startDate) < 0)
      e.endDate = "End date must be on or after start";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      title: title.trim(),
      startDate,
      endDate: endDate || undefined,
      notes,
      categoryId,
      links: links.filter(Boolean),
      imageUrl: imageUrl || undefined,
      featured: featured || undefined,
    };

    if (existing) {
      updateEvent(existing.id, payload);
    } else {
      addEvent(payload);
    }
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose} title={existing ? "Edit Event" : "Add Event"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Title" required error={errors.title}>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Start Date" required error={errors.startDate}>
            <DateInput value={startDate} onChange={setStartDate} />
          </FormField>
          <FormField label="End Date (optional)" error={errors.endDate}>
            <DateInput value={endDate} onChange={setEndDate} />
          </FormField>
        </div>

        <FormField label="Category">
          <select
            className={selectClass}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="mt-0.5 accent-indigo-500"
          />
          <span className="text-sm">
            <span className="font-medium">Featured event</span>
            <span className="mt-0.5 block text-xs text-[var(--muted)]">
              Stays prominent when zoomed out — larger pin, label visible sooner.
            </span>
          </span>
        </label>

        <FormField label="Notes">
          <textarea
            className={textareaClass}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes…"
          />
        </FormField>

        <LinksInput links={links} onChange={setLinks} />

        <ImageUpload
          imageUrl={imageUrl}
          onUploaded={setImageUrl}
          onClear={() => setImageUrl("")}
        />

        <button type="submit" disabled={submitting} className={buttonPrimaryClass}>
          {existing ? "Save Changes" : "Add Event"}
        </button>
      </form>
    </ModalOverlay>
  );
}
