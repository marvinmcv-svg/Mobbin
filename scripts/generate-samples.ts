/**
 * Generates original placeholder captures for fictional products so the library has
 * something to browse before real captures are ingested. Every brand, headline and
 * layout here is invented. Output: public/samples/** and db/sample-data.json.
 */
import fs from "node:fs";
import path from "node:path";

type Palette = { bg: string; fg: string; muted: string; accent: string; surface: string };
type SectionType =
  | "hero"
  | "features"
  | "pricing"
  | "stats"
  | "testimonials"
  | "cta"
  | "footer"
  | "how-it-works"
  | "navigation";

interface SiteBrand {
  name: string;
  slug: string;
  category: string;
  styles: string[];
  palette: Palette;
  serif: boolean;
  headline: [string, string];
  sub: string;
  sections: SectionType[];
  daysAgo: number;
}

interface AppBrand {
  name: string;
  slug: string;
  platform: "ios" | "android" | "web";
  category: string;
  palette: Palette;
  screens: { pattern: string; elements: string[]; title: string }[];
  flow?: string;
  daysAgo: number;
}

const OUT = path.join(__dirname, "..", "public", "samples");
const W = 1440;

const sans = "Helvetica, Arial, sans-serif";
const serifFont = "Georgia, 'Times New Roman', serif";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function text(
  x: number,
  y: number,
  s: string,
  size: number,
  fill: string,
  opts: { weight?: number; font?: string; anchor?: string; spacing?: number } = {},
) {
  return `<text x="${x}" y="${y}" font-family="${opts.font ?? sans}" font-size="${size}" font-weight="${opts.weight ?? 400}" fill="${fill}" text-anchor="${opts.anchor ?? "start"}" letter-spacing="${opts.spacing ?? 0}">${esc(s)}</text>`;
}

function rect(x: number, y: number, w: number, h: number, fill: string, r = 0, extra = "") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
}

function lines(x: number, y: number, n: number, w: number, color: string, gap = 18) {
  return Array.from({ length: n }, (_, i) =>
    rect(x, y + i * gap, i === n - 1 ? w * 0.6 : w, 8, color, 4),
  ).join("");
}

function navBar(b: SiteBrand, y = 0) {
  const p = b.palette;
  const links = ["Product", "Pricing", "Stories", "Docs"];
  return [
    rect(0, y, W, 88, p.bg),
    rect(120, y + 30, 28, 28, p.accent, b.styles.includes("minimal") ? 14 : 6),
    text(160, y + 52, b.name, 22, p.fg, { weight: 700, font: b.serif ? serifFont : sans }),
    ...links.map((l, i) => text(560 + i * 110, y + 51, l, 16, p.muted)),
    rect(1160, y + 24, 160, 42, p.fg, 21),
    text(1240, y + 51, "Get started", 15, p.bg, { anchor: "middle", weight: 600 }),
  ].join("");
}

function decoration(b: SiteBrand, x: number, y: number, w: number, h: number) {
  const p = b.palette;
  if (b.styles.includes("3d") || b.styles.includes("glass")) {
    return [
      `<defs><linearGradient id="g-${b.slug}-${y}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.accent}"/><stop offset="1" stop-color="${p.surface}"/></linearGradient></defs>`,
      `<circle cx="${x + w * 0.55}" cy="${y + h * 0.45}" r="${h * 0.34}" fill="url(#g-${b.slug}-${y})"/>`,
      rect(
        x + w * 0.12,
        y + h * 0.55,
        w * 0.6,
        h * 0.3,
        "#ffffff",
        24,
        'fill-opacity="0.18" stroke="#ffffff" stroke-opacity="0.4"',
      ),
      lines(x + w * 0.17, y + h * 0.62, 3, w * 0.4, "#ffffff"),
    ].join("");
  }
  if (b.styles.includes("illustration")) {
    return [
      `<path d="M${x} ${y + h} Q ${x + w * 0.3} ${y + h * 0.35} ${x + w * 0.55} ${y + h * 0.7} T ${x + w} ${y + h * 0.5} V ${y + h} Z" fill="${p.accent}" fill-opacity="0.85"/>`,
      `<circle cx="${x + w * 0.72}" cy="${y + h * 0.28}" r="${h * 0.12}" fill="${p.fg}" fill-opacity="0.9"/>`,
      `<path d="M${x + w * 0.1} ${y + h * 0.9} l 40 -120 l 40 120 Z M${x + w * 0.2} ${y + h * 0.9} l 55 -170 l 55 170 Z" fill="${p.fg}" fill-opacity="0.75"/>`,
    ].join("");
  }
  if (b.styles.includes("photography")) {
    return [
      rect(x, y, w, h, p.surface, 20),
      `<path d="M${x} ${y + h * 0.75} L ${x + w * 0.35} ${y + h * 0.4} L ${x + w * 0.6} ${y + h * 0.65} L ${x + w * 0.8} ${y + h * 0.45} L ${x + w} ${y + h * 0.7} V ${y + h} H ${x} Z" fill="${p.accent}" fill-opacity="0.7"/>`,
      `<circle cx="${x + w * 0.78}" cy="${y + h * 0.22}" r="38" fill="${p.bg}" fill-opacity="0.8"/>`,
    ].join("");
  }
  // Product UI mock
  return [
    rect(x, y, w, h, p.surface, 18, `stroke="${p.muted}" stroke-opacity="0.25"`),
    rect(x, y, w, 44, p.fg, 18, 'fill-opacity="0.06"'),
    ...[0, 1, 2].map(
      (i) =>
        `<circle cx="${x + 24 + i * 18}" cy="${y + 22}" r="5" fill="${p.muted}" fill-opacity="0.5"/>`,
    ),
    rect(x + 24, y + 70, w * 0.22, h - 100, p.fg, 10, 'fill-opacity="0.05"'),
    lines(x + 40, y + 96, 6, w * 0.15, p.muted, 26),
    rect(x + w * 0.28, y + 70, w * 0.66, h * 0.36, p.accent, 12, 'fill-opacity="0.9"'),
    ...[0, 1, 2].map((i) =>
      rect(
        x + w * 0.28 + i * (w * 0.22 + 4),
        y + 90 + h * 0.36,
        w * 0.21,
        h * 0.3,
        p.fg,
        10,
        'fill-opacity="0.06"',
      ),
    ),
  ].join("");
}

