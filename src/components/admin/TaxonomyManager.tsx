"use client";

import { useMemo, useState } from "react";
import AdminButton from "@/components/admin/AdminButton";
import AdminCard from "@/components/admin/AdminCard";
import AdminInput from "@/components/admin/AdminInput";
import type { Category, Tag } from "@/data/cms";
import { useCmsData } from "@/hooks/useCmsData";
import { slugifyTitle } from "@/lib/editor";

type TaxonomyManagerProps = {
  type: "categories" | "tags";
};

type Draft = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
};

function emptyDraft(type: TaxonomyManagerProps["type"]): Draft {
  return {
    id: "",
    name: "",
    slug: "",
    description: "",
    icon: type === "categories" ? "Circle" : "",
    color: type === "categories" ? "#e5e5e5" : "",
    sortOrder: 0,
  };
}

export default function TaxonomyManager({ type }: TaxonomyManagerProps) {
  const { data, addCategory, updateCategory, deleteCategory, addTag, updateTag, deleteTag, error } = useCmsData();
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(type));
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const isCategories = type === "categories";
  const items = isCategories ? data.categories : data.tags;
  const filteredItems = useMemo(
    () => items.filter((item) => `${item.name} ${item.slug}`.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  function editItem(item: Category | Tag) {
    setDraft({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: "description" in item ? item.description ?? "" : "",
      icon: "icon" in item ? item.icon ?? "" : "",
      color: "color" in item ? item.color ?? "" : "",
      sortOrder: "sortOrder" in item ? item.sortOrder ?? 0 : 0,
    });
  }

  async function saveDraft() {
    const slug = draft.slug || slugifyTitle(draft.name);
    const id = draft.id || slug;
    setStatus("Saving");
    try {
      if (isCategories) {
        const category: Category = {
          id,
          name: draft.name,
          slug,
          description: draft.description,
          icon: draft.icon,
          color: draft.color,
          sortOrder: draft.sortOrder,
        };
        if (draft.id) await updateCategory(category);
        else await addCategory(category);
      } else {
        const tag: Tag = { id, name: draft.name, slug };
        if (draft.id) await updateTag(tag);
        else await addTag(tag);
      }
      setDraft(emptyDraft(type));
      setStatus("Saved");
    } catch (requestError) {
      setStatus(requestError instanceof Error ? requestError.message : "Save failed");
    }
  }

  async function removeItem(item: Category | Tag) {
    setStatus("Deleting");
    try {
      if (isCategories) await deleteCategory(item.id);
      else await deleteTag(item.id);
      setStatus("Saved");
    } catch (requestError) {
      setStatus(requestError instanceof Error ? requestError.message : "Delete failed");
    }
  }

  return (
    <main className="px-margin-mobile pb-section-gap md:px-margin-desktop">
      <header className="mb-12">
        <h1 className="font-serif text-display-lg text-on-surface">{isCategories ? "Categories" : "Tags"}</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
          {isCategories ? "Manage article structure, ordering, icons, and color cues." : "Manage searchable article tags and review usage counts."}
        </p>
      </header>
      {error || status ? (
        <div className="mb-6 border border-outline-variant/20 bg-surface-container-low px-4 py-3 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
          {error || status}
        </div>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <AdminCard as="section" className="bg-surface-container-low p-6">
          <div className="space-y-6">
            <AdminInput label="Name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value, slug: current.slug || slugifyTitle(event.target.value) }))} />
            <AdminInput label="Slug" value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: slugifyTitle(event.target.value) }))} />
            {isCategories ? (
              <>
                <AdminInput label="Description" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
                <AdminInput label="Icon" value={draft.icon} onChange={(event) => setDraft((current) => ({ ...current, icon: event.target.value }))} />
                <AdminInput label="Color" type="text" value={draft.color} onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))} />
                <AdminInput label="Sort Order" type="number" value={String(draft.sortOrder)} onChange={(event) => setDraft((current) => ({ ...current, sortOrder: Number(event.target.value) }))} />
              </>
            ) : null}
            <div className="flex gap-3">
              <AdminButton variant="primary" onClick={() => void saveDraft()}>
                {draft.id ? "Save Changes" : "Create"}
              </AdminButton>
              <AdminButton variant="ghost" onClick={() => setDraft(emptyDraft(type))}>
                Reset
              </AdminButton>
            </div>
          </div>
        </AdminCard>
        <section>
          <AdminInput label="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="mt-6 divide-y divide-outline-variant/10 border-y border-outline-variant/10">
            {filteredItems.map((item) => {
              const meta = isCategories
                ? `${(item as Category).icon ?? "Circle"} · order ${(item as Category).sortOrder ?? 0}`
                : `${(item as Tag).postCount ?? 0} posts`;

              return (
              <div key={item.id} className="grid gap-4 py-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    {"color" in item && item.color ? <span className="size-4 rounded-full border border-outline-variant/20" style={{ background: item.color }} /> : null}
                    <h2 className="font-serif text-headline-md text-on-surface">{item.name}</h2>
                    <span className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">/{item.slug}</span>
                  </div>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{meta}</p>
                </div>
                <div className="flex gap-3">
                  <AdminButton variant="ghost" onClick={() => editItem(item)}>
                    Edit
                  </AdminButton>
                  <AdminButton variant="ghost" onClick={() => void removeItem(item)}>
                    Delete
                  </AdminButton>
                </div>
              </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
