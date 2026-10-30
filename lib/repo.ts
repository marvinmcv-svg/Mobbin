import "server-only";
import { getPool } from "@/db/client";
import * as memory from "@/lib/data/memory";
import * as pg from "@/lib/data/screens";
import type { Filters, Platform } from "@/lib/data/types";

/**
 * Data access for pages and routes. Uses Postgres when DATABASE_URL is set, otherwise the
 * read-only store over the bundled sample data (so a deploy works before a database exists).
 */
const postgres = {
  listScreens: (f: Filters, offset?: number, limit?: number) =>
    pg.listScreens(getPool(), f, offset, limit),
  getNeighbors: (f: Filters, index: number) => pg.getNeighbors(getPool(), f, index),
  getScreen: (id: string) => pg.getScreen(getPool(), id),
  getRelated: (id: string, limit?: number) => pg.getRelated(getPool(), id, limit),
  getFacets: (platform: Platform) => pg.getFacets(getPool(), platform),
  getApp: (slug: string) => pg.getApp(getPool(), slug),
  getFlow: (id: string) => pg.getFlow(getPool(), id),
  getScreensByIds: (ids: string[]) => pg.getScreensByIds(getPool(), ids),
  createTakedown: (input: { screenId: string; reason: string; contact: string }) =>
    pg.createTakedown(getPool(), input),
};

export const repo: typeof postgres = process.env.DATABASE_URL ? postgres : memory;
