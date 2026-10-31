import { createHash, randomUUID } from "node:crypto";
import sample from "@/db/sample-data.json";
import type { AppDetail, FlowDetail } from "./screens";
import { APP_PATTERNS, SITE_SECTIONS, slugify, STYLES, UI_ELEMENTS } from "./taxonomy";
import {
  effectiveSort,
  type Facets,
  type FacetOption,
  type Filters,
  type Page,
  type Platform,
  type ScreenCard,
  type ScreenDetail,
  type Tag,
} from "./types";

/*
 * Read-only store over the bundled sample data, used when DATABASE_URL is not set
 * (e.g. a preview deploy with no database). Mirrors the Postgres queries in screens.ts;
 * search is a simple all-words prefix match instead of tsvector ranking.
 */

interface SampleScreen {
  kind: "screen" | "section";
  image_path: string;
  full_image_path: string | null;
  width: number;
  height: number;
  dominant_colors: string[];
  patterns: string[];
  styles: string[];
  elements: string[];
  ai_description: string;
  ocr_text: string | null;
  flow_position?: number | null;
  flow_caption?: string | null;
  captured_at: string;
  created_offset_minutes: number;
  save_count: number;
  video_path?: string | null;
}
interface SampleProduct {
  app: {
    name: string;
    slug: string;
    platform: Platform;
    category: string;
    icon_path: string;
    version: string | null;
    captured_at: string;
    website_url?: string | null;
  };
  flow?: { name: string; description: string } | null;
  screens: SampleScreen[];
}

interface Row {
  detail: ScreenDetail;
  createdMs: number;
  category: { name: string; slug: string };
  words: string[];
  flowCaption: string | null;
}

const stableId = (key: string) => {
  const h = createHash("sha1").update(key).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
};

const names = (list: string[]) => new Map(list.map((n) => [slugify(n), n]));
const PATTERN_NAMES = new Map([...names(APP_PATTERNS), ...names(SITE_SECTIONS)]);
const STYLE_NAMES = names(STYLES);
const ELEMENT_NAMES = names(UI_ELEMENTS);
const SEED_TIME = Date.parse("2026-10-30T12:00:00Z");
const words = (s: string) => s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

const products = sample as SampleProduct[];
const ROWS: Row[] = [];
const APPS = new Map<string, AppDetail>();
const FLOWS = new Map<string, FlowDetail>();

for (const p of products) {
  const app = {
    name: p.app.name,
    slug: p.app.slug,
    platform: p.app.platform,
    iconPath: p.app.icon_path,
  };
  const category = { name: p.app.category, slug: slugify(p.app.category) };
  const flowId = p.flow ? stableId(`${p.app.slug}:flow`) : null;
  const steps: FlowDetail["steps"] = [];
  p.screens.forEach((s, i) => {
    const id = stableId(`${p.app.slug}:${i}`);
    const tag = (kind: Tag["kind"], lookup: Map<string, string>) => (slug: string) => ({
      kind,
      slug,
      name: lookup.get(slug) ?? slug,
    });
    const tags: Tag[] = [
      ...s.patterns.map(tag("pattern", PATTERN_NAMES)),
      { kind: "category", ...category },
      ...s.styles.map(tag("style", STYLE_NAMES)).sort((a, b) => a.name.localeCompare(b.name)),
      ...s.elements.map(tag("element", ELEMENT_NAMES)).sort((a, b) => a.name.localeCompare(b.name)),
    ];
    const createdMs = SEED_TIME - s.created_offset_minutes * 60_000;
    const inFlow = flowId && s.flow_position;
    ROWS.push({
      createdMs,
      category,
      flowCaption: s.flow_caption ?? null,
      words: words(
        [app.name, ...tags.map((t) => t.name), s.ai_description, s.ocr_text ?? ""].join(" "),
      ),
      detail: {
        id,
        kind: s.kind,
        imagePath: s.image_path,
        width: s.width,
        height: s.height,
        color: s.dominant_colors[0] ?? null,
        createdAt: new Date(createdMs).toISOString(),
        saveCount: s.save_count,
        video: s.video_path ?? null,
        app,
        tags,
        fullImagePath: s.full_image_path,
        description: s.ai_description,
        capturedAt: s.captured_at,
        appVersion: p.app.version,
        flow: inFlow ? { id: flowId, name: p.flow!.name, position: s.flow_position! } : null,
      },
    });
    if (inFlow)
      steps.push({
        id,
        imagePath: s.image_path,
        width: s.width,
        height: s.height,
        caption: s.flow_caption ?? null,
        position: s.flow_position!,
      });
  });
  if (flowId && p.flow) {
    FLOWS.set(flowId, {
      id: flowId,
      name: p.flow.name,
      description: p.flow.description,
      app,
      steps: steps.sort((a, b) => a.position - b.position),
    });
  }
  APPS.set(p.app.slug, {
    ...app,
    category: p.app.category,
    version: p.app.version,
    capturedAt: p.app.captured_at,
    websiteUrl: p.app.website_url ?? null,
    flows: flowId ? [{ id: flowId, name: p.flow!.name, steps: steps.length }] : [],
  });
}
const BY_ID = new Map(ROWS.map((r) => [r.detail.id, r]));

