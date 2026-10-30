import type { Pool } from "pg";
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

/** Builds the shared WHERE clause for a filter set. Values are always bound, never interpolated. */
function where(f: Filters, params: unknown[]) {
  const bind = (v: unknown) => {
    params.push(v);
    return `$${params.length}`;
  };
  const clauses = ["s.status = 'published'", `a.platform = ${bind(f.platform)}`];
  if (f.pattern)
    clauses.push(`exists (select 1 from screen_patterns sp join patterns p on p.id = sp.pattern_id where sp.screen_id = s.id and p.slug = ${bind(f.pattern)})`);
  if (f.style)
    clauses.push(`exists (select 1 from screen_styles ss join styles st on st.id = ss.style_id where ss.screen_id = s.id and st.slug = ${bind(f.style)})`);
  if (f.element)
    clauses.push(`exists (select 1 from screen_ui_elements se join ui_elements e on e.id = se.element_id where se.screen_id = s.id and e.slug = ${bind(f.element)})`);
  if (f.category) clauses.push(`c.slug = ${bind(f.category)}`);
  if (f.app) clauses.push(`a.slug = ${bind(f.app)}`);
  let rank = "0";
  if (f.q) {
    const q = bind(f.q);
    // Also prefix-match every word so results appear while the user is still typing.
    const words = f.q.match(/[\p{L}\p{N}]+/gu) ?? [];
    const prefix = words.length
      ? ` or s.search_tsv @@ to_tsquery('english', ${bind(words.map((w) => `${w}:*`).join(" & "))})`
      : "";
    clauses.push(`(s.search_tsv @@ websearch_to_tsquery('english', ${q})${prefix})`);
    rank = `ts_rank(s.search_tsv, websearch_to_tsquery('english', ${q}))`;
  }
  return { sql: clauses.join(" and "), rank };
}

const ORDER: Record<ReturnType<typeof effectiveSort>, string> = {
  latest: "s.created_at desc, s.id",
  popular: "s.save_count desc, s.created_at desc, s.id",
  relevance: "rank desc, s.created_at desc, s.id",
};

const CARD_COLUMNS = `
  s.id, s.kind, s.image_path, s.width, s.height, s.dominant_colors[1] as color, s.created_at, s.save_count,
  a.name as app_name, a.slug as app_slug, a.platform, a.icon_path,
  coalesce((
    select json_agg(t order by t.ord, t.name) from (
      select p.name, p.slug, 'pattern' as kind, 0 as ord from screen_patterns sp join patterns p on p.id = sp.pattern_id where sp.screen_id = s.id
      union all
      select c.name, c.slug, 'category', 1 where c.id is not null
      union all
      select st.name, st.slug, 'style', 2 from screen_styles ss join styles st on st.id = ss.style_id where ss.screen_id = s.id
      union all
      select e.name, e.slug, 'element', 3 from screen_ui_elements se join ui_elements e on e.id = se.element_id where se.screen_id = s.id
    ) t), '[]') as tags`;

const FROM = "from screens s join apps a on a.id = s.app_id left join categories c on c.id = a.category_id";

interface CardRow {
  id: string;
  kind: "screen" | "section";
  image_path: string;
  width: number;
  height: number;
  color: string | null;
  created_at: Date;
  save_count: number;
  app_name: string;
  app_slug: string;
  platform: Platform;
  icon_path: string | null;
  tags: Tag[];
}

function toCard(r: CardRow): ScreenCard {
  return {
    id: r.id,
    kind: r.kind,
    imagePath: r.image_path,
    width: r.width,
    height: r.height,
    color: r.color,
    createdAt: r.created_at.toISOString(),
    saveCount: r.save_count,
    app: { name: r.app_name, slug: r.app_slug, platform: r.platform, iconPath: r.icon_path },
    tags: r.tags,
  };
}

