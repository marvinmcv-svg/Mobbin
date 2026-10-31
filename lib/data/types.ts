import { z } from "zod";

export const PLATFORMS = ["site", "web", "ios", "android"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  site: "Sites",
  web: "Web apps",
  ios: "iOS",
  android: "Android",
};

export const SORTS = ["latest", "popular", "relevance"] as const;
export type Sort = (typeof SORTS)[number];

const optionalSlug = z
  .string()
  .regex(/^[a-z0-9-]+$/)
  .optional()
  .catch(undefined);

/** Everything the browse grid can filter by. Parsed straight from URL search params. */
export const filtersSchema = z.object({
  platform: z.enum(PLATFORMS).catch("site"),
  pattern: optionalSlug,
  style: optionalSlug,
  element: optionalSlug,
  category: optionalSlug,
  app: optionalSlug,
  q: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => v || undefined)
    .catch(undefined),
  sort: z.enum(SORTS).optional().catch(undefined),
  /** "video": only items with a looping clip. */
  has: z.enum(["video"]).optional().catch(undefined),
});
export type Filters = z.infer<typeof filtersSchema>;

export function parseFilters(params: Record<string, string | string[] | undefined>): Filters {
  const flat = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  return filtersSchema.parse(flat);
}

/** Effective sort: relevance only makes sense with a query, latest is the default. */
export function effectiveSort(f: Filters): Sort {
  if (f.sort === "relevance" && !f.q) return "latest";
  return f.sort ?? (f.q ? "relevance" : "latest");
}

export function filtersToQuery(f: Partial<Filters>, extra: Record<string, string | number> = {}) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...f, ...extra }))
    if (v !== undefined && v !== "") sp.set(k, String(v));
  return sp.toString();
}

export interface Tag {
  name: string;
  slug: string;
  kind: "pattern" | "style" | "element" | "category";
}

export interface ScreenCard {
  id: string;
  kind: "screen" | "section";
  imagePath: string;
  width: number;
  height: number;
  color: string | null;
  createdAt: string;
  saveCount: number;
  /** Muted looping clip; the image doubles as its poster. */
  video: string | null;
  app: { name: string; slug: string; platform: Platform; iconPath: string | null };
  tags: Tag[];
}

export interface ScreenDetail extends ScreenCard {
  fullImagePath: string | null;
  description: string | null;
  capturedAt: string | null;
  appVersion: string | null;
  flow: { id: string; name: string; position: number } | null;
}

export interface Page<T> {
  items: T[];
  total: number;
  nextOffset: number | null;
}

export interface FacetOption {
  name: string;
  slug: string;
  count: number;
}

export interface Facets {
  pattern: FacetOption[];
  style: FacetOption[];
  element: FacetOption[];
  category: FacetOption[];
}
