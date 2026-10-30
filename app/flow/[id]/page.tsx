import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FlowPlayer } from "@/components/FlowPlayer";
import { db } from "@/lib/db";
import { getFlow } from "@/lib/data/screens";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ step?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await getFlow(db(), (await params).id);
  return { title: f ? `${f.app.name} · ${f.name}` : "Not found" };
}

export default async function FlowPage({ params, searchParams }: Props) {
  const [{ id }, { step }] = await Promise.all([params, searchParams]);
  const flow = await getFlow(db(), id);
  if (!flow || !flow.steps.length) notFound();
  const start = Math.max(
    0,
    flow.steps.findIndex((s) => String(s.position) === step),
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
      <p className="pt-8 font-mono text-xs text-ink-soft">
        <Link href={`/apps/${flow.app.slug}`} className="hover:text-ink">
          ← {flow.app.name}
        </Link>
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">{flow.name}</h1>
      {flow.description && <p className="mt-2 text-ink-soft">{flow.description}</p>}
      <FlowPlayer
        steps={flow.steps}
        start={start}
        phone={flow.app.platform === "ios" || flow.app.platform === "android"}
      />
    </div>
  );
}
