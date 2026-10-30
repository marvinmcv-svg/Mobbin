import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createTakedown, getScreen } from "@/lib/data/screens";

const body = z.object({
  screenId: z.string().uuid(),
  reason: z.string().trim().min(3).max(2000),
  contact: z.string().trim().email().max(200),
});

export async function POST(req: NextRequest) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Please add a reason and a valid email." }, { status: 400 });
  if (!(await getScreen(db(), parsed.data.screenId)))
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  const id = await createTakedown(db(), parsed.data);
  return NextResponse.json({ id }, { status: 201 });
}