function section(b: SiteBrand, type: SectionType): { h: number; body: string } {
  const p = b.palette;
  const display = b.serif ? serifFont : sans;
  const bold = b.styles.includes("bold");
  switch (type) {
    case "hero": {
      const h = 900;
      const centred = b.styles.includes("minimal") || b.styles.includes("bold");
      const body = centred
        ? [
            rect(0, 0, W, h, p.bg),
            navBar(b),
            rect(W / 2 - 110, 170, 220, 34, p.accent, 17, 'fill-opacity="0.15"'),
            text(W / 2, 193, "New · Version 2 is here", 14, p.accent, {
              anchor: "middle",
              weight: 600,
            }),
            text(W / 2, 300, b.headline[0], bold ? 96 : 80, p.fg, {
              anchor: "middle",
              weight: bold ? 800 : 500,
              font: display,
              spacing: -2,
            }),
            text(W / 2, 400, b.headline[1], bold ? 96 : 80, bold ? p.accent : p.fg, {
              anchor: "middle",
              weight: bold ? 800 : 500,
              font: display,
              spacing: -2,
            }),
            text(W / 2, 470, b.sub, 22, p.muted, { anchor: "middle" }),
            rect(W / 2 - 190, 520, 180, 56, p.fg, 28),
            text(W / 2 - 100, 555, "Start free", 17, p.bg, { anchor: "middle", weight: 600 }),
            rect(W / 2 + 10, 520, 180, 56, p.surface, 28),
            text(W / 2 + 100, 555, "Book a demo", 17, p.fg, { anchor: "middle", weight: 600 }),
            decoration(b, 260, 640, 920, 260),
          ]
        : [
            rect(0, 0, W, h, p.bg),
            navBar(b),
            text(120, 300, b.headline[0], 72, p.fg, { weight: 600, font: display, spacing: -1.5 }),
            text(120, 384, b.headline[1], 72, p.accent, {
              weight: 600,
              font: display,
              spacing: -1.5,
            }),
            text(120, 450, b.sub, 20, p.muted),
            rect(120, 500, 170, 54, p.accent, 10),
            text(205, 534, "Try it free", 17, p.bg, { anchor: "middle", weight: 600 }),
            text(320, 534, "See how it works →", 17, p.fg, { weight: 500 }),
            ...[0, 1, 2, 3].map((i) =>
              rect(120 + i * 110, 640, 90, 22, p.muted, 4, 'fill-opacity="0.25"'),
            ),
            decoration(b, 780, 170, 540, 620),
          ];
      return { h, body: body.join("") };
    }
    case "features": {
      const h = 760;
      const names = [
        "Plan together",
        "Ship faster",
        "Stay in sync",
        "Own your data",
        "Automate the dull parts",
        "Measure what matters",
      ];
      return {
        h,
        body: [
          rect(0, 0, W, h, p.bg),
          text(120, 130, "Everything in one place", 48, p.fg, { weight: 600, font: display }),
          text(120, 178, "A short list of the reasons teams switch.", 20, p.muted),
          ...names.map((n, i) => {
            const cx = 120 + (i % 3) * 410;
            const cy = 250 + Math.floor(i / 3) * 240;
            return [
              rect(cx, cy, 380, 210, p.surface, 16),
              rect(
                cx + 28,
                cy + 28,
                44,
                44,
                p.accent,
                b.styles.includes("minimal") ? 22 : 10,
                'fill-opacity="0.9"',
              ),
              text(cx + 28, cy + 112, n, 22, p.fg, { weight: 600 }),
              lines(cx + 28, cy + 136, 3, 300, p.muted + "55"),
            ].join("");
          }),
        ].join(""),
      };
    }
    case "pricing": {
      const h = 820;
      const tiers = [
        ["Starter", "$0", false],
        ["Team", "$24", true],
        ["Scale", "$79", false],
      ] as const;
      return {
        h,
        body: [
          rect(0, 0, W, h, p.bg),
          text(W / 2, 130, "Simple pricing", 52, p.fg, {
            anchor: "middle",
            weight: 600,
            font: display,
          }),
          rect(W / 2 - 120, 160, 240, 44, p.surface, 22),
          rect(W / 2 - 116, 164, 116, 36, p.fg, 18),
          text(W / 2 - 58, 188, "Monthly", 14, p.bg, { anchor: "middle", weight: 600 }),
          text(W / 2 + 58, 188, "Yearly −20%", 14, p.muted, { anchor: "middle" }),
          ...tiers.map(([name, price, hi], i) => {
            const x = 150 + i * 390;
            return [
              rect(
                x,
                250,
                360,
                500,
                hi ? p.fg : p.surface,
                20,
                hi ? "" : `stroke="${p.muted}" stroke-opacity="0.2"`,
              ),
              text(x + 32, 300, name, 20, hi ? p.bg : p.fg, { weight: 600 }),
              text(x + 32, 380, price, 64, hi ? p.bg : p.fg, { weight: 700, font: display }),
              text(x + 32 + price.length * 38, 380, "/mo", 18, hi ? p.bg : p.muted),
              ...[0, 1, 2, 3, 4].map(
                (j) =>
                  `<circle cx="${x + 40}" cy="${436 + j * 40}" r="7" fill="${p.accent}"/>` +
                  rect(x + 60, 432 + j * 40, 200 - j * 12, 8, hi ? p.bg + "88" : p.muted + "66", 4),
              ),
              rect(x + 32, 670, 296, 50, hi ? p.accent : p.fg, 12),
              text(x + 180, 702, hi ? "Start trial" : "Choose", 16, p.bg, {
                anchor: "middle",
                weight: 600,
              }),
            ].join("");
          }),
        ].join(""),
      };
    }
    case "stats": {
      const h = 420;
      const stats = [
        ["4.2M", "tasks finished"],
        ["98%", "keep using it"],
        ["31", "countries"],
        ["12 min", "median setup"],
      ];
      return {
        h,
        body: [
          rect(0, 0, W, h, p.fg),
          ...stats.map(
            ([v, l], i) =>
              text(160 + i * 300, 220, v!, 72, p.bg, { weight: 700, font: display }) +
              text(160 + i * 300, 266, l!, 18, p.bg + "aa"),
          ),
          rect(120, 340, W - 240, 1, p.bg, 0, 'fill-opacity="0.2"'),
        ].join(""),
      };
    }
    case "testimonials": {
      const h = 620;
      return {
        h,
        body: [
          rect(0, 0, W, h, p.surface),
          text(120, 130, "Loved by small teams", 44, p.fg, { weight: 600, font: display }),
          ...[0, 1, 2].map((i) => {
            const x = 120 + i * 410;
            return [
              rect(x, 190, 380, 340, p.bg, 18),
              text(x + 32, 250, "“", 64, p.accent, { font: serifFont }),
              lines(x + 32, 280, 5, 310, p.muted + "77", 22),
              `<circle cx="${x + 56}" cy="${470}" r="24" fill="${p.accent}" fill-opacity="${0.4 + i * 0.2}"/>`,
              rect(x + 92, 458, 120, 10, p.fg, 5),
              rect(x + 92, 476, 80, 8, p.muted + "88", 4),
            ].join("");
          }),
        ].join(""),
      };
    }
    case "how-it-works": {
      const h = 680;
      return {
        h,
        body: [
          rect(0, 0, W, h, p.bg),
          text(W / 2, 130, "How it works", 48, p.fg, {
            anchor: "middle",
            weight: 600,
            font: display,
          }),
          rect(260, 300, 920, 2, p.muted, 0, 'fill-opacity="0.3"'),
          ...["Connect", "Arrange", "Publish"].map((s, i) => {
            const x = 260 + i * 460;
            return [
              `<circle cx="${x}" cy="301" r="34" fill="${p.accent}"/>`,
              text(x, 313, String(i + 1), 30, p.bg, { anchor: "middle", weight: 700 }),
              text(x, 390, s, 26, p.fg, { anchor: "middle", weight: 600 }),
              rect(x - 130, 420, 260, 8, p.muted + "66", 4),
              rect(x - 100, 440, 200, 8, p.muted + "66", 4),
              rect(x - 150, 490, 300, 130, p.surface, 14),
            ].join("");
          }),
        ].join(""),
      };
    }
    case "cta": {
      const h = 480;
      return {
        h,
        body: [
          rect(0, 0, W, h, p.bg),
          rect(120, 60, W - 240, 360, p.accent, 28),
          text(W / 2, 210, "Ready when you are.", 60, p.bg, {
            anchor: "middle",
            weight: 700,
            font: display,
          }),
          text(W / 2, 262, "Free for two weeks. No card needed.", 20, p.bg + "cc", {
            anchor: "middle",
          }),
          rect(W / 2 - 100, 300, 200, 56, p.bg, 28),
          text(W / 2, 335, "Get started", 17, p.fg, { anchor: "middle", weight: 600 }),
        ].join(""),
      };
    }
    case "footer": {
      const h = 380;
      const cols = ["Product", "Company", "Resources", "Legal"];
      return {
        h,
        body: [
          rect(0, 0, W, h, p.fg),
          rect(120, 70, 32, 32, p.accent, 6),
          text(164, 94, b.name, 22, p.bg, { weight: 700, font: display }),
          lines(120, 130, 2, 260, p.bg + "55"),
          ...cols.map(
            (c, i) =>
              text(620 + i * 180, 90, c, 15, p.bg, { weight: 600 }) +
              lines(620 + i * 180, 114, 4, 110, p.bg + "44", 26),
          ),
          rect(120, 300, W - 240, 1, p.bg, 0, 'fill-opacity="0.2"'),
          text(120, 336, `© ${b.name}`, 14, p.bg + "88"),
        ].join(""),
      };
    }
    case "navigation": {
      const h = 520;
      return {
        h,
        body: [
          rect(0, 0, W, h, p.bg),
          navBar(b),
          rect(480, 96, 640, 380, p.surface, 18, `stroke="${p.muted}" stroke-opacity="0.2"`),
          ...[0, 1].map((c) =>
            [0, 1, 2, 3]
              .map((r) => {
                const x = 512 + c * 300;
                const y = 130 + r * 82;
                return (
                  rect(x, y, 40, 40, p.accent, 10, 'fill-opacity="0.18"') +
                  rect(x + 56, y + 6, 140, 10, p.fg, 5) +
                  rect(x + 56, y + 24, 180, 8, p.muted + "77", 4)
                );
              })
              .join(""),
          ),
        ].join(""),
      };
    }
  }
}