export async function listScreens(db: Pool, f: Filters, offset = 0, limit = 24): Promise<Page<ScreenCard>> {
  const params: unknown[] = [];
  const w = where(f, params);
  const sort = effectiveSort(f);
  params.push(limit, offset);
  const { rows } = await db.query<CardRow & { rank: number; total: string }>(
    `select ${CARD_COLUMNS}, ${w.rank} as rank, count(*) over () as total
     ${FROM} where ${w.sql}
     order by ${ORDER[sort]} limit $${params.length - 1} offset $${params.length}`,
    params,
  );
  const total = rows[0] ? Number(rows[0].total) : 0;
  const next = offset + rows.length;
  return { items: rows.map(toCard), total, nextOffset: next < total ? next : null };
}

/** The items immediately before and after position `index` in the filtered result set. */
export async function getNeighbors(db: Pool, f: Filters, index: number) {
  const start = Math.max(0, index - 1);
  const page = await listScreens(db, f, start, index === 0 ? 2 : 3);
  const at = (i: number) => page.items[i - start] ?? null;
  return { prev: index > 0 ? at(index - 1) : null, next: at(index + 1), total: page.total };
}

export async function getScreen(db: Pool, id: string): Promise<ScreenDetail | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const { rows } = await db.query<
    CardRow & { full_image_path: string | null; ai_description: string | null; captured_at: Date | null; version: string | null; flow_id: string | null; flow_name: string | null; flow_position: number | null }
  >(
    `select ${CARD_COLUMNS}, s.full_image_path, s.ai_description, s.captured_at, a.version, s.flow_id, f.name as flow_name, s.flow_position
     ${FROM} left join flows f on f.id = s.flow_id
     where s.id = $1 and s.status = 'published'`,
    [id],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    ...toCard(r),
    fullImagePath: r.full_image_path,
    description: r.ai_description,
    capturedAt: r.captured_at ? r.captured_at.toISOString().slice(0, 10) : null,
    appVersion: r.version,
    flow: r.flow_id && r.flow_name ? { id: r.flow_id, name: r.flow_name, position: r.flow_position ?? 0 } : null,
  };
}

/**
 * Screens sharing the most tags with the given one, same platform, other apps first.
 * Phase D replaces this with vector neighbours once embeddings exist.
 */
export async function getRelated(db: Pool, id: string, limit = 6): Promise<ScreenCard[]> {
  const { rows } = await db.query<CardRow>(
    `with me as (select s.id, s.app_id, a.platform from screens s join apps a on a.id = s.app_id where s.id = $1),
     tags as (
       select pattern_id as tag from screen_patterns where screen_id = $1
       union all select style_id from screen_styles where screen_id = $1
     ),
     scored as (
       select o.screen_id, count(*) as overlap from (
         select screen_id, pattern_id as tag from screen_patterns
         union all select screen_id, style_id from screen_styles
       ) o join tags t on t.tag = o.tag where o.screen_id <> $1 group by o.screen_id
     )
     select ${CARD_COLUMNS} ${FROM} join scored sc on sc.screen_id = s.id, me
     where a.platform = me.platform and s.status = 'published'
     order by sc.overlap desc, (s.app_id = me.app_id), s.created_at desc
     limit $2`,
    [id, limit],
  );
  return rows.map(toCard);
}

