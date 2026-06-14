"use client";

import { useState } from "react";
import { ModalOverlay } from "../ui/ModalOverlay";
import {
  FormField,
  FormInput,
  FormTextarea,
  buttonPrimaryClass,
} from "../ui/FormField";
import { LinksInput } from "./LinksInput";
import { ImageUpload, isValidImageUrl } from "./ImageUpload";
import { DateInput } from "./DateInput";
import { useTimelineStore } from "@/lib/store";
import { DEFAULT_BACKGROUND_IMAGE_OPACITY, getBackgroundImageOpacity } from "@/lib/types";
import {
  hasValidationErrors,
  validateBackgroundDraft,
} from "@/lib/validate-timeline-item";

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
  const [imageUrlDraft, setImageUrlDraft] = useState(existing?.imageUrl ?? "");
  const [imageOpacity, setImageOpacity] = useState(
    existing ? getBackgroundImageOpacity(existing) : DEFAULT_BACKGROUND_IMAGE_OPACITY
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e = validateBackgroundDraft({ title, startDate, endDate });
    setErrors(e);
    return !hasValidationErrors(e);
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const draft = imageUrlDraft.trim();
    const trimmedImageUrl =
      draft && isValidImageUrl(draft) ? draft : imageUrl.trim();
    const payload = {
      startDate,
      endDate,
      title: title.trim(),
      notes,
      links: links.filter(Boolean),
      imageUrl: trimmedImageUrl || undefined,
      imageOpacity: trimmedImageUrl ? imageOpacity : undefined,
    };

    if (existing) {
      updateBackground(existing.id, payload);
    } else {
      addBackground(payload);
    }
    onClose();
  };

  const opacityPercent = Math.round(
    Math.min(85, Math.max(5, imageOpacity * 100))
  );

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
          <FormInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Background title"
          />
        </FormField>

        <FormField label="Notes">
          <FormTextarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes…"
          />
        </FormField>

        <LinksInput links={links} onChange={setLinks} />

        <ImageUpload
          imageUrl={imageUrl}
          onUploaded={setImageUrl}
          onClear={() => {
            setImageUrl("");
            setImageUrlDraft("");
          }}
          onInputChange={setImageUrlDraft}
        />

        {imageUrl && (
          <FormField label={`Background image opacity (${opacityPercent}%)`}>
            <input
              type="range"
              min={5}
              max={85}
              step={5}
              value={opacityPercent}
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
