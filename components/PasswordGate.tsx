"use client";

import { useState } from "react";
import { authenticate } from "@/lib/storage";

interface PasswordGateProps {
  onSuccess: () => void;
}

export function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checking) return;
    setChecking(true);
    try {
      if (await authenticate(password)) {
        onSuccess();
      } else {
        setError(true);
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-[var(--background)] px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-serif mb-2 text-center text-2xl font-semibold tracking-tight">
          Bible Chronology
        </h1>
        <p className="mb-8 text-center text-sm text-[var(--muted)]">
          Enter password to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Password"
            autoFocus
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          {error && (
            <p className="text-center text-sm text-red-500">
              Incorrect password
            </p>
          )}
          <button
            type="submit"
            disabled={checking}
            className="w-full rounded-xl bg-indigo-500 py-3 text-base font-medium text-white transition hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-60"
          >
            {checking ? "Checking…" : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}