function svg(w: number, h: number, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
}

/* ---------- mobile / web app screens ---------- */

function phoneScreen(a: AppBrand, s: AppBrand["screens"][number], i: number) {
  const p = a.palette;
  const Wp = 390;
  const Hp = 844;
  const parts = [
    rect(0, 0, Wp, Hp, p.bg),
    text(24, 30, "9:41", 15, p.fg, { weight: 600 }),
    rect(330, 20, 36, 14, p.fg, 4),
  ];
  switch (s.pattern) {
    case "onboarding":
      parts.push(
        `<circle cx="195" cy="300" r="120" fill="${p.accent}" fill-opacity="0.9"/>`,
        rect(135, 260, 120, 80, p.bg, 16, 'fill-opacity="0.85"'),
        text(195, 500, s.title, 28, p.fg, { anchor: "middle", weight: 700 }),
        rect(70, 530, 250, 10, p.muted + "77", 5),
        rect(100, 550, 190, 10, p.muted + "77", 5),
        ...[0, 1, 2].map(
          (d) =>
            `<circle cx="${177 + d * 18}" cy="640" r="5" fill="${d === i % 3 ? p.accent : p.muted + "66"}"/>`,
        ),
        rect(24, 740, 342, 56, p.fg, 16),
        text(195, 775, "Continue", 17, p.bg, { anchor: "middle", weight: 600 }),
      );
      break;
    case "paywall":
      parts.push(
        text(24, 120, s.title, 30, p.fg, { weight: 700 }),
        ...["Unlimited projects", "Offline mode", "Priority support"].map(
          (f, j) =>
            `<circle cx="36" cy="${180 + j * 40}" r="8" fill="${p.accent}"/>` +
            text(56, 186 + j * 40, f, 16, p.fg),
        ),
        rect(24, 340, 342, 96, p.surface, 16, `stroke="${p.accent}" stroke-width="3"`),
        text(44, 380, "Yearly", 17, p.fg, { weight: 600 }),
        text(44, 408, "$39.99 · save 45%", 14, p.muted),
        rect(270, 352, 80, 24, p.accent, 12),
        text(310, 369, "BEST", 11, p.bg, { anchor: "middle", weight: 700 }),
        rect(24, 452, 342, 80, p.surface, 16),
        text(44, 498, "Monthly · $5.99", 16, p.fg),
        rect(24, 740, 342, 56, p.accent, 16),
        text(195, 775, "Start free trial", 17, p.bg, { anchor: "middle", weight: 600 }),
      );
      break;
    case "settings":
      parts.push(
        text(24, 110, "Settings", 32, p.fg, { weight: 700 }),
        ...[0, 1, 2, 3, 4, 5, 6].map((r) =>
          [
            rect(24, 150 + r * 64, 342, 56, p.surface, 12),
            rect(40, 166 + r * 64, 24, 24, p.accent, 6, 'fill-opacity="0.8"'),
            rect(78, 174 + r * 64, 120 + (r % 3) * 20, 10, p.fg, 5),
            r % 2 === 0
              ? rect(306, 166 + r * 64, 44, 26, p.accent, 13) +
                `<circle cx="337" cy="${179 + r * 64}" r="10" fill="${p.bg}"/>`
              : text(346, 184 + r * 64, "›", 22, p.muted),
          ].join(""),
        ),
      );
      break;
    default: // home / feed
      parts.push(
        text(24, 100, s.title, 30, p.fg, { weight: 700 }),
        rect(24, 124, 342, 44, p.surface, 22),
        rect(24, 190, 342, 180, p.accent, 20, 'fill-opacity="0.9"'),
        text(44, 240, "Today", 15, p.bg, { weight: 600 }),
        text(44, 290, "2 of 5 done", 30, p.bg, { weight: 700 }),
        ...[0, 1, 2, 3].map(
          (r) =>
            rect(24, 390 + r * 84, 342, 72, p.surface, 14) +
            `<circle cx="60" cy="${426 + r * 84}" r="18" fill="${p.accent}" fill-opacity="0.3"/>` +
            rect(90, 414 + r * 84, 160, 10, p.fg, 5) +
            rect(90, 432 + r * 84, 110, 8, p.muted + "88", 4),
        ),
        rect(0, 770, Wp, 74, p.surface),
        ...[0, 1, 2, 3].map((t) =>
          rect(42 + t * 90, 790, 24, 24, t === 0 ? p.accent : p.muted + "88", 6),
        ),
      );
  }
  return svg(Wp, Hp, parts.join(""));
}

