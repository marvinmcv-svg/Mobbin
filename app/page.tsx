import Link from "next/link";
import { LIBRARY_NAME } from "@/lib/config";
import { db } from "@/lib/db";
import { getFacets, listScreens } from "@/lib/data/screens";
import { PLATFORM_LABELS, PLATFORMS } from "@/lib/data/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const pool = db();
  const [latest, facets, counts] = await Promise.all([
    listScreens(pool, { platform: "site" }, 0, 16),
    getFacets(pool, "site"),
    Promise.all(
      PLATFORMS.map((p) =>
        listScreens(pool, { platform: p }, 0, 1).then((r) => [p, r.total] as const),
      ),
    ),
  ]);
  const half = Math.ceil(latest.items.length / 2);
  const rows = [latest.items.slice(0, half), latest.items.slice(half)];

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-4 pt-16 pb-12 sm:px-8 sm:pt-24">
        <p className="font-mono text-xs tracking-wide text-ink-faint uppercase">
          A field guide to shipped interfaces
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl">
          Look at how it was <em className="text-accent">actually</em> built before you build it.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-soft">
          {LIBRARY_NAME} is a hand-captured catalogue of website sections, app screens and complete
          flows — tagged by pattern, style and element, and searchable in plain words.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/browse?platform=site"
            className="rounded-tile bg-ink px-5 py-3 font-medium text-paper transition-colors duration-150 hover:bg-accent"
          >
            Browse the latest sites
          </Link>
          <Link
            href="/browse?platform=ios"
            className="rounded-tile border border-rule px-5 py-3 font-medium transition-colors duration-150 hover:bg-paper-sunken"
          >
            Mobile screens
          </Link>
        </div>
        <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-rule pt-6 font-mono text-xs">
          {counts.map(([p, n]) => (
            <div key={p}>
              <dt className="text-ink-faint">{PLATFORM_LABELS[p]}</dt>
              <dd className="mt-1 text-2xl text-ink">{n}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="Recently added" className="space-y-4 overflow-hidden py-6">
        {rows.map((row, r) => (
          <div key={r} className="marquee">
            <ul
              className="marquee-track flex w-max gap-4"
              style={{ animationDirection: r ? "reverse" : "normal" }}
            >
              {[...row, ...row].map((s, i) => (
                <li
                  key={`${s.id}-${i}`}
                  aria-hidden={i >= row.length}
                  className="w-[340px] shrink-0 sm:w-[420px]"
                >
                  <Link
                    href={`/screen/${s.id}`}
                    tabIndex={i >= row.length ? -1 : 0}
                    className="block aspect-[16/10] overflow-hidden rounded-frame border border-rule"
                    style={{ backgroundColor: s.color ?? undefined }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.imagePath}
                      alt={`${s.app.name} ${s.tags[0]?.name ?? ""}`}
                      loading="lazy"
                      className="w-full"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pt-16 sm:px-8">
        <h2 className="font-display text-3xl">Start from a section</h2>
        <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-frame border border-rule bg-rule sm:grid-cols-3 lg:grid-cols-4">
          {facets.pattern
            .filter((p) => p.count > 0)
            .map((p, i) => (
              <li key={p.slug}>
                <Link
                  href={`/browse?platform=site&pattern=${p.slug}`}
                  className="flex h-full items-baseline justify-between gap-2 bg-paper-raised p-4 transition-colors duration-150 hover:bg-paper-sunken"
                >
                  <span>
                    <span className="mr-2 font-mono text-[11px] text-ink-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {p.name}
                  </span>
                  <span className="font-mono text-xs text-ink-faint">{p.count}</span>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
