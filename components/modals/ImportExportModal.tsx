"use client";

import { useRef, useState } from "react";
import { ModalOverlay } from "../ui/ModalOverlay";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { buttonPrimaryClass, buttonSecondaryClass } from "../ui/FormField";
import { useTimelineStore } from "@/lib/store";
import type { TimelineData } from "@/lib/types";

interface ImportExportModalProps {
  onClose: () => void;
}

export function ImportExportModal({ onClose }: ImportExportModalProps) {
  const exportData = useTimelineStore((s) => s.exportData);
  const importData = useTimelineStore((s) => s.importData);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<"replace" | "merge" | null>(null);
  const [pendingData, setPendingData] = useState<TimelineData | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timeline-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as TimelineData;
        if (!parsed.events || !parsed.backgrounds || !parsed.categories) {
          throw new Error("Invalid backup format");
        }
        setPendingData(parsed);
        setImportMode(null);
        setError(null);
      } catch {
        setError("Invalid JSON file — choose a timeline backup exported from this app.");
        setPendingData(null);
      }
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