function webAppScreen(a: AppBrand, s: AppBrand["screens"][number]) {
  const p = a.palette;
  const Wd = 1440;
  const Hd = 900;
  const parts = [
    rect(0, 0, Wd, Hd, p.bg),
    rect(0, 0, 240, Hd, p.surface),
    rect(24, 28, 28, 28, p.accent, 7),
    text(62, 49, a.name, 17, p.fg, { weight: 700 }),
    ...[0, 1, 2, 3, 4, 5].map(
      (i) =>
        rect(24, 100 + i * 44, 192, 32, i === 0 ? p.accent + "22" : "transparent", 8) +
        rect(40, 112 + i * 44, 100 + (i % 3) * 20, 8, i === 0 ? p.accent : p.muted + "99", 4),
    ),
    text(280, 70, s.title, 28, p.fg, { weight: 700 }),
  ];
  if (s.pattern === "empty-state") {
    parts.push(
      `<circle cx="840" cy="400" r="80" fill="${p.accent}" fill-opacity="0.15"/>`,
      rect(800, 370, 80, 60, p.accent, 10, 'fill-opacity="0.6"'),
      text(840, 540, "Nothing here yet", 24, p.fg, { anchor: "middle", weight: 600 }),
      rect(720, 566, 240, 10, p.muted + "77", 5),
      rect(760, 610, 160, 44, p.fg, 10),
      text(840, 638, "Create first item", 14, p.bg, { anchor: "middle", weight: 600 }),
    );
  } else {
    parts.push(
      ...[0, 1, 2, 3].map(
        (i) =>
          rect(280 + i * 280, 110, 260, 120, p.surface, 14) +
          rect(300 + i * 280, 134, 80, 8, p.muted + "99", 4) +
          text(300 + i * 280, 196, ["$48.2k", "1,204", "86%", "3.4d"][i]!, 32, p.fg, {
            weight: 700,
          }),
      ),
      rect(280, 260, 740, 380, p.surface, 14),
      `<polyline fill="none" stroke="${p.accent}" stroke-width="4" points="${Array.from({ length: 12 }, (_, i) => `${310 + i * 60},${560 - Math.round(Math.abs(Math.sin(i * 0.9 + a.slug.length)) * 220)}`).join(" ")}"/>`,
      rect(1040, 260, 360, 380, p.surface, 14),
      ...[0, 1, 2, 3, 4].map(
        (i) =>
          `<circle cx="1076" cy="${306 + i * 64}" r="16" fill="${p.accent}" fill-opacity="0.3"/>` +
          rect(1104, 298 + i * 64, 160, 9, p.fg, 4) +
          rect(1104, 314 + i * 64, 100, 7, p.muted + "88", 4),
      ),
      rect(280, 660, 1120, 200, p.surface, 14),
      ...[0, 1, 2, 3].map(
        (i) =>
          rect(300, 690 + i * 40, 1080, 1, p.muted, 0, 'fill-opacity="0.2"') +
          rect(300, 704 + i * 40, 200, 8, p.fg + "aa", 4),
      ),
    );
  }
  return svg(Wd, Hd, parts.join(""));
}

