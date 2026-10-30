import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { seed } from "@/db/seed";
import {
  createTakedown,
  getApp,
  getFacets,
  getFlow,
  getNeighbors,
  getRelated,
  getScreen,
  getScreensByIds,
  listScreens,
} from "@/lib/data/screens";
import { effectiveSort, parseFilters } from "@/lib/data/types";

process.loadEnvFile?.(".env");
const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });

beforeAll(async () => {
  await pool.query("drop schema public cascade; create schema public;");
  await seed(pool);
  await seed(pool); // idempotency: a second run must not duplicate anything
});
afterAll(() => pool.end());

const f = (p: Record<string, string> = {}) => parseFilters(p);

describe("filters", () => {
  it("falls back to safe defaults for junk input", () => {
    const x = parseFilters({ platform: "nope", style: "Robert'); drop", q: "  " });
    expect(x).toEqual({
      platform: "site",
      style: undefined,
      q: undefined,
      pattern: undefined,
      element: undefined,
      category: undefined,
      app: undefined,
      sort: undefined,
    });
  });
  it("defaults to relevance only with a query", () => {
    expect(effectiveSort(f())).toBe("latest");
    expect(effectiveSort(f({ q: "pricing" }))).toBe("relevance");
    expect(effectiveSort(f({ sort: "relevance" }))).toBe("latest");
  });
});

describe("listScreens", () => {
  it("returns only the requested platform, newest first", async () => {
    const page = await listScreens(pool, f(), 0, 100);
    expect(page.total).toBe(50);
    expect(page.items.every((s) => s.app.platform === "site")).toBe(true);
    const times = page.items.map((s) => s.createdAt);
    expect([...times].sort().reverse()).toEqual(times);
  });

  it("is idempotently seeded", async () => {
    const { rows } = await pool.query("select count(*)::int as n from screens");
    expect(rows[0].n).toBe(58);
  });

  it("paginates without overlap", async () => {
    const a = await listScreens(pool, f(), 0, 20);
    const b = await listScreens(pool, f(), 20, 20);
    const c = await listScreens(pool, f(), 40, 20);
    expect(a.nextOffset).toBe(20);
    expect(c.nextOffset).toBeNull();
    const ids = [...a.items, ...b.items, ...c.items].map((s) => s.id);
    expect(new Set(ids).size).toBe(50);
  });

  it("combines facet filters", async () => {
    const page = await listScreens(pool, f({ pattern: "hero-section", style: "dark" }));
    expect(page.items.map((s) => s.app.slug).sort()).toEqual(["ferrous", "kitebase"]);
    for (const s of page.items) {
      expect(s.tags.some((t) => t.slug === "hero-section")).toBe(true);
      expect(s.tags.some((t) => t.slug === "dark")).toBe(true);
    }
  });

  it("filters by category", async () => {
    const page = await listScreens(pool, f({ category: "finance" }));
    expect(new Set(page.items.map((s) => s.app.slug))).toEqual(
      new Set(["mintbridge", "ferrous", "ledgerleaf"]),
    );
  });

  it("sorts by popularity", async () => {
    const page = await listScreens(pool, f({ sort: "popular" }), 0, 100);
    const saves = page.items.map((s) => s.saveCount);
    expect([...saves].sort((x, y) => y - x)).toEqual(saves);
  });

  it("searches full text, including partial words", async () => {
    const full = await listScreens(pool, f({ q: "pricing" }));
    expect(full.total).toBeGreaterThan(0);
    expect(full.items.every((s) => s.tags.some((t) => t.slug === "pricing-section"))).toBe(true);
    const partial = await listScreens(pool, f({ q: "kiteb" }));
    expect(partial.items.length).toBeGreaterThan(0);
    expect(partial.items.every((s) => s.app.slug === "kitebase")).toBe(true);
    const symbols = await listScreens(pool, f({ q: "&& :* !" }));
    expect(symbols.total).toBe(0);
  });
});

describe("detail queries", () => {
  it("gets a screen with tags and its full capture", async () => {
    const [first] = (await listScreens(pool, f({ app: "quillfox", pattern: "hero-section" })))
      .items;
    const s = await getScreen(pool, first!.id);
    expect(s?.app.name).toBe("Quillfox");
    expect(s?.fullImagePath).toBe("/samples/quillfox/full.svg");
    expect(await getScreen(pool, "not-a-uuid")).toBeNull();
  });

  it("finds neighbours inside the current result set", async () => {
    const filters = f({ style: "dark" });
    const all = await listScreens(pool, filters, 0, 100);
    const n = await getNeighbors(pool, filters, 1);
    expect(n.prev?.id).toBe(all.items[0]!.id);
    expect(n.next?.id).toBe(all.items[2]!.id);
    const edge = await getNeighbors(pool, filters, 0);
    expect(edge.prev).toBeNull();
  });

  it("ranks related screens by shared tags on the same platform", async () => {
    const [hero] = (await listScreens(pool, f({ app: "kitebase", pattern: "hero-section" }))).items;
    const related = await getRelated(pool, hero!.id, 4);
    expect(related.length).toBe(4);
    expect(related.every((r) => r.id !== hero!.id && r.app.platform === "site")).toBe(true);
    expect(related[0]!.tags.some((t) => t.slug === "hero-section" || t.slug === "dark")).toBe(true);
  });

  it("returns facets with counts for the platform", async () => {
    const facets = await getFacets(pool, "site");
    expect(facets.pattern.find((p) => p.slug === "hero-section")?.count).toBe(12);
    expect(facets.pattern.some((p) => p.slug === "onboarding")).toBe(false);
    expect(facets.style.length).toBeGreaterThan(5);
  });

  it("returns apps and ordered flows", async () => {
    const app = await getApp(pool, "brightloop");
    expect(app?.flows).toHaveLength(1);
    const flow = await getFlow(pool, app!.flows[0]!.id);
    expect(flow?.steps.map((s) => s.position)).toEqual([1, 2, 3, 4]);
  });

  it("looks up saved screens by id in the given order and records takedowns", async () => {
    const page = await listScreens(pool, f(), 0, 3);
    const ids = page.items.map((s) => s.id).reverse();
    expect((await getScreensByIds(pool, [...ids, "junk"])).map((s) => s.id)).toEqual(ids);
    const id = await createTakedown(pool, { screenId: ids[0]!, reason: "Mine", contact: "a@b.co" });
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
  });
});
