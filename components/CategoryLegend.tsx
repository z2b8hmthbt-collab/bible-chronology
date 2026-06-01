"use client";

import { useEffect, useState } from "react";
import { useTimelineStore } from "@/lib/store";
import type { useHiddenCategories } from "@/lib/use-hidden-categories";

type CategoryVisibility = ReturnType<typeof useHiddenCategories>;

const COLLAPSED_KEY = "timeline-legend-collapsed";

interface CategoryLegendProps {
  categoryVisibility: CategoryVisibility;
}

export function CategoryLegend({ categoryVisibility }: CategoryLegendProps) {
  const categories = useTimelineStore((s) => s.data.categories);
  const { hiddenCategoryIds, toggleCategory } = categoryVisibility;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLLAPSED_KEY);
      if (raw === "true") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  if (categories.length === 0) return null;

  return (
    <div className="shrink-0 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center gap-2 px-3 py-1.5">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-[var(--foreground)]"
        >
          Legend
          <span aria-hidden className="text-[10px]">
            {collapsed ? "▸" : "▾"}
          </span>
        </button>

        {!collapsed && (
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-0.5">
            {categories.map((category) => {
              const visible = !hiddenCategoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={visible}
                  onClick={() => toggleCategory(category.id)}
                  title={
                    visible
                      ? `Hide ${category.name}`
                      : `Show ${category.name}`
                  }
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs transition hover:bg-[var(--background)] active:scale-[0.98] ${
                    visible
                      ? "border-[var(--border)] text-[var(--foreground)]"
                      : "border-transparent bg-[var(--background)] text-[var(--muted)] opacity-60"
                  }`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: category.color,
                      opacity: visible ? 1 : 0.35,
                    }}
                  />
                  <span className={visible ? "" : "line-through"}>
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
