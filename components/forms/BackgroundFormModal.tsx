"use client";

import { useState } from "react";
import { ModalOverlay } from "../ui/ModalOverlay";
import {
  FormField,
  inputClass,
  textareaClass,
  buttonPrimaryClass,
} from "../ui/FormField";
import { LinksInput } from "./LinksInput";
import { ImageUpload } from "./ImageUpload";
import { DateInput } from "./DateInput";
import { useTimelineStore } from "@/lib/store";
import { compareTimelineDates } from "@/lib/date-utils";
import { DEFAULT_BACKGROUND_IMAGE_OPACITY } from "@/lib/types";

interface BackgroundFormModalProps {
  onClose: () => void;
  editId?: string;
}

export function BackgroundFormModal({ onClose, editId }: BackgroundFormModalProps) {
  const existing = useTimelineStore((s) =>
    editId ? s.data.backgrounds.find((b) => b.id === editId) : undefined
  );
  const addBackground = useTimelineStore((s) => s.addBackground);
  const updateBackground = useTimelineStore((s) => s.updateBackground);

  const [startDate, setStartDate] = useState(existing?.startDate ?? "");
  const [endDate, setEndDate] = useState(existing?.endDate ?? "");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [links, setLinks] = useState<string[]>(existing?.links ?? []);
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl ?? "");
  const [imageOpacity, setImageOpacity] = useState(
    existing?.imageOpacity ?? DEFAULT_BACKGROUND_IMAGE_OPACITY
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!startDate) e.startDate = "Start date is required";
    if (!endDate) e.endDate = "End date is required";
    if (startDate && endDate && compareTimelineDates(endDate, startDate) < 0)
      e.endDate = "End date must be on or after start";
    if (!title.trim()) e.title = "Title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload = {
      startDate,
      endDate,
      title: title.trim(),
      notes,
      links: links.filter(Boolean),
      imageUrl: imageUrl || undefined,
      imageOpacity: imageUrl ? imageOpacity : undefined,
    };

    if (existing) {
      updateBackground(existing.id, payload);
    } else {
      addBackground(payload);
    }
    onClose();
  };

  return (
    <ModalOverlay
      onClose={onClose}
      title={existing ? "Edit Background" : "Add Background"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Start Date" required error={errors.startDate}>
            <DateInput value={startDate} onChange={setStartDate} />
          </FormField>
          <FormField label="End Date" required error={errors.endDate}>
            <DateInput value={endDate} onChange={setEndDate} />
          </FormField>
        </div>

        <FormField label="Title" required error={errors.title}>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Background title"
          />
        </FormField>

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

        {imageUrl && (
          <FormField
            label={`Background image opacity (${Math.round(imageOpacity * 100)}%)`}
          >
            <input
              type="range"
              min={5}
              max={85}
              step={5}
              value={Math.round(imageOpacity * 100)}
              onChange={(e) =>
                setImageOpacity(parseInt(e.target.value, 10) / 100)
              }
              className="w-full accent-indigo-500"
            />
            <p className="text-xs text-[var(--muted)]">
              Lower values keep events easier to read; higher values show more of
              the image.
            </p>
          </FormField>
        )}

        <button type="submit" className={buttonPrimaryClass}>
          {existing ? "Save Changes" : "Add Background"}
        </button>
      </form>
    </ModalOverlay>
  );
}
