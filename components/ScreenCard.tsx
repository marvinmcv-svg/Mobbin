"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { filtersToQuery, type Filters, type ScreenCard as Card, type Tag } from "@/lib/data/types";
import { ClipPlayer } from "./ClipPlayer";
import { CopyButton, SaveButton } from "./ItemActions";

const TAG_PARAM: Record<Tag["kind"], string> = {
  pattern: "pattern",
  style: "style",
  element: "element",
  category: "category",
};

export function catalogueNo(n: number) {
  return `No. ${String(n + 1).padStart(3, "0")}`;
}

/** `tagContext` is the filter set tag links refine (serialisable, so server pages can pass it). */
export function ScreenCard({
  item,
  index,
  href,
  tagContext,
}: {
  item: Card;
  index: number;
  href: string;
  tagContext?: Partial<Filters>;
}) {
  const [loaded, setLoaded] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  // Images can finish loading before hydration attaches onLoad.
  useEffect(() => {
    if (img.current?.complete) setLoaded(true);
  }, []);
  const tagHref = (param: string, slug: string) =>
    `/browse?${filtersToQuery({ platform: item.app.platform, ...tagContext, [param]: slug })}`;
  const phone = item.app.platform === "ios" || item.app.platform === "android";
  // Tall sections are cropped from the top so rows stay scannable.
  const ratio = phone ? item.height / item.width : Math.min(item.height / item.width, 0.72);
  const tags = item.tags.filter((t) => t.kind !== "element");

  return (
    <article className="group/card flex min-w-0 flex-col gap-3">
      <div className="relative">
        <Link
          href={href}
          data-card
          className={clsx(
            "relative block overflow-hidden border border-rule bg-paper-sunken transition-shadow duration-200 ease-out-soft hover:shadow-lift",
            phone ? "rounded-[22px]" : "rounded-frame",
          )}
          style={{ aspectRatio: `1 / ${ratio}`, backgroundColor: item.color ?? undefined }}
        >
          {item.video ? (
            <ClipPlayer
              src={item.video}
              poster={item.imagePath}
              className="absolute inset-x-0 top-0 h-auto w-full"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- static captures; responsive variants arrive with the ingestion pipeline
            <img
              ref={img}
              src={item.imagePath}
              alt={`${item.app.name} — ${tags
                .map((t) => t.name)
                .slice(0, 2)
                .join(", ")}`}
              width={item.width}
              height={item.height}
              loading={index < 4 ? "eager" : "lazy"}
              decoding="async"
              onLoad={() => setLoaded(true)}
              className={clsx(
                "absolute inset-x-0 top-0 h-auto w-full transition-opacity duration-300 ease-out-soft",
                loaded ? "opacity-100" : "opacity-0",
              )}
            />
          )}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-200 group-hover/card:opacity-100 group-focus-within/card:opacity-100" />
        </Link>
        <span className="pointer-events-none absolute top-2 left-2 rounded-[4px] bg-paper/85 px-1.5 py-0.5 font-mono text-[10px] text-ink-soft opacity-0 backdrop-blur transition-opacity duration-200 group-hover/card:opacity-100">
          {catalogueNo(index)}
        </span>
        {item.video && (
          <span className="pointer-events-none absolute top-2 right-2 rounded-[4px] bg-ink/80 px-1.5 py-0.5 font-mono text-[10px] text-paper">
            ▶ Motion
          </span>
        )}
        <div className="absolute right-3 bottom-3 flex gap-2 opacity-0 transition-all duration-200 ease-out-soft group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:opacity-100 sm:translate-y-1">
          <SaveButton id={item.id} />
          <CopyButton src={item.imagePath} />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link
          href={`/apps/${item.app.slug}`}
          className="flex min-w-0 shrink-0 items-center gap-2 text-sm font-medium hover:underline"
        >
          {item.app.iconPath && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.app.iconPath}
              alt=""
              width={22}
              height={22}
              className="size-[22px] shrink-0 rounded-[5px]"
            />
          )}
          <span className="truncate">{item.app.name}</span>
        </Link>
        <ul
          className="no-scrollbar flex min-w-0 sm:ml-auto gap-1 overflow-x-auto [mask-image:linear-gradient(to_right,black_85%,transparent)]"
          aria-label="Tags"
        >
          {tags.map((t) => (
            <li key={t.kind + t.slug} className="shrink-0">
              <Link
                href={tagHref(TAG_PARAM[t.kind], t.slug)}
                className={clsx(
                  "block rounded-[4px] border px-1.5 py-0.5 font-mono text-[11px] transition-colors duration-150",
                  t.kind === "pattern"
                    ? "border-ink/20 text-ink"
                    : "border-rule text-ink-soft hover:text-ink",
                )}
              >
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function ScreenCardSkeleton({ phone }: { phone?: boolean }) {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <div
        className={clsx(
          "animate-pulse border border-rule bg-paper-sunken",
          phone ? "aspect-[390/844] rounded-[22px]" : "aspect-[10/7] rounded-frame",
        )}
      />
      <div className="h-5 w-1/3 animate-pulse rounded bg-paper-sunken" />
    </div>
  );
}
