"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ScreenDetail } from "@/lib/data/types";
import { ClipPlayer } from "./ClipPlayer";
import { CopyButton, SaveButton } from "./ItemActions";
import { useSaved } from "@/lib/saved";
import { toast } from "./Toaster";

interface Props {
  screen: ScreenDetail;
  prevHref: string | null;
  nextHref: string | null;
  nextImage: string | null;
  backHref: string;
}

export function Viewer({ screen, prevHref, nextHref, nextImage, backHref }: Props) {
  const router = useRouter();
  const { toggle } = useSaved();
  const [full, setFull] = useState(false);
  const [still, setStill] = useState(!screen.video);
  const tabs = [
    ...(screen.video ? [{ label: "Clip", selected: !still, select: () => setStill(false) }] : []),
    {
      label: "Section",
      selected: still && !full,
      select: () => {
        setStill(true);
        setFull(false);
      },
    },
    ...(screen.fullImagePath
      ? [
          {
            label: "Full page",
            selected: still && full,
            select: () => {
              setStill(true);
              setFull(true);
            },
          },
        ]
      : []),
  ];
  const [zoom, setZoom] = useState(false);
  const src = full && screen.fullImagePath ? screen.fullImagePath : screen.imagePath;
  const phone = screen.app.platform === "ios" || screen.app.platform === "android";

  // Warm the cache for the next item so stepping feels instant.
  useEffect(() => {
    if (nextHref) router.prefetch(nextHref);
    if (nextImage) new Image().src = nextImage;
  }, [nextHref, nextImage, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        (e.target as HTMLElement).closest("input,textarea,select")
      )
        return;
      if (e.key === "ArrowLeft" && prevHref) router.push(prevHref, { scroll: false });
      else if (e.key === "ArrowRight" && nextHref) router.push(nextHref, { scroll: false });
      else if (e.key === "Escape") {
        if (zoom) setZoom(false);
        else router.push(backHref);
      } else if (e.key === "f" && screen.fullImagePath) {
        setStill(true);
        setFull((v) => !v);
      } else if (e.key === "z") setZoom((v) => !v);
      else if (e.key === "s")
        toast(toggle(screen.id) ? "Saved to your shelf" : "Removed from your shelf");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevHref, nextHref, backHref, router, zoom, screen.fullImagePath, screen.id, toggle]);

  const tagGroups = (["pattern", "style", "category", "element"] as const)
    .map((k) => ({ k, tags: screen.tags.filter((t) => t.kind === k) }))
    .filter((g) => g.tags.length);
  const LABEL = {
    pattern: screen.kind === "section" ? "Section" : "Pattern",
    style: "Style",
    category: "Category",
    element: "Elements",
  };

  return (
    <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 rounded-frame border border-rule bg-paper-raised">
        <div className="flex flex-wrap items-center gap-3 border-b border-rule px-4 py-3">
          <Link href={`/apps/${screen.app.slug}`} className="flex items-center gap-2 font-medium">
            {screen.app.iconPath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={screen.app.iconPath}
                alt=""
                width={28}
                height={28}
                className="size-7 rounded-[6px]"
              />
            )}
            {screen.app.name}
            <span className="text-ink-soft">
              · {screen.tags.find((t) => t.kind === "pattern")?.name}
            </span>
          </Link>
          {tabs.length > 1 && (
            <div
              role="tablist"
              aria-label="Capture"
              className="ml-auto flex rounded-tile border border-rule bg-paper-sunken p-0.5 text-sm"
            >
              {tabs.map((t) => (
                <button
                  key={t.label}
                  role="tab"
                  aria-selected={t.selected}
                  onClick={t.select}
                  className={clsx(
                    "rounded-[4px] px-3 py-0.5",
                    t.selected ? "bg-paper-raised shadow-sm" : "text-ink-soft",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
          <div className={clsx("flex gap-2", tabs.length < 2 && "ml-auto")}>
            <SaveButton id={screen.id} size="md" className="border border-rule" />
            <CopyButton src={src} size="md" className="border border-rule" />
          </div>
        </div>

        <div className="relative">
          {!still && screen.video ? (
            <div className="p-4 sm:p-8">
              <ClipPlayer
                src={screen.video}
                poster={screen.imagePath}
                controls
                className="mx-auto max-h-[78vh] w-auto max-w-full rounded-tile border border-rule shadow-lift"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setZoom((z) => !z)}
              aria-label={zoom ? "Zoom out" : "Zoom in"}
              className={clsx(
                "block w-full p-4 sm:p-8",
                zoom ? "cursor-zoom-out" : "cursor-zoom-in",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={src}
                  src={src}
                  alt={screen.description ?? `${screen.app.name} capture`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className={clsx(
                    "mx-auto h-auto border border-rule shadow-lift",
                    phone ? "rounded-[28px]" : "rounded-tile",
                    zoom
                      ? "w-full max-w-none"
                      : phone
                        ? "max-h-[78vh] w-auto"
                        : "max-h-[78vh] w-auto max-w-full object-contain",
                  )}
                />
              </AnimatePresence>
            </button>
          )}
          {prevHref && (
            <Link
              href={prevHref}
              scroll={false}
              aria-label="Previous"
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full border border-rule bg-paper-raised/90 px-3 py-2 text-lg shadow-sm hover:bg-paper-sunken"
            >
              ←
            </Link>
          )}
          {nextHref && (
            <Link
              href={nextHref}
              scroll={false}
              aria-label="Next"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full border border-rule bg-paper-raised/90 px-3 py-2 text-lg shadow-sm hover:bg-paper-sunken"
            >
              →
            </Link>
          )}
        </div>
      </div>

      <aside className="space-y-6 text-sm">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 font-mono text-xs">
          <dt className="text-ink-faint">App</dt>
          <dd>{screen.app.name}</dd>
          <dt className="text-ink-faint">Platform</dt>
          <dd>{screen.app.platform}</dd>
          {screen.appVersion && (
            <>
              <dt className="text-ink-faint">Version</dt>
              <dd>{screen.appVersion}</dd>
            </>
          )}
          <dt className="text-ink-faint">Captured</dt>
          <dd>{screen.capturedAt ?? "—"}</dd>
          <dt className="text-ink-faint">Size</dt>
          <dd>
            {screen.width}×{screen.height}
          </dd>
        </dl>

        {screen.flow && (
          <Link
            href={`/flow/${screen.flow.id}?step=${screen.flow.position}`}
            className="block rounded-tile border border-rule p-3 hover:bg-paper-sunken"
          >
            <span className="font-mono text-xs text-ink-faint">
              Part of a flow · step {screen.flow.position}
            </span>
            <span className="mt-1 block font-medium">{screen.flow.name} →</span>
          </Link>
        )}

        {tagGroups.map((g) => (
          <div key={g.k}>
            <h3 className="mb-1.5 font-mono text-xs text-ink-faint">{LABEL[g.k]}</h3>
            <ul className="flex flex-wrap gap-1">
              {g.tags.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/browse?platform=${screen.app.platform}&${g.k}=${t.slug}`}
                    className="block rounded-[4px] border border-rule px-1.5 py-0.5 font-mono text-[11px] hover:border-ink/40"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {screen.description && (
          <p className="leading-relaxed text-ink-soft">{screen.description}</p>
        )}

        <p className="font-mono text-[11px] leading-relaxed text-ink-faint">
          Keys: ← → step · F full page · Z zoom · S save · Esc back
        </p>
        <Link
          href={`/report/${screen.id}`}
          className="inline-block font-mono text-xs text-ink-soft underline hover:text-accent"
        >
          Report or request removal
        </Link>
      </aside>
    </div>
  );
}