export async function getFacets(db: Pool, platform: Platform): Promise<Facets> {
  const scope = platform === "site" ? "site" : "app";
  const q = (sql: string) => db.query<FacetOption & { count: string }>(sql, [platform]).then((r) => r.rows.map((x) => ({ ...x, count: Number(x.count) })));
  const [pattern, style, element, category] = await Promise.all([
    q(`select p.name, p.slug, count(s.id) from patterns p
       left join screen_patterns sp on sp.pattern_id = p.id
       left join screens s on s.id = sp.screen_id and s.status = 'published' and exists (select 1 from apps a where a.id = s.app_id and a.platform = $1)
       where p.scope = '${scope}' group by p.id order by count(s.id) desc, p.name`),
    q(`select st.name, st.slug, count(s.id) from styles st
       join screen_styles ss on ss.style_id = st.id
       join screens s on s.id = ss.screen_id and s.status = 'published' join apps a on a.id = s.app_id and a.platform = $1
       group by st.id order by count(s.id) desc, st.name`),
    q(`select e.name, e.slug, count(s.id) from ui_elements e
       join screen_ui_elements se on se.element_id = e.id
       join screens s on s.id = se.screen_id and s.status = 'published' join apps a on a.id = s.app_id and a.platform = $1
       group by e.id order by count(s.id) desc, e.name`),
    q(`select c.name, c.slug, count(s.id) from categories c
       join apps a on a.category_id = c.id and a.platform = $1
       join screens s on s.app_id = a.id and s.status = 'published'
       group by c.id order by count(s.id) desc, c.name`),
  ]);
  return { pattern, style, element, category };
}

export interface AppDetail {
  name: string;
  slug: string;
  platform: Platform;
  iconPath: string | null;
  category: string | null;
  version: string | null;
  capturedAt: string | null;
  websiteUrl: string | null;
  flows: { id: string; name: string; steps: number }[];
}

export async function getApp(db: Pool, slug: string): Promise<AppDetail | null> {
  const { rows } = await db.query(
    `select a.name, a.slug, a.platform, a.icon_path, c.name as category, a.version, a.captured_at, a.website_url,
       coalesce((select json_agg(json_build_object('id', f.id, 'name', f.name, 'steps', (select count(*) from screens x where x.flow_id = f.id)) order by f.created_at)
                 from flows f where f.app_id = a.id), '[]') as flows
     from apps a left join categories c on c.id = a.category_id where a.slug = $1`,
    [slug],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    name: r.name,
    slug: r.slug,
    platform: r.platform,
    iconPath: r.icon_path,
    category: r.category,
    version: r.version,
    capturedAt: r.captured_at ? (r.captured_at as Date).toISOString().slice(0, 10) : null,
    websiteUrl: r.website_url,
    flows: r.flows,
  };
}

export interface FlowDetail {
  id: string;
  name: string;
  description: string | null;
  app: { name: string; slug: string; platform: Platform; iconPath: string | null };
  steps: { id: string; imagePath: string; width: number; height: number; caption: string | null; position: number }[];
}

export async function getFlow(db: Pool, id: string): Promise<FlowDetail | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const { rows } = await db.query(
    `select f.id, f.name, f.description, a.name as app_name, a.slug as app_slug, a.platform, a.icon_path,
       coalesce((select json_agg(json_build_object('id', s.id, 'imagePath', s.image_path, 'width', s.width, 'height', s.height, 'caption', s.flow_caption, 'position', s.flow_position) order by s.flow_position)
                 from screens s where s.flow_id = f.id and s.status = 'published'), '[]') as steps
     from flows f join apps a on a.id = f.app_id where f.id = $1`,
    [id],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    app: { name: r.app_name, slug: r.app_slug, platform: r.platform, iconPath: r.icon_path },
    steps: r.steps,
  };
}

export async function getScreensByIds(db: Pool, ids: string[]): Promise<ScreenCard[]> {
  const valid = ids.filter((id) => /^[0-9a-f-]{36}$/.test(id)).slice(0, 200);
  if (!valid.length) return [];
  const { rows } = await db.query<CardRow>(`select ${CARD_COLUMNS} ${FROM} where s.id = any($1::uuid[]) and s.status = 'published'`, [valid]);
  const byId = new Map(rows.map((r) => [r.id, toCard(r)]));
  return valid.map((id) => byId.get(id)).filter((x): x is ScreenCard => !!x);
}

export async function createTakedown(db: Pool, input: { screenId: string; reason: string; contact: string }) {
  const { rows } = await db.query<{ id: string }>(
    "insert into takedown_requests (screen_id, reason, contact) values ($1, $2, $3) returning id",
    [input.screenId, input.reason, input.contact],
  );
  return rows[0]!.id;
}
