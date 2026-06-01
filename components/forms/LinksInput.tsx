"use client";

import { FormField, inputClass } from "../ui/FormField";

interface LinksInputProps {
  links: string[];
  onChange: (links: string[]) => void;
}

export function LinksInput({ links, onChange }: LinksInputProps) {
  const updateLink = (index: number, value: string) => {
    const next = [...links];
    next[index] = value;
    onChange(next);
  };

  const addLink = () => onChange([...links, ""]);
  const removeLink = (index: number) =>
    onChange(links.filter((_, i) => i !== index));

  const displayLinks = links.length > 0 ? links : [""];

  return (
    <FormField label="Links">
      <div className="space-y-2">
        {displayLinks.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputClass}
              type="url"
              value={link}
              onChange={(e) => updateLink(i, e.target.value)}
              placeholder="https://…"
            />
            {displayLinks.length > 1 && (
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="shrink-0 rounded-lg px-2 text-[var(--muted)] hover:bg-[var(--background)]"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addLink}
          className="text-sm text-indigo-500 hover:text-indigo-600"
        >
          + Add link
        </button>
      </div>
    </FormField>
  );
}
