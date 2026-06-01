"use client";

import { useCallback, useLayoutEffect, useState, useSyncExternalStore, type RefObject } from "react";

/** Subscribe to a scroll container's `scrollLeft` (authoritative DOM value). */
export function useElementScrollLeft(
  elementRef: RefObject<HTMLElement | null>
): number {
  const [element, setElement] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setElement(elementRef.current);
  });

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!element) return () => {};
      const onScroll = () => onStoreChange();
      element.addEventListener("scroll", onScroll, { passive: true });
      return () => element.removeEventListener("scroll", onScroll);
    },
    [element]
  );

  const getSnapshot = useCallback(() => element?.scrollLeft ?? 0, [element]);

  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}