/* ---------- catalogue of fictional products ---------- */

const sites: SiteBrand[] = [
  {
    name: "Quillfox",
    slug: "quillfox",
    category: "AI & Chat",
    styles: ["minimal", "light"],
    palette: {
      bg: "#FBFAF7",
      fg: "#1B1A17",
      muted: "#77736A",
      accent: "#D9480F",
      surface: "#F0EDE6",
    },
    serif: true,
    headline: ["Drafts that sound", "like you, only sooner"],
    sub: "A writing partner trained on your own notes.",
    sections: ["hero", "features", "testimonials", "pricing", "footer"],
    daysAgo: 0,
  },
  {
    name: "Kitebase",
    slug: "kitebase",
    category: "Developer Tools",
    styles: ["dark", "grid"],
    palette: {
      bg: "#0C0F14",
      fg: "#E8ECF2",
      muted: "#8A94A6",
      accent: "#5EEAD4",
      surface: "#161B24",
    },
    serif: false,
    headline: ["Deploy previews", "for every branch"],
    sub: "Push code, get a URL, share it with anyone.",
    sections: ["hero", "stats", "how-it-works", "pricing", "cta", "footer"],
    daysAgo: 1,
  },
  {
    name: "Mintbridge",
    slug: "mintbridge",
    category: "Finance",
    styles: ["light", "bold"],
    palette: {
      bg: "#F4FBF6",
      fg: "#0E2A1C",
      muted: "#5B7566",
      accent: "#16A34A",
      surface: "#E3F2E8",
    },
    serif: false,
    headline: ["Money in.", "Worry out."],
    sub: "Invoices, payouts and tax set-asides on autopilot.",
    sections: ["hero", "features", "stats", "cta"],
    daysAgo: 1,
  },
  {
    name: "Driftline",
    slug: "driftline",
    category: "Travel",
    styles: ["photography", "colorful"],
    palette: {
      bg: "#FFF8F1",
      fg: "#2A1A12",
      muted: "#8C6E5C",
      accent: "#F97316",
      surface: "#FBE7D6",
    },
    serif: true,
    headline: ["Slow trips,", "planned in minutes"],
    sub: "Rail-first itineraries across 30 countries.",
    sections: ["hero", "how-it-works", "testimonials", "footer"],
    daysAgo: 2,
  },
  {
    name: "Ferrous",
    slug: "ferrous",
    category: "Finance",
    styles: ["dark", "3d"],
    palette: {
      bg: "#09090B",
      fg: "#FAFAFA",
      muted: "#A1A1AA",
      accent: "#A855F7",
      surface: "#18181B",
    },
    serif: false,
    headline: ["Self-custody,", "minus the anxiety"],
    sub: "A hardware-backed wallet with recovery that makes sense.",
    sections: ["hero", "features", "pricing", "footer"],
    daysAgo: 3,
  },
  {
    name: "Pulsewise",
    slug: "pulsewise",
    category: "Health & Fitness",
    styles: ["light", "illustration"],
    palette: {
      bg: "#F5F7FF",
      fg: "#151B3A",
      muted: "#6A7299",
      accent: "#4F46E5",
      surface: "#E6E9FB",
    },
    serif: false,
    headline: ["Sleep better,", "one night at a time"],
    sub: "Gentle coaching from the data you already have.",
    sections: ["hero", "features", "testimonials", "cta"],
    daysAgo: 4,
  },
  {
    name: "Tallow & Rye",
    slug: "tallow-and-rye",
    category: "Food & Drink",
    styles: ["colorful", "illustration"],
    palette: {
      bg: "#FFF6E5",
      fg: "#3B1F0E",
      muted: "#8A6A4F",
      accent: "#E11D48",
      surface: "#FBE5C0",
    },
    serif: true,
    headline: ["Bread for the", "whole week, delivered"],
    sub: "Baked at 4am, at your door by 8.",
    sections: ["hero", "navigation", "pricing", "footer"],
    daysAgo: 5,
  },
  {
    name: "Orbitly",
    slug: "orbitly",
    category: "Productivity",
    styles: ["glass", "colorful"],
    palette: {
      bg: "#0B1026",
      fg: "#F1F4FF",
      muted: "#9AA3C7",
      accent: "#38BDF8",
      surface: "#1A2148",
    },
    serif: false,
    headline: ["Your calendar,", "finally on your side"],
    sub: "Auto-scheduling that protects focus time.",
    sections: ["hero", "stats", "features", "cta"],
    daysAgo: 6,
  },
  {
    name: "Gleam Studio",
    slug: "gleam-studio",
    category: "Entertainment",
    styles: ["minimal", "black-and-white"],
    palette: {
      bg: "#FFFFFF",
      fg: "#0A0A0A",
      muted: "#737373",
      accent: "#0A0A0A",
      surface: "#F2F2F2",
    },
    serif: true,
    headline: ["Motion design", "for patient brands"],
    sub: "Independent studio. Eleven people. One floor.",
    sections: ["hero", "testimonials", "footer"],
    daysAgo: 7,
  },
  {
    name: "Ledgerleaf",
    slug: "ledgerleaf",
    category: "Finance",
    styles: ["minimal", "light"],
    palette: {
      bg: "#FAFAF5",
      fg: "#1F2421",
      muted: "#6B726D",
      accent: "#2F6F4F",
      surface: "#EEF0E8",
    },
    serif: true,
    headline: ["Bookkeeping for", "people who hate it"],
    sub: "Snap receipts. We do the rest.",
    sections: ["hero", "how-it-works", "pricing"],
    daysAgo: 8,
  },
  {
    name: "Sorrel",
    slug: "sorrel",
    category: "Shopping",
    styles: ["bold", "colorful"],
    palette: {
      bg: "#FFF1F2",
      fg: "#2B0A12",
      muted: "#8A4D5C",
      accent: "#DB2777",
      surface: "#FFE0E6",
    },
    serif: false,
    headline: ["Refill,", "don't rebuy"],
    sub: "Home staples in returnable glass.",
    sections: ["hero", "features", "cta", "footer"],
    daysAgo: 9,
  },
  {
    name: "Halyard",
    slug: "halyard",
    category: "Education",
    styles: ["light", "grid"],
    palette: {
      bg: "#F7FAFC",
      fg: "#102A43",
      muted: "#627D98",
      accent: "#2563EB",
      surface: "#E6EEF6",
    },
    serif: false,
    headline: ["Learn to sail", "before you get wet"],
    sub: "Interactive lessons, then a real boat.",
    sections: ["hero", "stats", "testimonials", "pricing", "footer"],
    daysAgo: 11,
  },
];

