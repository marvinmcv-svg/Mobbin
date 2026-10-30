"use client";

import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  effectiveSort,
  filtersToQuery,
  PLATFORM_LABELS,
  PLATFORMS,
  type Facets,
  type Filters,
  type Page,
  type ScreenCard,
} from "@/lib/data/types";
import { ScreenGrid } from "./ScreenGrid";

type FacetKey = "pattern" | "style" | "category" | "element";

export function BrowseShell({
  filters,
  facets,
  initial,
}: {
  filters: Filters;
  facets: Facets;
  initial: Page<ScreenCard>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(filters.q ?? "");
  const input = useRef<HTMLInputElement>(null);
  const isSite = filters.platform === "site";

  function navigate(next: Partial<Filters>) {
    const merged = { ...filters, ...next };
    startTransition(() =>
      router.replace(`${pathname}?${filtersToQuery(merged)}`, { scroll: false }),
    );
  }

  // Debounced search; the transition makes stale requests irrelevant.
  useEffect(() => {
    if ((filters.q ?? "") === q.trim()) return;
    const t = setTimeout(() => navigate({ q: q.trim() || undefined }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to typing
  }, [q]);

  useEffect(() => setQ(filters.q ?? ""), [filters.q]);

  // "/" focuses search from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const facetDefs: { key: FacetKey; label: string; options: Facets[FacetKey] }[] = [
    {
      key: "pattern",
      label: isSite ? "Section" : "Pattern",
      options: facets.pattern.filter((o) => o.count > 0 || o.slug === filters.pattern),
    },
    { key: "style", label: "Style", options: facets.style },
    { key: "category", label: "Category", options: facets.category },
    ...(!isSite ? [{ key: "element" as const, label: "UI element", options: facets.element }] : []),
  ];
  const active = facetDefs.flatMap((d) => {
    const slug = filters[d.key];
    const opt = slug && d.options.find((o) => o.slug === slug);
    return slug ? [{ key: d.key, label: d.label, name: opt ? opt.name : slug }] : [];
  });
  const sort = effectiveSort(filters);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 pt-10 pb-6">
        <div>
          <p className="font-mono text-xs tracking-wide text-ink-faint uppercase">
            Catalogue · {PLATFORM_LABELS[filters.platform]}
          </p>
          <h1 className="mt-1 font-display text-4xl tracking-tight sm:text-5xl">
            {sort === "popular"
              ? "Most saved"
              : sort === "relevance"
                ? `“${filters.q}”`
                : "Latest additions"}
          </h1>
        </div>
        <p className="font-mono text-xs text-ink-soft" aria-live="polite">
          {initial.total} {initial.total === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="sticky top-14 z-30 -mx-4 border-y border-rule bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Platform"
            className="flex rounded-tile border border-rule bg-paper-sunken p-0.5"
          >
            {PLATFORMS.map((p) => (
              <button
                key={p}
                role="tab"
                aria-selected={filters.platform === p}
                onClick={() =>
                  navigate({
                    platform: p,
                    pattern: undefined,
                    element: undefined,
                    style: undefined,
                    category: undefined,
                    app: undefined,
                  })
                }
                className={clsx(
                  "rounded-[4px] px-3 py-1 text-sm transition-colors duration-150",
                  filters.platform === p
                    ? "bg-paper-raised text-ink shadow-sm"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>

          <label className="relative min-w-[200px] flex-1">
            <span className="sr-only">Search</span>
            <input
              ref={input}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search apps, sections, styles…"
              className="w-full rounded-tile border border-rule bg-paper-raised px-3 py-1.5 pr-8 text-sm placeholder:text-ink-faint focus:border-ink/40 focus:outline-none"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-rule px-1 font-mono text-[10px] text-ink-faint">
              /
            </kbd>
          </label>

          {facetDefs.map((d) => (
            <label key={d.key} className="relative">
              <span className="sr-only">{d.label}</span>
              <select
                value={filters[d.key] ?? ""}
                onChange={(e) => navigate({ [d.key]: e.target.value || undefined })}
                className={clsx(
                  "appearance-none rounded-tile border bg-paper-raised py-1.5 pr-7 pl-3 text-sm focus:outline-none",
                  filters[d.key] ? "border-ink/50 text-ink" : "border-rule text-ink-soft",
                )}
              >
                <option value="">{d.label}: any</option>
                {d.options.map((o) => (
                  <option key={o.slug} value={o.slug}>
                    {o.name} ({o.count})
                  </option>
                ))}
              </select>
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-ink-faint"
              >
                ▾
              </span>
            </label>
          ))}

          <label className="relative ml-auto">
            <span className="sr-only">Sort</span>
            <select
              value={sort}
              onChange={(e) => navigate({ sort: e.target.value as Filters["sort"] })}
              className="appearance-none rounded-tile border border-rule bg-paper-raised py-1.5 pr-7 pl-3 text-sm focus:outline-none"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most saved</option>
              {filters.q && <option value="relevance">Best match</option>}
            </select>
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-ink-faint"
            >
              ▾
            </span>
          </label>
        </div>

        {(active.length > 0 || filters.app) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {active.map((a) => (
              <button
                key={a.key}
                onClick={() => navigate({ [a.key]: undefined })}
                className="rounded-[4px] bg-ink px-2 py-0.5 font-mono text-[11px] text-paper hover:bg-accent"
                aria-label={`Remove ${a.label} ${a.name}`}
              >
                {a.label}: {a.name} ×
              </button>
            ))}
            {filters.app && (
              <button
                onClick={() => navigate({ app: undefined })}
                className="rounded-[4px] bg-ink px-2 py-0.5 font-mono text-[11px] text-paper hover:bg-accent"
              >
                App: {filters.app} ×
              </button>
            )}
            <button
              onClick={() =>
                navigate({
                  pattern: undefined,
                  style: undefined,
                  category: undefined,
                  element: undefined,
                  app: undefined,
                })
              }
              className="px-1 font-mono text-[11px] text-ink-soft underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div
        className={clsx("pt-8 transition-opacity duration-150", pending && "opacity-50")}
        aria-busy={pending}
      >
        <ScreenGrid filters={filters} initial={initial} />
      </div>
    </div>
  );
}
