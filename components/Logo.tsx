/** Wordmark: a specimen pin (circle on a stem) followed by the name. */
export function Logo({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <rect
          x="1"
          y="1"
          width="20"
          height="20"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="11" cy="9" r="4" fill="var(--accent)" />
        <path d="M11 13v6" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight">{name}</span>
    </span>
  );
}
