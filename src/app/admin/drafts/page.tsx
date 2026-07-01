"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Shuffle } from "lucide-react";
import AdminButton from "@/components/admin/AdminButton";
import { useCmsData } from "@/hooks/useCmsData";
import { useAdminI18n } from "@/i18n/admin";

export default function AdminDraftsPage() {
  const { data } = useCmsData();
  const { dictionary } = useAdminI18n();
  const drafts = data.posts.filter((post) => post.status === "draft");

  return (
    <main className="px-margin-mobile pb-section-gap md:px-margin-desktop">
      <header className="mb-16 mt-8 max-w-4xl">
        <h1 className="mb-4 font-serif text-display-lg text-on-surface">{dictionary.drafts.title}</h1>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">{dictionary.drafts.description}</p>
      </header>

      <section className="mb-10 flex max-w-5xl items-center gap-4 rounded-full border border-outline-variant/20 bg-surface-container/50 px-4 py-2 md:hidden">
        <Search aria-hidden className="text-on-surface-variant" size={16} />
        <input className="w-full border-0 bg-transparent p-0 text-body-md text-on-surface focus:ring-0" placeholder={dictionary.drafts.searchPlaceholder} type="search" />
      </section>

      <section className="flex max-w-5xl flex-col border-t border-outline-variant/20">
        {drafts.map((draft) => (
          <div key={draft.id} className="group relative flex cursor-pointer flex-col justify-between border-b border-outline-variant/20 py-8 md:flex-row md:items-center">
            <Link className="relative z-10 flex-grow pr-8" href={`/admin/posts/edit?id=${encodeURIComponent(draft.id)}`}>
              <p className="mb-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">{draft.updatedAt}</p>
              <h2 className="font-serif text-headline-md text-on-surface transition group-hover:text-primary">{draft.title}</h2>
            </Link>
            <div className="relative z-10 mt-4 flex items-center gap-6 md:mt-0">
              <AdminButton variant="ghost">
                <Shuffle aria-hidden size={16} />
                {dictionary.drafts.convertToPost}
              </AdminButton>
            </div>
            <div className="pointer-events-none absolute right-0 top-1/2 z-0 hidden -translate-y-1/2 translate-x-5 opacity-0 transition duration-500 ease-editorial group-hover:translate-x-0 group-hover:opacity-100 md:block">
              <div className="relative h-40 w-64 overflow-hidden rounded-[20px] border border-outline-variant/20 bg-surface-container-low shadow-2xl">
                {draft.coverImage.src ? <Image alt={draft.coverImage.alt || draft.title} className="object-cover opacity-60 grayscale" fill sizes="256px" src={draft.coverImage.src} /> : null}
              </div>
            </div>
          </div>
        ))}
        {drafts.length === 0 ? (
          <div className="border-b border-outline-variant/20 py-12">
            <h2 className="font-serif text-headline-md text-on-surface">{dictionary.drafts.emptyTitle}</h2>
            <p className="mt-3 text-body-md text-on-surface-variant">{dictionary.drafts.emptyDescription}</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
