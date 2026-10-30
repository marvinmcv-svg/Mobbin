import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportForm } from "@/components/ReportForm";
import { repo } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Report an item" };

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const screen = await repo.getScreen((await params).id);
  if (!screen) notFound();
  return (
    <div className="mx-auto max-w-xl px-4 pt-12">
      <Link
        href={`/screen/${screen.id}`}
        className="font-mono text-xs text-ink-soft hover:text-ink"
      >
        ← Back to item
      </Link>
      <h1 className="mt-3 font-display text-4xl">Report or remove</h1>
      <p className="mt-3 text-ink-soft">
        Own <strong>{screen.app.name}</strong> or think this capture shouldn’t be here? Tell us why.
        Every request is reviewed by a person and you’ll hear back by email.
      </p>
      <ReportForm screenId={screen.id} />
    </div>
  );
}
