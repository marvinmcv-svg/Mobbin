"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { FlowDetail } from "@/lib/data/screens";

export function FlowPlayer({
  steps,
  start,
  phone,
}: {
  steps: FlowDetail["steps"];
  start: number;
  phone: boolean;
}) {
  const [i, setI] = useState(start);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const step = steps[i]!;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setI((x) => (x + 1) % steps.length), 2500);
    return () => clearTimeout(t);
  }, [playing, i, steps.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((x) => Math.min(steps.length - 1, x + 1));
      else if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (/^[1-9]$/.test(e.key) && Number(e.key) <= steps.length) setI(Number(e.key) - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps.length]);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="rounded-tile border border-rule px-3 py-1.5 text-sm hover:bg-paper-sunken"
          aria-pressed={playing}
        >
          {playing ? "❚❚ Pause" : "▶ Autoplay"}
        </button>
        <span className="font-mono text-xs text-ink-soft" aria-live="polite">
          Step {i + 1} of {steps.length}
          {step.caption && ` — ${step.caption}`}
        </span>
        <Link href={`/screen/${step.id}`} className="ml-auto font-mono text-xs underline">
          Open this screen
        </Link>
      </div>

      <div className="mt-6 flex min-h-[60vh] items-center justify-center rounded-frame border border-rule bg-paper-sunken p-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={step.id}
            src={step.imagePath}
            alt={step.caption ?? `Step ${i + 1}`}
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={clsx(
              "h-auto max-h-[70vh] w-auto border border-rule shadow-lift",
              phone ? "rounded-[28px]" : "rounded-tile",
            )}
          />
        </AnimatePresence>
      </div>

      <ol className="no-scrollbar mt-6 flex gap-3 overflow-x-auto pb-2" aria-label="Steps">
        {steps.map((s, n) => (
          <li key={s.id} className="shrink-0">
            <button
              type="button"
              onClick={() => setI(n)}
              aria-current={n === i ? "step" : undefined}
              className={clsx(
                "block w-24 rounded-tile border-2 p-1 text-left transition-colors duration-150",
                n === i ? "border-accent" : "border-transparent hover:border-rule",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.imagePath}
                alt=""
                className={clsx("w-full", phone ? "rounded-[10px]" : "rounded-[3px]")}
              />
              <span className="mt-1 block truncate font-mono text-[10px] text-ink-soft">
                {n + 1}. {s.caption}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
