"use client";

import { useEffect, useRef, useState } from "react";
import { useTimelineStore } from "@/lib/store";
import type { useHiddenCategories } from "@/lib/use-hidden-categories";

type CategoryVisibility = ReturnType<typeof useHiddenCategories>;

interface CategoryFilterMenuProps {
  categoryVisibility: CategoryVisibility;
  buttonClassName: string;
}

export function CategoryFilterMenu({
  categoryVisibility,
  buttonClassName,
}: CategoryFilterMenuProps) {
  const categories = useTimelineStore((s) => s.data.categories);
  const { hiddenCategoryIds, toggleCategory, showAllCategories, hideAllCategories } =
    categoryVisibility;

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const hiddenCount = hiddenCategoryIds.length;
  const allHidden = categories.length > 0 && hiddenCount >= categories.length;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={buttonClassName}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Filter
        {hiddenCount > 0 && (
          <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-semibold text-white">
            {hiddenCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Categories
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={showAllCategories}
                disabled={hiddenCount === 0}
                className="text-xs font-medium text-indigo-500 transition hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                All
              </button>
              <span className="text-[var(--border)]">|</span>
              <button
                type="button"
                onClick={() => hideAllCategories(categories.map((c) => c.id))}
                disabled={allHidden}
                className="text-xs font-medium text-indigo-500 transition hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                None
              </button>
            </div>
          </div>

          {categories.length === 0 ? (
            <p className="px-3 py-3 text-sm text-[var(--muted)]">
              No categories yet.
            </p>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto py-1">
              {categories.map((category) => {
                const visible = !hiddenCategoryIds.includes(category.id);
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      role="menuitemcheckbox"
                      aria-checked={visible}
                      onClick={() => toggleCategory(category.id)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-[var(--background)]"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                          visible
                            ? "border-transparent text-white"
                            : "border-[var(--border)] bg-transparent"
                        }`}
                        style={visible ? { backgroundColor: category.color } : undefined}
                      >
                        {visible && (
                          <svg
                            viewBox="0 0 12 12"
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span
                        className={`min-w-0 flex-1 truncate ${
                          visible ? "" : "text-[var(--muted)]"
                        }`}
                      >
                        {category.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
