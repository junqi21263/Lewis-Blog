"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { creatorConfig } from "@/data/creator";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SaveState>("idle");

  async function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }

    setState("saving");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error("Subscription failed.");
      }
      setEmail("");
      setState("saved");
    } catch {
      if (creatorConfig.newsletter.actionUrl) {
        const url = new URL(creatorConfig.newsletter.actionUrl);
        url.searchParams.set("email", email);
        window.open(url.toString(), "_blank", "noopener,noreferrer");
        setState("saved");
        return;
      }
      setState("error");
    }
  }

  return (
    <form className="w-full max-w-md border-t border-outline-variant/10 pt-6" onSubmit={(event) => void subscribe(event)}>
      <label className="label-mono mb-4 block" htmlFor="newsletter-email">
        Newsletter
      </label>
      <div className="flex items-center border-b border-outline-variant/30 pb-3">
        <input
          id="newsletter-email"
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-body-md text-on-background outline-none placeholder:text-on-surface-variant/50 focus:ring-0"
          placeholder="email@example.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button
          aria-label="Subscribe"
          className="grid size-9 place-items-center rounded-full text-on-surface-variant transition hover:text-on-background"
          disabled={state === "saving"}
          type="submit"
        >
          <ArrowRight aria-hidden size={17} />
        </button>
      </div>
      <p className="mt-3 text-sm text-on-surface-variant">
        {state === "saved"
          ? "You are on the quiet list."
          : state === "error"
            ? "The form could not subscribe right now."
            : "Occasional notes on photography, field work, and essays."}
      </p>
    </form>
  );
}
