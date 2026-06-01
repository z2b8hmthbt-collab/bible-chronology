"use client";

import { useSyncExternalStore } from "react";
import type { ScrollStore } from "@/lib/scroll-store";

export function useScrollStore(store: ScrollStore): number {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
}
