import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenGrid } from "@/components/ScreenGrid";
import { repo } from "@/lib/repo";
import { PLATFORM_LABELS, type Filters } from "@/lib/data/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const app = await repo.getApp((await params).slug);
  return { title: app?.name ?? "Not found" };
}

export default async function AppPage({ params }: Props) {
  const app = await repo.getApp((await params).slug);
  if (!app) notFound();
  const filters: Filters = { platform: app.platform, app: app.slug, sort: "latest" };
  const page = await repo.listScreens(filters, 0, 60);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
      <header className="flex flex-wrap items-center gap-5 border-b border-rule pt-12 pb-8">
        {app.iconPath && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={app.iconPath}
            alt=""
            width={72}
            height={72}
            className="size-18 rounded-[16px]"
          />
        )}
        <div>
          <h1 className="font-display text-5xl tracking-tight">{app.name}</h1>
          <p className="mt-2 font-mono text-xs text-ink-soft">
            {PLATFORM_LABELS[app.platform]} · {app.category ?? "Uncategorised"}
            {app.version && ` · v${app.version}`} · captured {app.capturedAt ?? "—"}
          </p>
        </div>
      </header>

      {app.flows.length > 0 && (
        <section className="pt-8">
          <h2 className="font-mono text-xs text-ink-faint uppercase">Flows</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {app.flows.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/flow/${f.id}`}
                  className="block rounded-tile border border-rule px-4 py-2 hover:bg-paper-sunken"
                >
                  {f.name}{" "}
                  <span className="font-mono text-xs text-ink-faint">· {f.steps} steps</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="pt-10">
        <ScreenGrid filters={filters} initial={page} />
      </div>
    </div>
  );
}
