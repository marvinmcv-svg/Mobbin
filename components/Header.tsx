import Link from "next/link";
import { LIBRARY_NAME } from "@/lib/config";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/browse?platform=site", label: "Sites" },
  { href: "/browse?platform=web", label: "Web apps" },
  { href: "/browse?platform=ios", label: "Mobile" },
  { href: "/collections", label: "Saved" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 sm:px-8">
        <Link href="/" aria-label={`${LIBRARY_NAME} home`}>
          <Logo name={LIBRARY_NAME} />
        </Link>
        <nav
          aria-label="Primary"
          className="no-scrollbar -mx-2 flex flex-1 items-center gap-1 overflow-x-auto"
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="shrink-0 rounded-tile px-2 py-1 text-sm text-ink-soft transition-colors duration-150 hover:bg-paper-sunken hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
