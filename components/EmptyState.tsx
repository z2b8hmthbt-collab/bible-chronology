"use client";

interface EmptyStateProps {
  onAddEvent: () => void;
  onImportCsv: () => void;
}

export function EmptyState({ onAddEvent, onImportCsv }: EmptyStateProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center p-6">
      <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-lg">
        <div
          aria-hidden
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--background)] text-2xl"
        >
          🕊️
        </div>
        <h2 className="font-serif text-xl font-semibold tracking-tight">
          Your timeline is empty
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[var(--muted)]">
          Add your first event by hand, or import a batch from a CSV file to get
          started.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onAddEvent}
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600 active:scale-[0.98]"
          >
            + Add event
          </button>
          <button
            type="button"
            onClick={onImportCsv}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium transition hover:bg-[var(--background)] active:scale-[0.98]"
          >
            Import CSV
          </button>
        </div>

        <p className="mt-5 text-xs text-[var(--muted)]">
          Tip: the Menu has an AI extraction prompt for pulling events out of a
          PDF or image.
        </p>
      </div>
    </div>
  );
}
