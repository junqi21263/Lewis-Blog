"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CodeBlockProps = {
  code: string;
  language?: string;
};

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <figure className="my-12 overflow-hidden border border-outline-variant/10 bg-surface-container-low">
      <div className="flex items-center justify-between border-b border-outline-variant/10 px-5 py-3">
        <figcaption className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
          {language || "Code"}
        </figcaption>
        <button
          className="inline-grid size-8 place-items-center rounded-full text-on-surface-variant transition hover:text-on-background"
          type="button"
          aria-label={copied ? "Code copied" : "Copy code"}
          onClick={copyCode}
        >
          {copied ? <Check aria-hidden size={15} /> : <Copy aria-hidden size={15} />}
        </button>
      </div>
      <pre className="overflow-x-auto p-6 font-mono text-sm leading-7 text-on-background">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
