"use client";

import clsx from "clsx";
import { copyImage } from "@/lib/clipboard";
import { useSaved } from "@/lib/saved";
import { toast } from "./Toaster";

export function SaveButton({
  id,
  className,
  size = "sm",
}: {
  id: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const { has, toggle } = useSaved();
  const saved = has(id);
  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        toast(toggle(id) ? "Saved to your shelf" : "Removed from your shelf");
      }}
      className={clsx(
        "rounded-tile font-medium transition-colors duration-150",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        saved ? "bg-accent text-accent-ink" : "bg-paper-raised text-ink hover:bg-paper-sunken",
        className,
      )}
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}

export function CopyButton({
  src,
  className,
  size = "sm",
}: {
  src: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        try {
          await copyImage(src);
          toast("Image copied");
        } catch {
          toast("Copy isn’t available in this browser");
        }
      }}
      className={clsx(
        "rounded-tile bg-paper-raised font-medium text-ink transition-colors duration-150 hover:bg-paper-sunken",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        className,
      )}
    >
      Copy
    </button>
  );
}
