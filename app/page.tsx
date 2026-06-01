"use client";

import { useEffect, useState } from "react";
import { PasswordGate } from "@/components/PasswordGate";
import { AppShell } from "@/components/AppShell";
import { isAuthenticated } from "@/lib/storage";
import { useTimelineStore } from "@/lib/store";

export default function HomePage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const initialize = useTimelineStore((s) => s.initialize);
  const isLoaded = useTimelineStore((s) => s.isLoaded);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  useEffect(() => {
    if (!authed) return;
    initialize();
  }, [authed, initialize]);

  if (authed === null) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} />;
  }

  if (!isLoaded) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return <AppShell />;
}
