"use client";

import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { filtersToQuery, type Filters, type Page, type ScreenCard as Card } from "@/lib/data/types";
import { GRID_CLASSES } from "./gridClasses";
import { ScreenCard, ScreenCardSkeleton } from "./ScreenCard";

export function ScreenGrid({ filters, initial }: { filters: Filters; initial: Page<Card> }) {
  const [items, setItems] = useState(initial.items);
  const [nextOffset, setNextOffset] = useState(initial.nextOffset);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const query = filtersToQuery(filters);

  // New filters arrive with a fresh server-rendered first page.
  useEffect(() => {
    abort.current?.abort();
    setItems(initial.items);
    setNextOffset(initial.nextOffset);
    setError(false);
  }, [initial]);

  const loadMore = useCallback(async () => {
    if (nextOffset === null || loading) return;
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/screens?${query}&offset=${nextOffset}`, {
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(String(res.status));
      const page = (await res.json()) as Page<Card>;
      setItems((xs) => [...xs, ...page.items]);
      setNextOffset(page.nextOffset);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(true);
    } finally {
      if (abort.current === ctrl) setLoading(false);
    }
  }, [nextOffset, loading, query]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || nextOffset === null || error) return;
    const io = new IntersectionObserver((entries) => entries[0]?.isIntersecting && loadMore(), {
      rootMargin: "1200px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, nextOffset, error]);

  // Arrow keys move focus between cards, row-aware.
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLAnchorElement>("a[data-card]"));
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (i < 0) return;
    const top = links[0]!.getBoundingClientRect().top;
    const cols = Math.max(
      1,
      links.filter((l) => Math.abs(l.getBoundingClientRect().top - top) < 4).length,
    );
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[
      e.key as "ArrowLeft"
    ];
    const target = links[i + delta];
    if (target) {
      e.preventDefault();
      target.focus();
      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  const phone = filters.platform === "ios" || filters.platform === "android";

  if (!items.length) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="font-display text-3xl">Nothing on this shelf.</p>
        <p className="mt-3 text-ink-soft">
          No captures match every filter you picked. Try removing one, or search for a broader word.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        role="list"
        aria-label="Results"
        onKeyDown={onKeyDown}
        className={clsx("grid", GRID_CLASSES[filters.platform])}
      >
        {items.map((item, i) => (
          <div role="listitem" key={item.id}>
            <ScreenCard
              item={item}
              index={i}
              href={`/screen/${item.id}?${filtersToQuery(filters, { i })}`}
              tagContext={{ ...filters, app: undefined }}
            />
          </div>
        ))}
        {loading &&
          Array.from({ length: phone ? 5 : 2 }, (_, i) => (
            <ScreenCardSkeleton key={`s${i}`} phone={phone} />
          ))}
      </div>
      <div ref={sentinel} className="flex justify-center py-10">
        {error ? (
          <button
            type="button"
            onClick={loadMore}
            className="rounded-tile border border-rule px-4 py-2 text-sm hover:bg-paper-sunken"
          >
            Couldn’t load more — try again
          </button>
        ) : nextOffset !== null ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-tile border border-rule px-4 py-2 text-sm hover:bg-paper-sunken disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        ) : (
          <p className="font-mono text-xs text-ink-faint">
            End of the shelf · {items.length} items
          </p>
        )}
      </div>
    </>
  );
}
