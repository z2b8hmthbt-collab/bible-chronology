"use client";

import { useMemo, useState } from "react";
import { ModalOverlay } from "../ui/ModalOverlay";
import { useTimelineStore } from "@/lib/store";

interface AiPromptModalProps {
  onClose: () => void;
}

function buildPrompt(categoryNames: string[]): string {
  const categories =
    categoryNames.length > 0
      ? categoryNames.join(", ")
      : "Event, Person, Covenant, World Power";

  return `You are helping me extract historical/biblical timeline events from the attached image or PDF and convert them into a CSV file that I will import into my timeline app.

Output ONLY a CSV file inside a single \`\`\`csv code block. Do not write any commentary before or after it.

Use EXACTLY this header row as the first line:
Title,Start Date,End Date,Category,Description

Rules:
1. One row per event. Extract every event that has a determinable date or date range.
2. Date format = YYYY-MM-DD:
   - BCE / B.C.E. / BC dates use a NEGATIVE year. Example: 2370 BCE -> -2370-01-01
   - CE / C.E. / AD dates use a POSITIVE year. Example: 33 CE -> 0033-01-01
   - There is no year zero.
   - If only the year is known, use -01-01 for the month and day. Example: 1513 BCE -> -1513-01-01
   - Zero-pad years to 4 digits where possible (e.g. 0033, 0997, -0740).
3. Start Date = when the event or lifespan begins. End Date = when it ends.
   - For a lifespan or a period that spans years, fill in BOTH Start Date and End Date.
   - For a single moment in time, leave End Date EMPTY.
4. Category: use one of my existing categories when it fits: ${categories}.
   If none fit, create a short, consistent category name of your own and reuse it for similar items.
5. Description: optional. Add brief context, scripture references, or the word "Approximate"
   if the source marks the date as uncertain (e.g. a ~ or * symbol).
6. If any field contains a comma, wrap that whole field in double quotes.
7. Do NOT invent dates. If an item has no determinable date, leave it out.
   If a date is only approximate, give your best single estimate and write "Approximate" in Description.
8. Keep Titles concise — just the event or person's name.

Example of correctly formatted rows:
Global deluge,-2370-01-01,,Event,Approximate
Abraham,-2018-01-01,-1843-01-01,Person,Lifespan
Holy spirit poured out at Pentecost,0033-01-01,,Event,

After the CSV code block, stop. I will save it as a .csv file and import it directly.`;
}

export function AiPromptModal({ onClose }: AiPromptModalProps) {
  const categories = useTimelineStore((s) => s.data.categories);
  const prompt = useMemo(
    () => buildPrompt(categories.map((c) => c.name)),
    [categories]
  );
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the textarea contents for manual copy
      const ta = document.getElementById(
        "ai-prompt-text"
      ) as HTMLTextAreaElement | null;
      ta?.select();
    }
  };

  return (
    <ModalOverlay onClose={onClose} title="AI extraction prompt">
      <div className="space-y-4">
        <div className="space-y-2 text-sm text-[var(--muted)]">
          <p>
            Use this to pull events out of an <strong>image or PDF</strong> (like a
            printed timeline or chart) with an AI tool, then import the result here.
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Press <strong>Copy prompt</strong> below.</li>
            <li>
              Open an AI tool that accepts file uploads (e.g. ChatGPT, Claude,
              Gemini).
            </li>
            <li>Paste the prompt and attach your image or PDF in the same message.</li>
            <li>
              Save the CSV it returns as a <code>.csv</code> file (copy the contents
              of the code block into a plain text file).
            </li>
            <li>
              Come back here and use <strong>Menu → Import CSV</strong> to add the
              events.
            </li>
          </ol>
        </div>

        <textarea
          id="ai-prompt-text"
          readOnly
          value={prompt}
          onFocus={(e) => e.currentTarget.select()}
          className="h-64 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-relaxed text-[var(--foreground)]"
        />

        <div className="flex items-center justify-end gap-3">
          <span
            className={`text-sm text-emerald-600 transition-opacity ${
              copied ? "opacity-100" : "opacity-0"
            }`}
            aria-live="polite"
          >
            Copied to clipboard
          </span>
          <button
            type="button"
            onClick={copy}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600 active:scale-[0.98]"
          >
            Copy prompt
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
