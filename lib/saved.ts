"use client";

import { useCallback, useSyncExternalStore } from "react";

/*
 * Saved items live in localStorage until accounts land in Phase F; the
 * collections tables are already in the schema for the server-side version.
 */
const KEY = "saved-screens";
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(ids: string[]) {
  cache = ids;
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {}
  listeners.forEach((l) => l());
}

const EMPTY: string[] = [];
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useSaved() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = useCallback((id: string) => {
    const cur = read();
    const on = !cur.includes(id);
    write(on ? [id, ...cur] : cur.filter((x) => x !== id));
    return on;
  }, []);
  return { ids, has: (id: string) => ids.includes(id), toggle };
}
