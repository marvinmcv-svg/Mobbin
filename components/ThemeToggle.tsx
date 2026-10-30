"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
const ORDER: Theme[] = ["system", "light", "dark"];
const LABEL: Record<Theme, string> = { system: "Auto", light: "Light", dark: "Dark" };

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    try {
      const t = localStorage.getItem("theme");
      if (t === "light" || t === "dark") setTheme(t);
    } catch {}
  }, []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]!;
    setTheme(next);
    const root = document.documentElement;
    try {
      if (next === "system") {
        delete root.dataset.theme;
        localStorage.removeItem("theme");
      } else {
        root.dataset.theme = next;
        localStorage.setItem("theme", next);
      }
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className="shrink-0 rounded-tile border border-rule px-2 py-1 font-mono text-xs text-ink-soft transition-colors duration-150 hover:text-ink"
      aria-label={`Theme: ${LABEL[theme]}. Click to change.`}
    >
      ◐ {LABEL[theme]}
    </button>
  );
}
