"use client";

import { useState } from "react";
import { ModalOverlay } from "../ui/ModalOverlay";
import { sha256Hex } from "@/lib/storage";

interface SitePasswordModalProps {
  onClose: () => void;
}

export function SitePasswordModal({ onClose }: SitePasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [envLine, setEnvLine] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCopied(false);
    if (password.length < 4) {
      setError("Use at least 4 characters.");
      setEnvLine(null);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      setEnvLine(null);
      return;
    }
    setError(null);
    const hash = await sha256Hex(password);
    setEnvLine(`NEXT_PUBLIC_APP_PASSWORD_HASH=${hash}`);
  };

  const copy = async () => {
    if (!envLine) return;
    try {
      await navigator.clipboard.writeText(envLine);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <ModalOverlay onClose={onClose} title="Site password">
      <div className="space-y-5">
        <div className="space-y-2 text-sm text-[var(--muted)]">
          <p>
            This sets the password that locks the <strong>published site</strong> for
            every visitor. Because the app has no server, the password is built into
            the site — so changing it takes a quick rebuild &amp; redeploy.
          </p>
          <p>
            Enter a password below to generate the line you paste into your{" "}
            <code>.env.local</code> file. Your typed password is hashed in your
            browser and never stored.
          </p>
        </div>

        <form onSubmit={generate} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setEnvLine(null);
              setError(null);
            }}
            placeholder="New password"
            autoFocus
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setEnvLine(null);
              setError(null);
            }}
            placeholder="Confirm password"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600 active:scale-[0.98]"
          >
            Generate password line
          </button>
        </form>

        {envLine && (
          <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Add this line to .env.local
            </p>
            <code className="block break-all rounded-lg bg-[var(--surface)] p-2.5 font-mono text-xs">
              {envLine}
            </code>
            <div className="flex items-center justify-between gap-3">
              <span
                className={`text-sm text-emerald-600 transition-opacity ${
                  copied ? "opacity-100" : "opacity-0"
                }`}
              >
                Copied
              </span>
              <button
                type="button"
                onClick={copy}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium transition hover:bg-[var(--surface)]"
              >
                Copy line
              </button>
            </div>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-[var(--muted)]">
              <li>Paste the line into <code>.env.local</code> (replace any existing one).</li>
              <li>Rebuild: <code>npm run build</code>.</li>
              <li>Redeploy the new <code>out/</code> folder.</li>
              <li>
                Each device will be asked for the new password once, then remembered.
              </li>
            </ol>
          </div>
        )}

        <p className="text-xs text-[var(--muted)]">
          Note: a client-side password keeps casual visitors out, but isn&apos;t
          strong security — anyone technical could bypass it. For true protection,
          add password protection at your web host.
        </p>
      </div>
    </ModalOverlay>
  );
}