const toCard = ({ detail: d }: Row): ScreenCard => ({
  id: d.id,
  kind: d.kind,
  imagePath: d.imagePath,
  width: d.width,
  height: d.height,
  color: d.color,
  createdAt: d.createdAt,
  saveCount: d.saveCount,
  video: d.video,
  app: d.app,
  tags: d.tags,
});

const hasTag = (r: Row, kind: Tag["kind"], slug: string) =>
  r.detail.tags.some((t) => t.kind === kind && t.slug === slug);

/** Share of query words that prefix-match a document word; 0 means no match. */
function score(r: Row, q: string) {
  const qs = words(q);
  if (!qs.length) return 0;
  return qs.every((w) => r.words.some((d) => d.startsWith(w)))
    ? qs.filter((w) => r.words.includes(w)).length + 1
    : 0;
}

function filtered(f: Filters) {
  const sort = effectiveSort(f);
  const rows = ROWS.filter(
    (r) =>
      r.detail.app.platform === f.platform &&
      (!f.pattern || hasTag(r, "pattern", f.pattern)) &&
      (!f.style || hasTag(r, "style", f.style)) &&
      (!f.element || hasTag(r, "element", f.element)) &&
      (!f.category || r.category.slug === f.category) &&
      (!f.app || r.detail.app.slug === f.app) &&
      (f.has !== "video" || !!r.detail.video) &&
      (!f.q || score(r, f.q) > 0),
  );
  const byLatest = (a: Row, b: Row) =>
    b.createdMs - a.createdMs || a.detail.id.localeCompare(b.detail.id);
  return rows.sort((a, b) => {
    if (sort === "popular") return b.detail.saveCount - a.detail.saveCount || byLatest(a, b);
    if (sort === "relevance") return score(b, f.q!) - score(a, f.q!) || byLatest(a, b);
    return byLatest(a, b);
  });
}

export async function listScreens(f: Filters, offset = 0, limit = 24): Promise<Page<ScreenCard>> {
  const rows = filtered(f);
  const items = rows.slice(offset, offset + limit).map(toCard);
  const next = offset + items.length;
  return { items, total: rows.length, nextOffset: next < rows.length ? next : null };
}

export async function getNeighbors(f: Filters, index: number) {
  const rows = filtered(f);
  const at = (i: number) => (i >= 0 && rows[i] ? toCard(rows[i]) : null);
  return { prev: at(index - 1), next: at(index + 1), total: rows.length };
}

export async function getScreen(id: string): Promise<ScreenDetail | null> {
  return BY_ID.get(id)?.detail ?? null;
}

export async function getRelated(id: string, limit = 6): Promise<ScreenCard[]> {
  const me = BY_ID.get(id);
  if (!me) return [];
  const mine = new Set(
    me.detail.tags
      .filter((t) => t.kind === "pattern" || t.kind === "style")
      .map((t) => t.kind + t.slug),
  );
  return ROWS.filter((r) => r !== me && r.detail.app.platform === me.detail.app.platform)
    .map((r) => ({ r, overlap: r.detail.tags.filter((t) => mine.has(t.kind + t.slug)).length }))
    .filter((x) => x.overlap > 0)
    .sort(
      (a, b) =>
        b.overlap - a.overlap ||
        Number(a.r.detail.app.slug === me.detail.app.slug) -
          Number(b.r.detail.app.slug === me.detail.app.slug) ||
        b.r.createdMs - a.r.createdMs,
    )
    .slice(0, limit)
    .map((x) => toCard(x.r));
}

export async function getFacets(platform: Platform): Promise<Facets> {
  const rows = ROWS.filter((r) => r.detail.app.platform === platform);
  const count = (kind: Tag["kind"], universe?: Map<string, string>): FacetOption[] => {
    const counts = new Map<string, FacetOption>();
    for (const [slug, name] of universe ?? []) counts.set(slug, { slug, name, count: 0 });
    for (const r of rows)
      for (const t of r.detail.tags.filter((t) => t.kind === kind)) {
        const cur = counts.get(t.slug) ?? { slug: t.slug, name: t.name, count: 0 };
        counts.set(t.slug, { ...cur, count: cur.count + 1 });
      }
    return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  };
  const scoped = names(platform === "site" ? SITE_SECTIONS : APP_PATTERNS);
  return {
    pattern: count("pattern", scoped),
    style: count("style"),
    element: count("element"),
    category: count("category"),
  };
}

export async function getApp(slug: string): Promise<AppDetail | null> {
  return APPS.get(slug) ?? null;
}

export async function getFlow(id: string): Promise<FlowDetail | null> {
  return FLOWS.get(id) ?? null;
}

export async function getScreensByIds(ids: string[]): Promise<ScreenCard[]> {
  return ids
    .slice(0, 200)
    .map((id) => BY_ID.get(id))
    .filter((r): r is Row => !!r)
    .map(toCard);
}

export async function createTakedown(input: { screenId: string; reason: string; contact: string }) {
  // No database to persist to: surface it in the server logs so it isn't lost silently.
  const id = randomUUID();
  console.warn("[takedown] no DATABASE_URL; request not persisted", {
    id,
    screenId: input.screenId,
    contact: input.contact,
    reason: input.reason,
  });
  return id;
}
