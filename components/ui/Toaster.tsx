"use client";

import { useEffect } from "react";
import { useToastStore, type Toast } from "@/lib/use-toast";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useToastStore((s) => s.dismissToast);

  useEffect(() => {
    if (toast.duration === null) return;
    const timer = setTimeout(
      () => dismissToast(toast.id),
      toast.duration ?? 5000
    );
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismissToast]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-lg panel-slide-up"
    >
      <span className="flex-1 text-sm text-[var(--foreground)]">
        {toast.message}
      </span>
      {toast.actionLabel && (
        <button
          type="button"
          onClick={() => {
            toast.onAction?.();
            dismissToast(toast.id);
          }}
          className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-indigo-500 transition hover:bg-[var(--background)] active:scale-[0.98]"
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss"
        className="shrink-0 rounded-lg px-1.5 py-1 text-[var(--muted)] transition hover:bg-[var(--background)]"
      >
        ✕
      </button>
    </div>
  );
}
