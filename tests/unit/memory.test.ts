import { Pool } from "pg";
import { afterAll, describe, expect, it } from "vitest";
import * as memory from "@/lib/data/memory";
import * as pg from "@/lib/data/screens";
import { parseFilters } from "@/lib/data/types";

process.loadEnvFile?.(".env");
const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
afterAll(() => pool.end());

// The sample store must answer like Postgres (seeded by screens.test.ts, which runs first).
const cases = [
  {},
  { style: "dark" },
  { pattern: "hero-section", sort: "popular" },
  { category: "finance" },
  { platform: "ios" },
  { platform: "web", element: "chart" },
  { q: "kiteb" },
  { q: "pricing" },
  { has: "video" },
];

describe("memory store parity with Postgres", () => {
  it.each(cases)("lists the same screens for %o", async (params) => {
    const f = parseFilters(params as Record<string, string>);
    const [a, b] = await Promise.all([
      memory.listScreens(f, 0, 100),
      pg.listScreens(pool, f, 0, 100),
    ]);
    expect(a.total).toBe(b.total);
    const key = (s: { imagePath: string }) => s.imagePath;
    expect(a.items.map(key).sort()).toEqual(b.items.map(key).sort());
    // Same ordering, ignoring how exact ties are broken (Postgres uses random ids).
    const order = (s: { createdAt: string; saveCount: number }) =>
      f.sort === "popular" ? `${s.saveCount}:${s.createdAt}` : s.createdAt;
    if (!f.q) expect(a.items.map(order)).toEqual(b.items.map(order));
  });

  it("returns the same facets", async () => {
    for (const p of ["site", "ios"] as const) {
      const [a, b] = await Promise.all([memory.getFacets(p), pg.getFacets(pool, p)]);
      const norm = (x: { slug: string; count: number }[]) =>
        x.map((o) => `${o.slug}:${o.count}`).sort();
      expect(norm(a.pattern)).toEqual(norm(b.pattern));
      expect(norm(a.style)).toEqual(norm(b.style));
      expect(norm(a.category)).toEqual(norm(b.category));
    }
  });

  it("resolves detail, related, apps and flows", async () => {
    const [first] = (await memory.listScreens(parseFilters({}), 0, 1)).items;
    expect((await memory.getScreen(first!.id))?.fullImagePath).toMatch(/full\.svg$/);
    expect((await memory.getRelated(first!.id, 4)).length).toBe(4);
    const app = await memory.getApp("brightloop");
    const flow = await memory.getFlow(app!.flows[0]!.id);
    expect(flow?.steps.map((s) => s.position)).toEqual([1, 2, 3, 4]);
    const n = await memory.getNeighbors(parseFilters({}), 0);
    expect(n.prev).toBeNull();
    expect(n.next).not.toBeNull();
  });
});
