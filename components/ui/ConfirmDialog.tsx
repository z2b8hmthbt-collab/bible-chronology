"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/use-focus-trap";

interface ConfirmDialogProps {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKey, true);
    return () => window.removeEventListener("keydown", handleKey, true);
  }, [onCancel]);

  const content = (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-t-2xl bg-[var(--surface)] shadow-xl panel-slide-up sm:rounded-2xl sm:panel-slide-side"
      >
        <div className="px-5 py-4">
          <h2
            id="confirm-dialog-title"
            className="text-base font-semibold text-[var(--foreground)]"
          >
            {title}
          </h2>
          <div className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            {message}
          </div>
        </div>
        <div className="flex gap-3 border-t border-[var(--border)] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-medium transition hover:bg-[var(--background)] active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition active:scale-[0.98] ${
              destructive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-indigo-500 hover:bg-indigo-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
