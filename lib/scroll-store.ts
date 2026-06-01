export type ScrollStore = {
  setScrollLeft: (value: number) => void;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => number;
};

export function createScrollStore(initial = 0): ScrollStore {
  let scrollLeft = initial;
  const listeners = new Set<() => void>();

  return {
    setScrollLeft(value: number) {
      const next = Math.max(0, value);
      if (next === scrollLeft) return;
      scrollLeft = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => scrollLeft,
  };
}
