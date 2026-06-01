"use client";

import type { Category } from "@/lib/types";

interface CategoryVisibilityListProps {
  categories: Category[];
  hiddenCategoryIds: string[];
  onToggle: (categoryId: string) => void;
  onShowAll: () => void;
}

export function CategoryVisibilityList({
  categories,
  hiddenCategoryIds,
  onToggle,
  onShowAll,
}: CategoryVisibilityListProps) {
  if (categories.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No categories yet. Use Manage categories to add some.
      </p>
    );
  }

  const hasHidden = hiddenCategoryIds.length > 0;

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--muted)]">
        Choose which categories appear on the timeline. Hidden categories stay
        in your data — they&apos;re just not shown.
      </p>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const visible = !hiddenCategoryIds.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onToggle(category.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                visible
                  ? "bg-[var(--background)] text-[var(--foreground)] ring-1 ring-[var(--border)] hover:ring-indigo-400"
                  : "bg-[var(--background)]/50 text-[var(--muted)] opacity-50 line-through ring-1 ring-transparent hover:opacity-70"
              }`}
              aria-pressed={visible}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </button>
          );
        })}
      </div>

      {hasHidden && (
        <button
          type="button"
          onClick={onShowAll}
          className="text-sm font-medium text-indigo-500 hover:text-indigo-600"
        >
          Show all categories
        </button>
      )}
    </div>
  );
}
