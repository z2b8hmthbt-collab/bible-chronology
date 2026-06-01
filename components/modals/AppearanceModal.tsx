"use client";

import { ModalOverlay } from "../ui/ModalOverlay";
import { CategoryVisibilityList } from "../CategoryVisibilityList";
import { useTimelineStore } from "@/lib/store";
import type { useHiddenCategories } from "@/lib/use-hidden-categories";
import type { AppTheme, AppearanceSettings } from "@/lib/use-appearance-settings";

type CategoryVisibility = ReturnType<typeof useHiddenCategories>;

interface AppearanceModalProps {
  onClose: () => void;
  categoryVisibility: CategoryVisibility;
  appearance: AppearanceSettings;
}

const THEMES: { id: AppTheme; label: string; description: string }[] = [
  {
    id: "modern",
    label: "Modern",
    description: "Clean neutral look with indigo accents.",
  },
  {
    id: "parchment",
    label: "Parchment",
    description: "Warm paper tones suited to historical timelines.",
  },
];

export function AppearanceModal({
  onClose,
  categoryVisibility,
  appearance,
}: AppearanceModalProps) {
  const categories = useTimelineStore((s) => s.data.categories);
  const { hiddenCategoryIds, toggleCategory, showAllCategories } =
    categoryVisibility;
  const { theme, setTheme } = appearance;

  return (
    <ModalOverlay onClose={onClose} title="Appearance">
      <div className="space-y-6">
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Theme
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  theme === t.id
                    ? "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/30"
                    : "border-[var(--border)] hover:border-indigo-400/50"
                }`}
              >
                <span className="block text-sm font-medium">{t.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  {t.description}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Visible categories
          </h3>
          <CategoryVisibilityList
            categories={categories}
            hiddenCategoryIds={hiddenCategoryIds}
            onToggle={toggleCategory}
            onShowAll={showAllCategories}
          />
        </section>
      </div>
    </ModalOverlay>
  );
}
