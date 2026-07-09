"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { creatorConfig } from "@/data/creator";
import { useI18n } from "@/i18n/useI18n";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function NewsletterSignup() {
  const { locale } = useI18n();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SaveState>("idle");
  const copy =
    locale === "zh-CN"
      ? {
          title: "订阅通讯",
          placeholder: "name@example.com",
          aria: "订阅通讯",
          idle: "偶尔发送关于摄影、田野工作与写作的安静笔记。",
          saved: "你已经加入安静名单。",
          error: "当前无法完成订阅。",
        }
      : locale === "zh-TW"
        ? {
            title: "訂閱通訊",
            placeholder: "name@example.com",
            aria: "訂閱通訊",
            idle: "偶爾寄送關於攝影、田野工作與寫作的安靜筆記。",
            saved: "你已加入安靜名單。",
            error: "目前無法完成訂閱。",
          }
        : {
            title: "Newsletter",
            placeholder: "email@example.com",
            aria: "Subscribe",
            idle: "Occasional notes on photography, field work, and essays.",
            saved: "You are on the quiet list.",
            error: "The form could not subscribe right now.",
          };

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
        {copy.title}
      </label>
      <div className="flex items-center border-b border-outline-variant/30 pb-3">
        <input
          id="newsletter-email"
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-body-md text-on-background outline-none placeholder:text-on-surface-variant/50 focus:ring-0"
          placeholder={copy.placeholder}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button
          aria-label={copy.aria}
          className="grid size-9 place-items-center rounded-full text-on-surface-variant transition hover:text-on-background"
          disabled={state === "saving"}
          type="submit"
        >
          <ArrowRight aria-hidden size={17} />
        </button>
      </div>
      <p className="mt-3 text-sm text-on-surface-variant">
        {state === "saved"
          ? copy.saved
          : state === "error"
            ? copy.error
            : copy.idle}
      </p>
    </form>
  );
}
