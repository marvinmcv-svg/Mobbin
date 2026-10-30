"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ScreenCard as Card } from "@/lib/data/types";
import { useSaved } from "@/lib/saved";
import { ScreenCard } from "./ScreenCard";

export function SavedShelf() {
  const { ids } = useSaved();
  const [items, setItems] = useState<Card[] | null>(null);

  useEffect(() => {
    if (!ids.length) return setItems([]);
    const ctrl = new AbortController();
    fetch("/api/screens/by-ids", {
      method: "POST",
      body: JSON.stringify({ ids }),
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((d: { items: Card[] }) => setItems(d.items))
      .catch(() => {});
    return () => ctrl.abort();
  }, [ids]);

  if (items === null) return <p className="py-16 font-mono text-xs text-ink-faint">Loading…</p>;
  if (!items.length)
    return (
      <div className="py-24 text-center">
        <p className="font-display text-3xl">Nothing saved yet.</p>
        <p className="mt-3 text-ink-soft">
          Hover any item and press <strong>Save</strong>, or press{" "}
          <kbd className="rounded border border-rule px-1 font-mono">S</kbd> in the viewer.
        </p>
        <Link
          href="/browse"
          className="mt-6 inline-block rounded-tile bg-ink px-4 py-2 text-paper hover:bg-accent"
        >
          Browse the catalogue
        </Link>
      </div>
    );
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 pt-10 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((s, i) => (
        <ScreenCard key={s.id} item={s} index={i} href={`/screen/${s.id}`} />
      ))}
    </div>
  );
}
