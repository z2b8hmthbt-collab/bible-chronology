"use client";

import { useState, useEffect } from "react";
import { FormField, inputClass } from "../ui/FormField";

interface ImageUploadProps {
  imageUrl: string;
  onUploaded: (url: string) => void;
  onClear: () => void;
  /** Lets parent forms save the URL on Submit even if Apply was not clicked. */
  onInputChange?: (value: string) => void;
}

export function isValidImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ImageUpload({
  imageUrl,
  onUploaded,
  onClear,
  onInputChange,
}: ImageUploadProps) {
  const [inputValue, setInputValue] = useState(imageUrl);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    setInputValue(imageUrl);
    setPreviewError(false);
  }, [imageUrl]);

  const applyUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      onClear();
      setPreviewError(false);
      return;
    }
    if (!isValidImageUrl(trimmed)) return;
    onUploaded(trimmed);
    setPreviewError(false);
  };

  const handleApply = () => applyUrl(inputValue);

  const displayUrl = imageUrl.trim();
  const showPreview = displayUrl && !previewError && isValidImageUrl(displayUrl);

  return (
    <FormField label="Image URL">
      <div className="space-y-2">
        <p className="text-xs text-[var(--muted)]">
          Upload the image to your website, then paste the full URL here (e.g.{" "}
          <span className="font-mono">https://yourdomain.com/timeline-images/photo.jpg</span>
          ).
        </p>

        <div className="flex gap-2">
          <input
            type="url"
            className={inputClass}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onInputChange?.(e.target.value);
              setPreviewError(false);
            }}
            onBlur={handleApply}
            placeholder="https://yourdomain.com/..."
          />
          <button
            type="button"
            onClick={handleApply}
            className="shrink-0 rounded-xl bg-[var(--background)] px-3 py-2 text-sm font-medium ring-1 ring-[var(--border)] transition hover:bg-[var(--border)]"
          >
            Apply
          </button>
        </div>

        {inputValue.trim() && !isValidImageUrl(inputValue.trim()) && (
          <p className="text-xs text-red-500">Enter a valid http or https URL.</p>
        )}

        {showPreview && (
          <div className="relative overflow-hidden rounded-xl border border-[var(--border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt="Preview"
              className="max-h-40 w-full object-cover"
              onError={() => setPreviewError(true)}
            />
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                setPreviewError(false);
                onClear();
              }}
              className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white"
            >
              Remove
            </button>
          </div>
        )}

        {previewError && (
          <p className="text-xs text-amber-600">
            Could not load preview — check the URL is correct and the image is publicly accessible.
          </p>
        )}
      </div>
    </FormField>
  );
}
