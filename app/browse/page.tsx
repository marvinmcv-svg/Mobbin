import type { Metadata } from "next";
import { BrowseShell } from "@/components/BrowseShell";
import { PAGE_SIZE } from "@/lib/config";
import { db } from "@/lib/db";
import { getFacets, listScreens } from "@/lib/data/screens";
import { parseFilters, PLATFORM_LABELS } from "@/lib/data/types";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const f = parseFilters(await searchParams);
  return {
    title: f.q ? `“${f.q}” in ${PLATFORM_LABELS[f.platform]}` : PLATFORM_LABELS[f.platform],
  };
}

export default async function BrowsePage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  const [facets, initial] = await Promise.all([
    getFacets(db(), filters.platform),
    listScreens(db(), filters, 0, PAGE_SIZE),
  ]);
  return <BrowseShell filters={filters} facets={facets} initial={initial} />;
}
