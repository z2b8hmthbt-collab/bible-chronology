import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { TimelineData } from "./types";
import { createEmptyData } from "./types";

interface TimelineDB extends DBSchema {
  data: {
    key: string;
    value: TimelineData;
  };
}

const DB_NAME = "timeline-app";
const DB_VERSION = 1;
const DATA_KEY = "timeline";

let dbPromise: Promise<IDBPDatabase<TimelineDB>> | null = null;

function getDB(): Promise<IDBPDatabase<TimelineDB>> {
  if (!dbPromise) {
    dbPromise = openDB<TimelineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("data")) {
          db.createObjectStore("data");
        }
      },
    });
  }
  return dbPromise;
}

export async function loadLocalData(): Promise<TimelineData> {
  try {
    const db = await getDB();
    const data = await db.get("data", DATA_KEY);
    return data ?? createEmptyData();
  } catch {
    return createEmptyData();
  }
}

export async function saveLocalData(data: TimelineData): Promise<void> {
  const db = await getDB();
  await db.put("data", data, DATA_KEY);
}

export const AUTH_STORAGE_KEY = "timeline-auth-token";

const EMBEDDED_HASH = process.env.NEXT_PUBLIC_APP_PASSWORD_HASH;
const LEGACY_PLAINTEXT = process.env.NEXT_PUBLIC_APP_PASSWORD;

/** SHA-256 of a string as lowercase hex (browser secure context required). */
export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * The token a successful unlock must produce. Prefers an embedded SHA-256 hash
 * (NEXT_PUBLIC_APP_PASSWORD_HASH); falls back to a legacy plaintext password.
 * Returns null when no password is configured (app is open).
 */
function expectedToken(): string | null {
  if (EMBEDDED_HASH) return EMBEDDED_HASH.trim().toLowerCase();
  if (LEGACY_PLAINTEXT) return `plain:${LEGACY_PLAINTEXT}`;
  return null;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const expected = expectedToken();
  if (!expected) return true;
  return localStorage.getItem(AUTH_STORAGE_KEY) === expected;
}

export async function authenticate(input: string): Promise<boolean> {
  const expected = expectedToken();
  if (!expected) return true;

  const token = EMBEDDED_HASH
    ? (await sha256Hex(input)).toLowerCase()
    : `plain:${input}`;

  if (token === expected) {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
