import fs from "node:fs";
import path from "node:path";
import { Pool, PoolClient } from "pg";
import { migrate } from "./migrate";

import {
  APP_PATTERNS,
  CATEGORIES,
  SITE_SECTIONS,
  slugify,
  STYLES,
  UI_ELEMENTS,
} from "../lib/data/taxonomy";

export { APP_PATTERNS, CATEGORIES, SITE_SECTIONS, STYLES, UI_ELEMENTS };

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
}

interface SampleProduct {
  app: {
    name: string;
    slug: string;
    platform: string;
    category: string;
    brand_color: string;
    icon_path: string;
    version: string | null;
    captured_at: string;
    website_url?: string | null;
  };
  flow?: { name: string; description: string } | null;
  screens: SampleScreen[];
}

async function upsertNames(
  c: PoolClient,
  table: string,
  names: string[],
  extra?: (name: string) => Record<string, string>,
) {
  for (const name of names) {
    const cols = { name, slug: slugify(name), ...(extra?.(name) ?? {}) };
    const keys = Object.keys(cols);
    await c.query(
      `insert into ${table} (${keys.join(",")}) values (${keys.map((_, i) => `$${i + 1}`).join(",")})
       on conflict (slug) do update set name = excluded.name`,
      Object.values(cols),
    );
  }
}

export async function seedTaxonomy(c: PoolClient) {
  await upsertNames(c, "categories", CATEGORIES);
  await upsertNames(c, "patterns", APP_PATTERNS, () => ({ scope: "app" }));
  await upsertNames(c, "patterns", SITE_SECTIONS, () => ({ scope: "site" }));
  await upsertNames(c, "ui_elements", UI_ELEMENTS);
  await upsertNames(c, "styles", STYLES);
}

/** Loads sample products. Idempotent: an app (by slug) is replaced wholesale on every run. */
export async function seedSamples(c: PoolClient, products: SampleProduct[]) {
  for (const p of products) {
    await c.query("delete from apps where slug = $1", [p.app.slug]);
    const {
      rows: [app],
    } = await c.query<{ id: string }>(
      `insert into apps (name, slug, platform, category_id, brand_color, icon_path, version, captured_at, website_url)
       values ($1,$2,$3,(select id from categories where name = $4),$5,$6,$7,$8,$9) returning id`,
      [
        p.app.name,
        p.app.slug,
        p.app.platform,
        p.app.category,
        p.app.brand_color,
        p.app.icon_path,
        p.app.version,
        p.app.captured_at,
        p.app.website_url ?? null,
      ],
    );
    let flowId: string | null = null;
    if (p.flow) {
      const { rows } = await c.query<{ id: string }>(
        "insert into flows (app_id, name, description) values ($1,$2,$3) returning id",
        [app!.id, p.flow.name, p.flow.description],
      );
      flowId = rows[0]!.id;
    }
    for (const s of p.screens) {
      const {
        rows: [screen],
      } = await c.query<{ id: string }>(
        `insert into screens (app_id, kind, flow_id, flow_position, flow_caption, image_path, full_image_path, width, height,
           dominant_colors, ocr_text, ai_description, save_count, status, captured_at, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'published',$14, timestamptz '2026-10-30 12:00Z' - make_interval(mins => $15))
         returning id`,
        [
          app!.id,
          s.kind,
          s.flow_position ? flowId : null,
          s.flow_position ?? null,
          s.flow_caption ?? null,
          s.image_path,
          s.full_image_path,
          s.width,
          s.height,
          s.dominant_colors,
          s.ocr_text,
          s.ai_description,
          s.save_count,
          s.captured_at,
          s.created_offset_minutes,
        ],
      );
      for (const slug of s.patterns)
        await c.query("insert into screen_patterns select $1, id from patterns where slug = $2", [
          screen!.id,
          slug,
        ]);
      for (const slug of s.styles)
        await c.query("insert into screen_styles select $1, id from styles where slug = $2", [
          screen!.id,
          slug,
        ]);
      for (const slug of s.elements)
        await c.query(
          "insert into screen_ui_elements select $1, id from ui_elements where slug = $2",
          [screen!.id, slug],
        );
      await c.query("select refresh_screen_tsv($1)", [screen!.id]);
    }
  }
}

export async function seed(pool: Pool) {
  await migrate(pool);
  const products = JSON.parse(
    fs.readFileSync(path.join(__dirname, "sample-data.json"), "utf8"),
  ) as SampleProduct[];
  const c = await pool.connect();
  try {
    await c.query("begin");
    await seedTaxonomy(c);
    await seedSamples(c, products);
    await c.query("commit");
  } catch (err) {
    await c.query("rollback");
    throw err;
  } finally {
    c.release();
  }
  return products.length;
}

if (require.main === module) {
  process.loadEnvFile?.(".env");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  seed(pool)
    .then((n) => console.log(`seeded taxonomy and ${n} sample products`))
    .finally(() => pool.end());
}
