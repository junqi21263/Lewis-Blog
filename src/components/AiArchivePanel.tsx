"use client";

import { Send } from "lucide-react";
import { useState } from "react";

type AiSource = {
  title: string;
  href: string;
  type: string;
};

export default function AiArchivePanel() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<AiSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const payload = (await response.json()) as { data?: { answer: string; sources: AiSource[] }; error?: { message: string } };
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "AI request failed.");
      }
      setAnswer(payload.data?.answer ?? "");
      setSources(payload.data?.sources ?? []);
    } catch (requestError) {
      setAnswer("");
      setSources([]);
      setError(requestError instanceof Error ? requestError.message : "AI request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mb-20 border-y border-outline-variant/10 py-10">
      <div className="grid gap-gutter md:grid-cols-[0.8fr_1fr]">
        <div>
          <div className="label-mono mb-5">AI Archive</div>
          <h2 className="font-serif text-headline-lg text-on-background">Ask the published archive.</h2>
        </div>
        <div>
          <form className="flex items-center border-b border-outline-variant/30 pb-4" onSubmit={(event) => void ask(event)}>
            <input
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-body-lg text-on-background outline-none placeholder:text-on-surface-variant/50 focus:ring-0"
              placeholder="What has the author written about photography?"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
            <button
              aria-label="Ask archive"
              className="grid size-10 place-items-center rounded-full text-on-surface-variant transition hover:text-on-background"
              disabled={isLoading}
              type="submit"
            >
              <Send aria-hidden size={16} />
            </button>
          </form>
          {answer || error ? (
            <div className="mt-8">
              <p className="text-body-lg leading-8 text-on-background">{error || answer}</p>
              {sources.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {sources.map((source) => (
                    <a key={`${source.type}-${source.href}-${source.title}`} className="label-mono border border-outline-variant/20 px-3 py-2 hover:text-secondary" href={source.href}>
                      {source.title}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-body-md text-on-surface-variant">Searches published posts, photographs, and films. Private drafts are excluded.</p>
          )}
        </div>
      </div>
    </section>
  );
}
