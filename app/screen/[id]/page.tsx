import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Viewer } from "@/components/Viewer";
import { ScreenCard } from "@/components/ScreenCard";
import { GRID_CLASSES } from "@/components/gridClasses";
import { db } from "@/lib/db";
import { getNeighbors, getRelated, getScreen } from "@/lib/data/screens";
import { filtersToQuery, parseFilters, PLATFORM_LABELS } from "@/lib/data/types";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getScreen(db(), (await params).id);
  return { title: s ? `${s.app.name} · ${s.tags[0]?.name ?? "Screen"}` : "Not found" };
}

export default async function ScreenPage({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const screen = await getScreen(db(), id);
  if (!screen) notFound();

  // Navigation context: the result set the user came from (or the app's own platform feed).
  const filters = parseFilters({ ...sp, platform: (sp.platform as string) ?? screen.app.platform });
  const index = Number.isInteger(Number(sp.i)) ? Number(sp.i) : null;
  const [neighbors, related] = await Promise.all([
    index !== null ? getNeighbors(db(), filters, index) : null,
    getRelated(db(), screen.id, 6),
  ]);
  const hrefAt = (target: { id: string } | null, i: number) =>
    target ? `/screen/${target.id}?${filtersToQuery(filters, { i })}` : null;
  const backHref = `/browse?${filtersToQuery(filters)}`;

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 pt-6 font-mono text-xs text-ink-soft"
      >
        <Link href={backHref} className="hover:text-ink">
          ← {PLATFORM_LABELS[screen.app.platform]}
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/apps/${screen.app.slug}`} className="hover:text-ink">
          {screen.app.name}
        </Link>
        {neighbors && (
          <span className="ml-auto">
            {index! + 1} of {neighbors.total}
          </span>
        )}
      </nav>

      <Viewer
        screen={screen}
        prevHref={neighbors ? hrefAt(neighbors.prev, index! - 1) : null}
        nextHref={neighbors ? hrefAt(neighbors.next, index! + 1) : null}
        nextImage={neighbors?.next?.imagePath ?? null}
        backHref={backHref}
      />

      {related.length > 0 && (
        <section className="mt-20" aria-labelledby="related-h">
          <h2 id="related-h" className="mb-6 font-display text-2xl">
            Shares a shelf with
          </h2>
          <div className={`grid ${GRID_CLASSES[screen.app.platform]}`}>
            {related.map((r, i) => (
              <ScreenCard key={r.id} item={r} index={i} href={`/screen/${r.id}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
