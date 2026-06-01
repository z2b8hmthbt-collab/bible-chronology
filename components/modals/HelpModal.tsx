"use client";

import { ModalOverlay } from "../ui/ModalOverlay";

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <ModalOverlay onClose={onClose} title="Help & shortcuts">
      <div className="space-y-5">
        <HelpSection title="Getting around">
          <HelpList
            items={[
              "Scroll horizontally to move through time; drag with the mouse to pan (desktop).",
              "Pinch or use trackpad pinch-to-zoom to zoom in and out.",
              "Use the minimap above the timeline to jump to a region.",
              "Menu → Jump to year… to go to a specific year.",
              "Menu → Fit all to see the entire timeline at once.",
              "Your zoom level and scroll position are remembered when you return.",
              "On desktop, hover over the timeline to see the date under your cursor.",
            ]}
          />
        </HelpSection>

        <HelpSection title="Finding events">
          <HelpList
            items={[
              "Menu → Search events… to find events by title.",
              "Use Filter in the header to show or hide categories.",
              "The category legend below the minimap toggles categories too — click a pill to show/hide.",
              "Event titles stay visible at the left edge as you scroll through long spans.",
            ]}
          />
        </HelpSection>

        <HelpSection title="Adding & importing data">
          <HelpList
            items={[
              "+ Event and + Background add items manually (on desktop; use Menu on mobile).",
              "Menu → Import CSV to bulk-import events.",
              "Menu → AI extraction prompt… gives you a prompt to paste into ChatGPT (or similar) along with a PDF/image; copy the resulting CSV back here.",
              "Menu → Backup & restore to export or import your full timeline as JSON.",
            ]}
          />
        </HelpSection>

        <HelpSection title="Keyboard shortcuts">
          <p className="mb-2 text-xs text-[var(--muted)]">
            Shortcuts work on the main timeline view (not while a panel or modal
            is open).
          </p>
          <dl className="space-y-2 text-sm">
            <Shortcut keys={["+", "="]} action="Zoom in" />
            <Shortcut keys={["−"]} action="Zoom out" />
            <Shortcut keys={["f"]} action="Fit all" />
            <Shortcut keys={["/"]} action="Search events" />
            <Shortcut keys={["←", "→"]} action="Pan timeline" />
          </dl>
        </HelpSection>

        <HelpSection title="Tips">
          <HelpList
            items={[
              "Deleting an event or background shows an Undo toast for a few seconds.",
              "Menu → Site password… to set a password for your published site.",
              "Menu → Appearance… to change theme and category visibility defaults.",
              "Tap or click any event to open its details; featured events show a ★ marker.",
            ]}
          />
        </HelpSection>
      </div>
    </ModalOverlay>
  );
}

function HelpSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function HelpList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-[var(--foreground)]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Shortcut({ keys, action }: { keys: string[]; action: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[var(--muted)]">{action}</dt>
      <dd className="flex shrink-0 items-center gap-1">
        {keys.map((key, i) => (
          <span key={key} className="inline-flex items-center gap-1">
            {i > 0 && (
              <span className="text-xs text-[var(--muted)]">or</span>
            )}
            <kbd className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-xs">
              {key}
            </kbd>
          </span>
        ))}
      </dd>
    </div>
  );
}
