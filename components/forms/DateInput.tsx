"use client";

import { useEffect, useState } from "react";
import { inputClass, selectClass } from "../ui/FormField";
import {
  parseTimelineDate,
  formatPartsToStorage,
  type TimelineDateParts,
} from "@/lib/date-utils";

type Era = "BCE" | "CE";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MONTHS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

function daysInMonth(month: number, yearAbs: number): number {
  if (month === 2) {
    const y = yearAbs;
    const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
    return leap ? 29 : 28;
  }
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 31;
}

function partsToFields(parts: TimelineDateParts | null): {
  month: number;
  day: number;
  yearAbs: string;
  era: Era;
} {
  if (!parts) {
    return { month: 1, day: 1, yearAbs: "", era: "CE" };
  }
  return {
    month: parts.month,
    day: parts.day,
    yearAbs: String(Math.abs(parts.year)),
    era: parts.year < 0 ? "BCE" : "CE",
  };
}

function fieldsToStorage(
  month: number,
  day: number,
  yearAbs: string,
  era: Era
): string {
  const y = parseInt(yearAbs, 10);
  if (!y || y < 1) return "";
  const maxDay = daysInMonth(month, era === "CE" ? y : y);
  const safeDay = Math.min(day, maxDay);
  const year = era === "BCE" ? -y : y;
  return formatPartsToStorage({ year, month, day: safeDay });
}

export function DateInput({ value, onChange }: DateInputProps) {
  const parsed = parseTimelineDate(value);
  const initial = partsToFields(parsed);

  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const [yearAbs, setYearAbs] = useState(initial.yearAbs);
  const [era, setEra] = useState<Era>(initial.era);

  useEffect(() => {
    const p = parseTimelineDate(value);
    const f = partsToFields(p);
    setMonth(f.month);
    setDay(f.day);
    setYearAbs(f.yearAbs);
    setEra(f.era);
  }, [value]);

  const emit = (
    m: number,
    d: number,
    y: string,
    e: Era
  ) => {
    onChange(fieldsToStorage(m, d, y, e));
  };

  const yNum = parseInt(yearAbs, 10) || 1;
  const maxDay = daysInMonth(month, era === "CE" ? yNum : yNum);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[minmax(4.25rem,1fr)_minmax(2.25rem,3rem)_minmax(5.75rem,1.35fr)] gap-2">
        <select
          className={selectClass}
          value={month}
          onChange={(e) => {
            const m = parseInt(e.target.value, 10);
            const d = Math.min(day, daysInMonth(m, yNum));
            setMonth(m);
            setDay(d);
            emit(m, d, yearAbs, era);
          }}
          aria-label="Month"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          className={`${selectClass} px-2 text-center tabular-nums`}
          value={Math.min(day, maxDay)}
          onChange={(e) => {
            const d = parseInt(e.target.value, 10);
            setDay(d);
            emit(month, d, yearAbs, era);
          }}
          aria-label="Day"
        >
          {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={1}
          max={9999}
          className={`${inputClass} tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
          value={yearAbs}
          onChange={(e) => {
            setYearAbs(e.target.value);
            emit(month, day, e.target.value, era);
          }}
          placeholder="Year"
          aria-label="Year"
        />
      </div>

      <div className="flex rounded-xl bg-[var(--background)] p-1 ring-1 ring-[var(--border)]">
        {(["BCE", "CE"] as const).map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => {
              setEra(e);
              emit(month, day, yearAbs, e);
            }}
            aria-pressed={era === e}
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

      {yearAbs && (
        <p className="text-[11px] text-[var(--muted)]">
          {era === "BCE"
            ? `${month}/${day}/${yearAbs} BCE`
            : `${month}/${day}/${yearAbs} CE`}
        </p>
      )}
    </div>
  );
}
