"use client";

import { useRef, useState } from "react";
import { ModalOverlay } from "../ui/ModalOverlay";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { buttonPrimaryClass, buttonSecondaryClass } from "../ui/FormField";
import { useTimelineStore } from "@/lib/store";
import { downloadTimelineBackup } from "@/lib/download-backup";
import { parseTimelineData } from "@/lib/parse-timeline-data";
import { showToast } from "@/lib/use-toast";
import type { TimelineData } from "@/lib/types";

interface ImportExportModalProps {
  onClose: () => void;
}

export function ImportExportModal({ onClose }: ImportExportModalProps) {
  const data = useTimelineStore((s) => s.data);
  const exportData = useTimelineStore((s) => s.exportData);
  const importData = useTimelineStore((s) => s.importData);
  const clearAllData = useTimelineStore((s) => s.clearAllData);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<"replace" | "merge" | null>(null);
  const [pendingData, setPendingData] = useState<TimelineData | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const hasTimelineContent =
    data.events.length > 0 || data.backgrounds.length > 0;

  const handleExport = () => {
    downloadTimelineBackup(exportData());
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string);
        const { data: parsed, warnings } = parseTimelineData(raw);
        setPendingData(parsed);
        setImportMode(null);
        setError(null);
        if (warnings.length > 0) {
          showToast({
            message: `Import preview: ${warnings.length} item(s) skipped or adjusted.`,
            duration: 6000,
          });
        }
      } catch {
        setError("Invalid JSON file — choose a timeline backup exported from this app.");
        setPendingData(null);
      }
    };
    reader.onerror = () => {
      setError("Could not read the selected file.");
      setPendingData(null);
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!pendingData || !importMode) return;
    if (importMode === "replace") {
      setShowReplaceConfirm(true);
      return;
    }
    doImport();
  };

  const doImport = () => {
    if (!pendingData || !importMode) return;
    importData(pendingData, importMode);
    setPendingData(null);
    setImportMode(null);
    setSelectedFileName(null);
    setShowReplaceConfirm(false);
    onClose();
  };

  const handleClearAll = () => {
    clearAllData();
    setShowClearConfirm(false);
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose} title="Backup & Restore">
      <div className="space-y-4">
        <BackupSection
          title="Export backup"
          description="Download your full timeline as a JSON file."
        >
          <button type="button" onClick={handleExport} className={buttonPrimaryClass}>
            Download backup
          </button>
        </BackupSection>

        <BackupSection
          title="Restore backup"
          description="Upload a previously exported JSON backup."
        >
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`${buttonSecondaryClass} w-full`}
          >
            Choose backup file
          </button>
          {selectedFileName && !error && (
            <p className="mt-2 truncate text-xs text-[var(--muted)]">
              Selected: {selectedFileName}
            </p>
          )}
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </BackupSection>

        {pendingData && (
          <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-sm font-medium">Ready to import</p>
            <p className="text-sm text-[var(--muted)]">
              {pendingData.events.length} events ·{" "}
              {pendingData.backgrounds.length} backgrounds ·{" "}
              {pendingData.categories.length} categories
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setImportMode("merge")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                  importMode === "merge"
                    ? "bg-indigo-500 text-white"
                    : "border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--background)]"
                }`}
              >
                Merge
              </button>
              <button
                type="button"
                onClick={() => setImportMode("replace")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                  importMode === "replace"
                    ? "bg-red-500 text-white"
                    : "border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--background)]"
                }`}
              >
                Replace all
              </button>
            </div>

            {importMode && (
              <button
                type="button"
                onClick={confirmImport}
                className={buttonPrimaryClass}
              >
                Confirm import
              </button>
            )}
          </div>
        )}

        <BackupSection
          title="Start fresh"
          description="Remove all events and backgrounds on this device. Default categories are restored. This cannot be undone."
        >
          {hasTimelineContent ? (
            <p className="mb-3 text-xs text-[var(--muted)]">
              Current timeline: {data.events.length} events ·{" "}
              {data.backgrounds.length} backgrounds · {data.categories.length}{" "}
              categories
            </p>
          ) : (
            <p className="mb-3 text-xs text-[var(--muted)]">
              Your timeline is already empty.
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleExport}
              disabled={!hasTimelineContent}
              className={`${buttonSecondaryClass} flex-1 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Download backup first
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              disabled={!hasTimelineContent}
              className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
            >
              Clear all data
            </button>
          </div>
        </BackupSection>
      </div>

      {showReplaceConfirm && (
        <ConfirmDialog
          title="Replace all data"
          message="This will permanently replace ALL of your existing events, backgrounds, and categories with the backup. This can't be undone."
          confirmLabel="Replace all"
          onConfirm={doImport}
          onCancel={() => setShowReplaceConfirm(false)}
        />
      )}

      {showClearConfirm && (
        <ConfirmDialog
          title="Clear all timeline data?"
          message={
            <>
              <p>
                This removes every event and background on this device and resets
                categories to the defaults. Your saved zoom and scroll position
                are reset too.
              </p>
              <p className="mt-2">
                Download a backup first if you might need this data again. This
                cannot be undone.
              </p>
            </>
          }
          confirmLabel="Clear everything"
          onConfirm={handleClearAll}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </ModalOverlay>
  );
}

function BackupSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-1 mb-3 text-xs text-[var(--muted)]">{description}</p>
      {children}
    </section>
  );
}
