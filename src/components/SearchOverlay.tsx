"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSearchResults } from "@/data/site";

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => getSearchResults(query), [query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div aria-modal="true" className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-md" role="dialog">
      <div className="editorial-shell flex min-h-screen flex-col py-10 md:py-16">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <p className="label-mono mb-3">Search Archive</p>
            <h2 className="font-serif text-headline-lg text-on-background">Find a note, frame, or film.</h2>
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

        <label className="mb-10 flex items-center gap-4 border-b border-outline-variant/30 pb-5">
          <Search aria-hidden className="text-on-surface-variant" size={22} strokeWidth={1.5} />
          <input
            ref={inputRef}
            className="w-full border-0 bg-transparent p-0 font-serif text-headline-md text-on-background outline-none placeholder:text-on-surface-variant/50 focus:ring-0 md:text-headline-lg"
            placeholder="Type to search..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          {results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              className="group border-t border-outline-variant/10 py-6 transition hover:-translate-y-1"
              href={result.href}
              onClick={onClose}
            >
              <div className="label-mono mb-3">
                {result.type} - {result.eyebrow}
              </div>
              <h3 className="mb-3 font-serif text-headline-md text-on-background transition group-hover:text-secondary">
                {result.title}
              </h3>
              <p className="text-body-md text-on-surface-variant">{result.description}</p>
            </Link>
          ))}
        </div>

        {results.length === 0 ? (
          <div className="border-t border-outline-variant/10 py-12">
            <h3 className="font-serif text-headline-md text-on-background">No matches.</h3>
            <p className="mt-3 text-body-md text-on-surface-variant">Try a category, place, tag, or title.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
