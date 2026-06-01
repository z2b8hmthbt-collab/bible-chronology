import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  TimelineData,
  TimelineEvent,
  Background,
  Category,
  DetailItem,
} from "./types";
import { createEmptyData, normalizeTimelineData } from "./types";
import { loadLocalData, saveLocalData } from "./storage";
import { mergeImportData, replaceTimelineData } from "./merge";
import {
  clearSavedTimelineView,
  notifyTimelineDataCleared,
} from "./timeline-view-storage";

interface TimelineStore {
  data: TimelineData;
  isLoaded: boolean;
  detailItem: DetailItem | null;

  initialize: () => Promise<void>;
  setDetailItem: (item: DetailItem | null) => void;

  addEvent: (event: Omit<TimelineEvent, "id" | "createdAt" | "updatedAt">) => void;
  updateEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  deleteEvent: (id: string) => void;
  restoreEvent: (event: TimelineEvent) => void;

  addBackground: (
    bg: Omit<Background, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateBackground: (id: string, updates: Partial<Background>) => void;
  deleteBackground: (id: string) => void;
  restoreBackground: (bg: Background) => void;

  addCategory: (cat: Omit<Category, "id" | "createdAt" | "updatedAt">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  findOrAddCategory: (name: string) => string;

  importData: (data: TimelineData, mode: "replace" | "merge") => void;
  exportData: () => TimelineData;
  clearAllData: () => void;

  persist: () => Promise<void>;
}

let persistQueue: Promise<void> = Promise.resolve();

function queuePersist(fn: () => Promise<void>): void {
  persistQueue = persistQueue.then(fn).catch(console.error);
}

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  data: createEmptyData(),
  isLoaded: false,
  detailItem: null,

  initialize: async () => {
    const local = normalizeTimelineData(await loadLocalData());
    set({ data: local, isLoaded: true });
  },

  setDetailItem: (item) => set({ detailItem: item }),

  addEvent: (event) => {
    const now = new Date().toISOString();
    const newEvent: TimelineEvent = {
      ...event,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ data: { ...s.data, events: [...s.data.events, newEvent] } }));
    get().persist();
  },

  updateEvent: (id, updates) => {
    const now = new Date().toISOString();
    set((s) => {
      const events = s.data.events.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: now } : e
      );
      const updated = events.find((e) => e.id === id);
      return {
        data: { ...s.data, events },
        detailItem:
          s.detailItem?.type === "event" && s.detailItem.data.id === id && updated
            ? { type: "event", data: updated }
            : s.detailItem,
      };
    });
    get().persist();
  },

  deleteEvent: (id) => {
    set((s) => ({
      data: { ...s.data, events: s.data.events.filter((e) => e.id !== id) },
      detailItem:
        s.detailItem?.type === "event" && s.detailItem.data.id === id
          ? null
          : s.detailItem,
    }));
    get().persist();
  },

  restoreEvent: (event) => {
    set((s) =>
      s.data.events.some((e) => e.id === event.id)
        ? s
        : { data: { ...s.data, events: [...s.data.events, event] } }
    );
    get().persist();
  },

  addBackground: (bg) => {
    const now = new Date().toISOString();
    const newBg: Background = {
      ...bg,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({
      data: { ...s.data, backgrounds: [...s.data.backgrounds, newBg] },
    }));
    get().persist();
  },

  updateBackground: (id, updates) => {
    const now = new Date().toISOString();
    set((s) => {
      const backgrounds = s.data.backgrounds.map((b) =>
        b.id === id ? { ...b, ...updates, updatedAt: now } : b
      );
      const updated = backgrounds.find((b) => b.id === id);
      return {
        data: { ...s.data, backgrounds },
        detailItem:
          s.detailItem?.type === "background" &&
          s.detailItem.data.id === id &&
          updated
            ? { type: "background", data: updated }
            : s.detailItem,
      };
    });
    get().persist();
  },

  deleteBackground: (id) => {
    set((s) => ({
      data: {
        ...s.data,
        backgrounds: s.data.backgrounds.filter((b) => b.id !== id),
      },
      detailItem:
        s.detailItem?.type === "background" && s.detailItem.data.id === id
          ? null
          : s.detailItem,
    }));
    get().persist();
  },

  restoreBackground: (bg) => {
    set((s) =>
      s.data.backgrounds.some((b) => b.id === bg.id)
        ? s
        : { data: { ...s.data, backgrounds: [...s.data.backgrounds, bg] } }
    );
    get().persist();
  },

  addCategory: (cat) => {
    const now = new Date().toISOString();
    const newCat: Category = {
      ...cat,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({
      data: { ...s.data, categories: [...s.data.categories, newCat] },
    }));
    get().persist();
  },

  updateCategory: (id, updates) => {
    const now = new Date().toISOString();
    set((s) => ({
      data: {
        ...s.data,
        categories: s.data.categories.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: now } : c
        ),
      },
    }));
    get().persist();
  },

  deleteCategory: (id) => {
    set((s) => ({
      data: {
        ...s.data,
        categories: s.data.categories.filter((c) => c.id !== id),
        events: s.data.events.map((e) =>
          e.categoryId === id ? { ...e, categoryId: "cat-default" } : e
        ),
      },
    }));
    get().persist();
  },

  findOrAddCategory: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return get().data.categories[0]?.id ?? "cat-default";

    const existing = get().data.categories.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return existing.id;

    const colors = [
      "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#ec4899",
      "#8b5cf6", "#06b6d4", "#84cc16", "#f97316", "#64748b",
    ];
    const color = colors[get().data.categories.length % colors.length];
    get().addCategory({ name: trimmed, color });
    return get().data.categories[get().data.categories.length - 1].id;
  },

  importData: (data, mode) => {
    const normalized = normalizeTimelineData(data);
    const result =
      mode === "replace"
        ? replaceTimelineData(normalized)
        : mergeImportData(get().data, normalized);
    set({ data: result });
    get().persist();
  },

  exportData: () => structuredClone(get().data),

  clearAllData: () => {
    set({
      data: replaceTimelineData(createEmptyData()),
      detailItem: null,
    });
    clearSavedTimelineView();
    notifyTimelineDataCleared();
    get().persist();
  },

  persist: async () => {
    queuePersist(async () => {
      await saveLocalData(get().data);
    });
  },
}));