const apps: AppBrand[] = [
  {
    name: "Brightloop",
    slug: "brightloop",
    platform: "ios",
    category: "Health & Fitness",
    palette: {
      bg: "#FFFFFF",
      fg: "#111827",
      muted: "#6B7280",
      accent: "#F59E0B",
      surface: "#F3F4F6",
    },
    flow: "Onboarding",
    screens: [
      { pattern: "onboarding", elements: ["button", "progress-bar"], title: "Build a streak" },
      { pattern: "onboarding", elements: ["button"], title: "Set a reminder" },
      { pattern: "paywall-upgrade", elements: ["button", "card", "badge"], title: "Go unlimited" },
      { pattern: "home-feed", elements: ["tab-bar", "card", "list"], title: "Good morning" },
    ],
    daysAgo: 2,
  },
  {
    name: "Parcelly",
    slug: "parcelly",
    platform: "android",
    category: "Utilities",
    palette: {
      bg: "#F8FAFC",
      fg: "#0F172A",
      muted: "#64748B",
      accent: "#0EA5E9",
      surface: "#E2E8F0",
    },
    screens: [
      { pattern: "home-feed", elements: ["tab-bar", "list"], title: "Deliveries" },
      { pattern: "settings", elements: ["toggle", "list"], title: "Settings" },
    ],
    daysAgo: 4,
  },
  {
    name: "Cobalt Desk",
    slug: "cobalt-desk",
    platform: "web",
    category: "Productivity",
    palette: {
      bg: "#FFFFFF",
      fg: "#111827",
      muted: "#6B7280",
      accent: "#2563EB",
      surface: "#F3F4F6",
    },
    screens: [
      { pattern: "dashboard", elements: ["chart", "card", "navigation-bar"], title: "Overview" },
      { pattern: "empty-state", elements: ["button"], title: "Projects" },
    ],
    daysAgo: 3,
  },
];

