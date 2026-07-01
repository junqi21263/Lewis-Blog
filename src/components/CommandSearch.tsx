"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";
import { cn } from "@/lib/utils";

type CommandSearchProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

type SearchResult = {
  type: "Article" | "Pagefind";
  id: string;
  title: string;
  description: string;
  href: string;
  category?: string | null;
  tags?: string[];
  source: "Pagefind" | "D1";
};

type PagefindModule = {
  search: (
    query: string,
  ) => Promise<{
    results: Array<{
      id: string;
      data: () => Promise<{
        url: string;
        excerpt: string;
        meta: { title?: string };
      }>;
    }>;
  }>;
};

async function loadPagefind() {
  try {
    const pagefindPath = "/pagefind/pagefind.js";
    return (await import(/* webpackIgnore: true */ pagefindPath)) as PagefindModule;
  } catch {
    return null;
  }
}

async function searchPagefind(query: string, localePrefix: string): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  const pagefind = await loadPagefind();
  if (!pagefind) {
    return [];
  }

  const search = await pagefind.search(query);
  const results = await Promise.all(
    search.results.slice(0, 8).map(async (result): Promise<SearchResult | null> => {
      const data = await result.data();
      if (!data.url.startsWith(`/${localePrefix}/`)) {
        return null;
      }
      return {
        type: "Pagefind" as const,
        id: result.id,
        title: data.meta.title || "Untitled",
        description: data.excerpt.replace(/<[^>]*>/g, ""),
        href: data.url,
        source: "Pagefind" as const,
      };
    }),
  );

  return results.filter((result): result is SearchResult => result !== null);
}

async function searchD1(query: string, category: string, tag: string, locale: string): Promise<SearchResult[]> {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (category) params.set("category", category);
  if (tag) params.set("tag", tag);
  params.set("lang", locale);

  const response = await fetch(`/api/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Search request failed.");
  }
  const payload = (await response.json()) as { data: Array<Omit<SearchResult, "source">> };
  return payload.data.map((result) => ({ ...result, source: "D1" as const }));
}

function dedupeResults(results: SearchResult[]) {
  const byHref = new Map<string, SearchResult>();
  for (const result of results) {
    if (!byHref.has(result.href)) {
      byHref.set(result.href, result);
    }
  }
  return [...byHref.values()].slice(0, 10);
}

export default function CommandSearch({ open, onOpen, onClose }: CommandSearchProps) {
  const { locale, dictionary } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const categories = useMemo(
    () => [...new Set(results.map((result) => result.category).filter((value): value is string => Boolean(value)))].slice(0, 6),
    [results],
  );
  const tags = useMemo(() => [...new Set(results.flatMap((result) => result.tags ?? []))].slice(0, 8), [results]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpen();
      }
      if (event.key === "Escape" && open) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onOpen, open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");
      try {
        const shouldUsePagefind = !category && !tag;
        const [pagefindResults, d1Results] = await Promise.all([
          shouldUsePagefind ? searchPagefind(query, locale === "zh-CN" ? "zh" : locale === "zh-TW" ? "tw" : "en") : Promise.resolve([]),
          searchD1(query, category, tag, locale),
        ]);
        if (!cancelled) {
          setResults(dedupeResults([...pagefindResults, ...d1Results]));
          setActiveIndex(0);
        }
      } catch (requestError) {
        if (!cancelled) {
          setResults([]);
          setError(requestError instanceof Error ? requestError.message : "Search failed.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 140);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [category, locale, open, query, tag]);

  if (!open) {
    return null;
  }

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((value) => Math.min(value + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((value) => Math.max(value - 1, 0));
    }
  }

  return (
    <div aria-modal="true" className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-md" role="dialog">
      <div className="editorial-shell flex min-h-screen flex-col py-10 md:py-16">
        <div className="mb-12 flex items-center justify-between gap-8">
          <div>
            <p className="label-mono mb-3">Command Search</p>
            <h2 className="font-serif text-headline-lg text-on-background">{dictionary.common.searchSubtitle}</h2>
          </div>
          <button
            aria-label="Close search"
            className="grid size-11 place-items-center rounded-full border border-outline-variant/20 text-on-surface-variant transition hover:text-on-background"
            type="button"
            onClick={onClose}
          >
            <X aria-hidden size={20} />
          </button>
        </div>

        <label className="mb-8 flex items-center gap-4 border-b border-outline-variant/30 pb-5">
          <Search aria-hidden className="text-on-surface-variant" size={22} strokeWidth={1.5} />
          <input
            ref={inputRef}
            className="w-full border-0 bg-transparent p-0 font-serif text-headline-md text-on-background outline-none placeholder:text-on-surface-variant/50 focus:ring-0 md:text-headline-lg"
            placeholder={dictionary.common.searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleListKeyDown}
          />
          <kbd className="hidden border border-outline-variant/20 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant md:block">
            CMD K
          </kbd>
        </label>

        <div className="mb-8 flex flex-wrap gap-3">
          {[category, tag].some(Boolean) ? (
            <button className="label-mono border border-outline-variant/20 px-3 py-2 hover:text-secondary" type="button" onClick={() => { setCategory(""); setTag(""); }}>
              Clear filters
            </button>
          ) : null}
          {categories.map((item) => (
            <button
              key={item}
              className={cn("label-mono border border-outline-variant/20 px-3 py-2 hover:text-on-background", category === item && "border-secondary text-on-background")}
              type="button"
              onClick={() => setCategory(category === item ? "" : item)}
            >
              {item}
            </button>
          ))}
          {tags.map((item) => (
            <button
              key={item}
              className={cn("label-mono border border-outline-variant/20 px-3 py-2 hover:text-on-background", tag === item && "border-secondary text-on-background")}
              type="button"
              onClick={() => setTag(tag === item ? "" : item)}
            >
              #{item}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {results.map((result, index) => (
            <Link
              key={`${result.source}-${result.id}`}
            className={cn("group border-t border-outline-variant/10 py-6 transition hover:-translate-y-1", activeIndex === index && "border-secondary")}
              href={result.href.startsWith("/") ? result.href : withLocalePrefix(result.href, locale)}
              onClick={onClose}
            >
              <div className="label-mono mb-3">
                {result.source} - {result.category || result.type}
              </div>
              <h3 className="mb-3 font-serif text-headline-md text-on-background transition group-hover:text-secondary">
                {result.title}
              </h3>
              <p className="line-clamp-3 text-body-md text-on-surface-variant">{result.description}</p>
            </Link>
          ))}
        </div>

        {isLoading ? <div className="label-mono border-t border-outline-variant/10 py-10">{dictionary.common.searching}</div> : null}
        {!isLoading && results.length === 0 ? (
          <div className="border-t border-outline-variant/10 py-12">
            <h3 className="font-serif text-headline-md text-on-background">{dictionary.common.searchEmpty}</h3>
            <p className="mt-3 text-body-md text-on-surface-variant">{error || dictionary.common.searchHint}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
