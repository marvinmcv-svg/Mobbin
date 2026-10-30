"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-32 text-center">
      <h1 className="font-display text-4xl">Something slipped.</h1>
      <p className="mt-3 text-ink-soft">We couldn’t load this page. It’s usually temporary.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-tile bg-ink px-4 py-2 text-paper hover:bg-accent"
      >
        Try again
      </button>
    </div>
  );
}
