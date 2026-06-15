"use client";

import { useState } from "react";
import { ModalOverlay } from "../ui/ModalOverlay";
import {
  FormField,
  selectClass,
  buttonPrimaryClass,
} from "../ui/FormField";
import {
  parseCsv,
  autoDetectMapping,
  convertCsvToRows,
  splitCategoryNames,
  type CsvFieldMapping,
  type CsvRow,
} from "@/lib/csv-import";
import { useTimelineStore } from "@/lib/store";

interface CsvImportModalProps {
  onClose: () => void;
}

const FIELD_LABELS: Record<keyof CsvFieldMapping, string> = {
  title: "Title",
  startDate: "Start Date",
  endDate: "End Date",
  description: "Description",
  intro: "Intro / Summary",
  fullText: "Full Text",
  category: "Category",
  link: "External Link",
};

const REQUIRED_FIELDS: (keyof CsvFieldMapping)[] = ["title", "startDate"];

export function CsvImportModal({ onClose }: CsvImportModalProps) {
  const addEvent = useTimelineStore((s) => s.addEvent);
  const findOrAddCategory = useTimelineStore((s) => s.findOrAddCategory);

  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<CsvFieldMapping>({
    title: "",
    startDate: "",
    endDate: "",
    description: "",
    intro: "",
    fullText: "",
    category: "",
    link: "",
  });
  const [preview, setPreview] = useState<CsvRow[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [skipReasons, setSkipReasons] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "map" | "preview">("upload");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = parseCsv(reader.result as string);
      setWarnings(result.warnings);

      if (result.error || result.headers.length === 0) {
        setParseError(
          result.error ??
            "Could not read this file. Try opening it in TextEdit, choose Format → Make Plain Text, save, and upload again."
        );
        setStep("upload");
        return;
      }

      setParseError(null);
      setHeaders(result.headers);
      setRows(result.rows);
      setMapping(autoDetectMapping(result.headers));
      setStep("map");
    };
    reader.onerror = () => {
      setParseError("Could not read the selected file.");
      setStep("upload");
    };
    reader.readAsText(file, "UTF-8");
  };

  const handlePreview = () => {
    if (!mapping.title || !mapping.startDate) {
      setParseError("Title and Start Date columns are required.");
      return;
    }

    const { valid, skipped: s, skipReasons: reasons } = convertCsvToRows(
      headers,
      rows,
      mapping
    );
    setPreview(valid);
    setSkipped(s);
    setSkipReasons(reasons);
    setParseError(valid.length === 0 ? "No valid rows found. Check your column mapping and date formats." : null);
    setStep("preview");
  };

  const handleImport = () => {
    for (const row of preview) {
      const names = splitCategoryNames(row.category);
      const resolvedNames = names.length > 0 ? names : ["General"];
      const categoryIds = [
        ...new Set(resolvedNames.map((name) => findOrAddCategory(name))),
      ];
      addEvent({
        title: row.title,
        startDate: row.startDate,
        endDate: row.endDate || undefined,
        notes: row.description,
        categoryIds,
        links: row.link ? [row.link] : [],
      });
    }

    onClose();
  };

  return (
    <ModalOverlay onClose={onClose} title="Import CSV">
      {step === "upload" && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">
            Upload a CSV export from Tiki-Toki or another timeline app.
            BC dates (e.g. &quot;4300 BC&quot;) are supported.
          </p>
          {parseError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {parseError}
            </p>
          )}
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={handleFile}
            className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-500 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
          />
        </div>
      )}

      {step === "map" && (
        <div className="space-y-4">
          {warnings.map((w, i) => (
            <p
              key={i}
              className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
            >
              {w}
            </p>
          ))}

          <p className="text-sm text-[var(--muted)]">
            Found <strong>{rows.length}</strong> rows. Map columns below
            (auto-detected where possible).
          </p>

          {(Object.keys(FIELD_LABELS) as (keyof CsvFieldMapping)[]).map(
            (field) => (
              <FormField
                key={field}
                label={FIELD_LABELS[field]}
                required={REQUIRED_FIELDS.includes(field)}
              >
                <select
                  className={selectClass}
                  value={mapping[field]}
                  onChange={(e) =>
                    setMapping({ ...mapping, [field]: e.target.value })
                  }
                >
                  <option value="">— None —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </FormField>
            )
          )}

          {parseError && (
            <p className="text-sm text-red-500">{parseError}</p>
          )}

          <button onClick={handlePreview} className={buttonPrimaryClass}>
            Preview Import
          </button>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <p className="text-sm">
            <strong>{preview.length}</strong> events ready to import
            {skipped > 0 && (
              <span className="text-[var(--muted)]">
                {" "}
                ({skipped} rows skipped)
              </span>
            )}
          </p>

          {skipReasons.length > 0 && (
            <ul className="text-xs text-[var(--muted)] list-disc pl-4 space-y-0.5">
              {skipReasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}

          <div className="max-h-60 overflow-y-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[var(--surface)]">
                <tr className="border-b border-[var(--border)]">
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Start</th>
                  <th className="px-3 py-2 text-left">End</th>
                  <th className="px-3 py-2 text-left">Category</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 50).map((row, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td className="px-3 py-1.5 max-w-[120px] truncate">{row.title}</td>
                    <td className="px-3 py-1.5 whitespace-nowrap">{row.startDate}</td>
                    <td className="px-3 py-1.5 whitespace-nowrap">{row.endDate || "—"}</td>
                    <td className="px-3 py-1.5 max-w-[80px] truncate">{row.category || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 50 && (
              <p className="p-2 text-center text-xs text-[var(--muted)]">
                …and {preview.length - 50} more
              </p>
            )}
          </div>

          <button
            onClick={handleImport}
            disabled={preview.length === 0}
            className={buttonPrimaryClass}
          >
            Import {preview.length} Events
          </button>
        </div>
      )}
    </ModalOverlay>
  );
}
