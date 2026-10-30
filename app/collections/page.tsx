import type { Metadata } from "next";
import { SavedShelf } from "@/components/SavedShelf";

export const metadata: Metadata = { title: "Saved" };

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
      <h1 className="pt-12 font-display text-5xl tracking-tight">Your shelf</h1>
      <p className="mt-2 text-ink-soft">
        Everything you’ve saved, newest first. Stored in this browser until accounts arrive.
      </p>
      <SavedShelf />
    </div>
  );
}
