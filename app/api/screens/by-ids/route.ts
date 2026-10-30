import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { repo } from "@/lib/repo";

const body = z.object({ ids: z.array(z.string()).max(200) });

export async function POST(req: NextRequest) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Expected { ids: string[] }" }, { status: 400 });
  return NextResponse.json({ items: await repo.getScreensByIds(parsed.data.ids) });
}
