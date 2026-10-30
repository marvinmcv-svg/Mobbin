import { NextResponse, type NextRequest } from "next/server";
import { PAGE_SIZE } from "@/lib/config";
import { db } from "@/lib/db";
import { listScreens } from "@/lib/data/screens";
import { parseFilters } from "@/lib/data/types";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const offset = Math.max(0, Math.min(10_000, Number(params.offset) || 0));
  const page = await listScreens(db(), parseFilters(params), offset, PAGE_SIZE);
  return NextResponse.json(page, { headers: { "cache-control": "private, max-age=30" } });
}
