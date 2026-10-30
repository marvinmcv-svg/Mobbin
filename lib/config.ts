export const LIBRARY_NAME = process.env.NEXT_PUBLIC_LIBRARY_NAME ?? "Specimen";

/** Page size for the browse grid and its infinite scroll. */
export const PAGE_SIZE = 24;

/**
 * Access tiers are configuration, not code paths (Phase F wires these to auth).
 * `previewLimit` is how many results an anonymous visitor can page through.
 */
export const ACCESS_LIMITS = {
  anonymous: { previewLimit: Number.POSITIVE_INFINITY, canSave: true, canDownload: false },
  member: { previewLimit: Number.POSITIVE_INFINITY, canSave: true, canDownload: true },
  admin: { previewLimit: Number.POSITIVE_INFINITY, canSave: true, canDownload: true },
} as const;
