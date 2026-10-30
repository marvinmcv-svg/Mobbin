import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-32 text-center">
      <p className="font-mono text-xs text-ink-faint">404</p>
      <h1 className="mt-2 font-display text-4xl">This specimen isn’t in the drawer.</h1>
      <p className="mt-3 text-ink-soft">
        It may have been removed at the owner’s request, or the link is mistyped.
      </p>
      <Link
        href="/browse"
        className="mt-6 inline-block rounded-tile bg-ink px-4 py-2 text-paper hover:bg-accent"
      >
        Back to the catalogue
      </Link>
    </div>
  );
}
