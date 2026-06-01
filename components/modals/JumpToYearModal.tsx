"use client";

import { useState } from "react";
import { ModalOverlay } from "../ui/ModalOverlay";
import { FormField, inputClass, buttonPrimaryClass } from "../ui/FormField";
import { timelineDateToDayIndex } from "@/lib/date-utils";
import { useTimelineController } from "@/lib/timeline-controller";

interface JumpToYearModalProps {
  onClose: () => void;
}

type Era = "BCE" | "CE";

export function JumpToYearModal({ onClose }: JumpToYearModalProps) {
  const controller = useTimelineController();
  const [yearAbs, setYearAbs] = useState("");
  const [era, setEra] = useState<Era>("BCE");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const y = parseInt(yearAbs, 10);
    if (!y || y < 1) {
      setError("Enter a valid year (1 or greater).");
      return;
    }
    const year = era === "BCE" ? -y : y;
    const dayIndex = timelineDateToDayIndex({ year, month: 1, day: 1 });
    controller.scrollToDayIndex(dayIndex);
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose} title="Jump to year">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-[var(--muted)]">
          Scroll the timeline to January 1 of the year you choose.
        </p>

        <div className="flex gap-2">
          <FormField label="Year" required error={error}>
            <input
              type="number"
              min={1}
              max={9999}
              className={`${inputClass} tabular-nums`}
              value={yearAbs}
              onChange={(e) => {
                setYearAbs(e.target.value);
                setError("");
              }}
              placeholder="e.g. 1446"
              autoFocus
            />
          </FormField>
        </div>

        <div className="flex rounded-xl bg-[var(--background)] p-1 ring-1 ring-[var(--border)]">
          {(["BCE", "CE"] as const).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEra(e)}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition ${
                era === e
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        <button type="submit" className={buttonPrimaryClass}>
          Go to year
        </button>
      </form>
    </ModalOverlay>
  );
}
