"use client";

import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Tag } from "@/data/cms";
import { cn } from "@/lib/utils";

type TagMultiSelectProps = {
  label: string;
  placeholder: string;
  tags: Tag[];
  selectedIds: string[];
  onChange: (tagIds: string[]) => void;
  onCreateTag: (name: string) => Promise<Tag>;
};

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export default function TagMultiSelect({ label, placeholder, tags, selectedIds, onChange, onCreateTag }: TagMultiSelectProps) {
  const [query, setQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedTags = useMemo(
    () => selectedIds.map((id) => tags.find((tag) => tag.id === id) ?? tags.find((tag) => tag.slug === id)).filter((tag): tag is Tag => Boolean(tag)),
    [selectedIds, tags],
  );
  const normalizedQuery = normalizeSearch(query);
  const filteredTags = useMemo(() => {
    const pool = tags.filter((tag) => !selectedSet.has(tag.id));
    if (!normalizedQuery) {
      return pool.slice(0, 8);
    }
    return pool
      .filter((tag) => `${tag.name} ${tag.slug}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [normalizedQuery, selectedSet, tags]);
  const hasExactMatch = tags.some((tag) => tag.name.toLowerCase() === normalizedQuery || tag.slug.toLowerCase() === normalizedQuery);
  const canCreate = normalizedQuery.length > 0 && !hasExactMatch;

  function toggleTag(tag: Tag) {
    if (selectedSet.has(tag.id)) {
      onChange(selectedIds.filter((id) => id !== tag.id));
      return;
    }
    onChange([...selectedIds, tag.id]);
    setQuery("");
  }

  async function createTag() {
    const name = query.trim();
    if (!name || isCreating) {
      return;
    }
    setIsCreating(true);
    try {
      const tag = await onCreateTag(name);
      onChange([...selectedIds.filter((id) => id !== tag.id), tag.id]);
      setQuery("");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div>
      <span className="label-mono mb-2 block">{label}</span>
      <div className="border border-outline-variant/20 bg-background/40 p-3">
        {selectedTags.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <button
                key={tag.id}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-outline-variant/30 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant transition hover:border-secondary hover:text-on-surface"
                type="button"
                onClick={() => onChange(selectedIds.filter((id) => id !== tag.id))}
              >
                {tag.name}
                <X aria-hidden size={12} />
              </button>
            ))}
          </div>
        ) : null}
        <input
          className="w-full border-0 bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:ring-0"
          placeholder={placeholder}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (filteredTags[0]) {
                toggleTag(filteredTags[0]);
              } else if (canCreate) {
                void createTag();
              }
            }
          }}
        />
      </div>
      {filteredTags.length > 0 || canCreate ? (
        <div className="mt-2 grid gap-2">
          {filteredTags.map((tag) => (
            <button
              key={tag.id}
              className="flex min-h-11 items-center justify-between border border-outline-variant/15 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-on-surface-variant transition hover:border-outline-variant/40 hover:text-on-surface"
              type="button"
              onClick={() => toggleTag(tag)}
            >
              <span>{tag.name}</span>
              <span>{tag.postCount ?? 0}</span>
            </button>
          ))}
          {canCreate ? (
            <button
              className={cn(
                "flex min-h-11 items-center gap-2 border border-outline-variant/15 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-on-surface-variant transition hover:border-outline-variant/40 hover:text-on-surface",
                isCreating ? "opacity-60" : "",
              )}
              disabled={isCreating}
              type="button"
              onClick={() => void createTag()}
            >
              <Plus aria-hidden size={13} />
              {isCreating ? "Creating..." : `Create "${query.trim()}"`}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
