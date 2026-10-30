"use client";

import { useState } from "react";

export function ReportForm({ screenId }: { screenId: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | { error: string }>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    const res = await fetch("/api/takedown", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ screenId, reason: form.get("reason"), contact: form.get("contact") }),
    }).catch(() => null);
    if (res?.ok) setState("done");
    else
      setState({
        error:
          (await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.",
      });
  }

  if (state === "done")
    return (
      <p className="mt-8 rounded-tile border border-rule bg-paper-raised p-4">
        Thanks — your request is in the queue.
      </p>
    );

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm font-medium">What’s wrong?</span>
        <textarea
          name="reason"
          required
          minLength={3}
          rows={5}
          className="mt-1 w-full rounded-tile border border-rule bg-paper-raised p-3 text-sm focus:border-ink/40 focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Your email</span>
        <input
          name="contact"
          type="email"
          required
          className="mt-1 w-full rounded-tile border border-rule bg-paper-raised p-3 text-sm focus:border-ink/40 focus:outline-none"
        />
      </label>
      {typeof state === "object" && (
        <p role="alert" className="text-sm text-accent">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="rounded-tile bg-ink px-4 py-2 text-paper hover:bg-accent disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