const sectionToPattern: Record<SectionType, string> = {
  hero: "hero-section",
  features: "features-section",
  pricing: "pricing-section",
  stats: "stats-section",
  testimonials: "social-proof",
  cta: "cta-section",
  footer: "footer-section",
  "how-it-works": "how-it-works",
  navigation: "navigation-section",
};

const today = new Date("2026-10-30");
const day = (n: number) => new Date(today.getTime() - n * 86400000).toISOString().slice(0, 10);

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  const data: unknown[] = [];

  for (const b of sites) {
    const dir = path.join(OUT, b.slug);
    fs.mkdirSync(dir, { recursive: true });
    const built = b.sections.map((t) => ({ t, ...section(b, t) }));
    const fullH = built.reduce((n, s) => n + s.h, 0);
    let y = 0;
    const full = built.map((s) => {
      const g = `<g transform="translate(0 ${y})">${s.body}</g>`;
      y += s.h;
      return g;
    });
    fs.writeFileSync(path.join(dir, "full.svg"), svg(W, fullH, full.join("")));
    fs.writeFileSync(
      path.join(dir, "icon.svg"),
      svg(
        64,
        64,
        rect(0, 0, 64, 64, b.palette.fg, 14) +
          rect(18, 18, 28, 28, b.palette.accent, b.styles.includes("minimal") ? 14 : 6),
      ),
    );
    data.push({
      app: {
        name: b.name,
        slug: b.slug,
        platform: "site",
        category: b.category,
        brand_color: b.palette.accent,
        website_url: null,
        icon_path: `/samples/${b.slug}/icon.svg`,
        version: null,
        captured_at: day(b.daysAgo),
      },
      screens: built.map((s, i) => {
        const file = `${s.t}.svg`;
        fs.writeFileSync(path.join(dir, file), svg(W, s.h, s.body));
        return {
          kind: "section",
          image_path: `/samples/${b.slug}/${file}`,
          full_image_path: `/samples/${b.slug}/full.svg`,
          width: W,
          height: s.h,
          dominant_colors: [b.palette.bg, b.palette.accent, b.palette.fg],
          patterns: [sectionToPattern[s.t]],
          styles: b.styles,
          elements:
            s.t === "pricing"
              ? ["card", "button"]
              : s.t === "navigation"
                ? ["navigation-bar", "dropdown"]
                : ["button"],
          ai_description: `${s.t.replace(/-/g, " ")} section for ${b.name}, a fictional ${b.category.toLowerCase()} product. ${b.styles.join(", ")} visual style with ${b.serif ? "serif" : "sans-serif"} headlines and a ${b.palette.accent} accent.`,
          ocr_text: s.t === "hero" ? `${b.headline.join(" ")} ${b.sub}` : null,
          captured_at: day(b.daysAgo),
          created_offset_minutes: b.daysAgo * 1440 + i * 7,
          save_count: (b.slug.length * 37 + i * 53) % 400,
        };
      }),
    });
  }

  for (const a of apps) {
    const dir = path.join(OUT, a.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "icon.svg"),
      svg(
        64,
        64,
        rect(0, 0, 64, 64, a.palette.accent, 14) +
          `<circle cx="32" cy="32" r="13" fill="${a.palette.bg}"/>`,
      ),
    );
    data.push({
      app: {
        name: a.name,
        slug: a.slug,
        platform: a.platform,
        category: a.category,
        brand_color: a.palette.accent,
        icon_path: `/samples/${a.slug}/icon.svg`,
        version: "3.2.0",
        captured_at: day(a.daysAgo),
      },
      flow: a.flow
        ? { name: a.flow, description: `${a.flow} as captured on ${day(a.daysAgo)}.` }
        : null,
      screens: a.screens.map((s, i) => {
        const file = `${i + 1}-${s.pattern}.svg`;
        const isWeb = a.platform === "web";
        fs.writeFileSync(path.join(dir, file), isWeb ? webAppScreen(a, s) : phoneScreen(a, s, i));
        return {
          kind: "screen",
          image_path: `/samples/${a.slug}/${file}`,
          full_image_path: null,
          width: isWeb ? 1440 : 390,
          height: isWeb ? 900 : 844,
          dominant_colors: [a.palette.bg, a.palette.accent],
          patterns: [s.pattern],
          styles: [],
          elements: s.elements,
          ai_description: `${s.title}: ${s.pattern.replace(/-/g, " ")} screen in ${a.name}, a fictional ${a.category.toLowerCase()} ${a.platform} app.`,
          ocr_text: s.title,
          flow_position: a.flow ? i + 1 : null,
          flow_caption: a.flow ? s.title : null,
          captured_at: day(a.daysAgo),
          created_offset_minutes: a.daysAgo * 1440 + i * 5,
          save_count: (a.slug.length * 29 + i * 41) % 300,
        };
      }),
    });
  }

  fs.writeFileSync(
    path.join(__dirname, "..", "db", "sample-data.json"),
    JSON.stringify(data, null, 1),
  );
  console.log(`wrote ${data.length} products`);
}

main();
