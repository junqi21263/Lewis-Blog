"use client";

import Image from "next/image";
import Link from "next/link";
import { Archive, Edit3, Eye, Plus, Search } from "lucide-react";
import AdminButton from "@/components/admin/AdminButton";
import AdminCard from "@/components/admin/AdminCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { getCategoryById } from "@/data/cms";
import { useCmsData } from "@/hooks/useCmsData";
import { useAdminI18n } from "@/i18n/admin";

export default function AdminPostsPage() {
  const { data, error, deletePost } = useCmsData();
  const { dictionary } = useAdminI18n();

  async function handleDelete(postId: string) {
    try {
      await deletePost(postId);
    } catch {
      // The hook exposes the error message for the page-level alert.
    }
  }

  return (
    <main className="mx-auto max-w-[1400px] px-margin-mobile pb-section-gap md:px-margin-desktop">
      <header className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 font-serif text-display-lg text-on-surface md:text-display-xl">{dictionary.posts.title}</h1>
          <p className="max-w-xl text-body-lg text-on-surface-variant">{dictionary.posts.description}</p>
        </div>
        <Link href="/admin/posts/new">
          <AdminButton variant="primary">
            <Plus aria-hidden size={15} />
            {dictionary.posts.newEntry}
          </AdminButton>
        </Link>
      </header>

      <section className="mb-12 flex flex-col justify-between gap-6 border-b border-outline-variant/20 pb-4 lg:flex-row lg:items-center">
        <div className="flex gap-8 overflow-x-auto pb-2 font-mono text-label-mono uppercase tracking-widest lg:pb-0">
          {[dictionary.posts.tabs.all, dictionary.posts.tabs.published, dictionary.posts.tabs.drafts, dictionary.posts.tabs.scheduled].map((tab, index) => (
            <button key={tab} className={index === 0 ? "border-b border-primary pb-2 text-on-surface" : "pb-2 text-on-surface-variant transition hover:text-on-surface"} type="button">
              {tab}
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:w-80">
          <Search aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant" size={17} />
          <input
            className="w-full border-0 border-b border-outline-variant/30 bg-transparent pb-2 pl-8 text-body-md text-on-surface outline-none focus:border-primary focus:ring-0 placeholder:text-on-surface-variant/50"
            placeholder={dictionary.posts.searchPlaceholder}
            type="search"
          />
        </label>
      </section>
      {error ? (
        <div className="mb-6 border border-secondary/30 bg-secondary/10 px-4 py-3 font-mono text-label-mono uppercase tracking-widest text-secondary">
          {error}
        </div>
      ) : null}

      <div className="mb-6 hidden grid-cols-12 gap-6 px-6 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant lg:grid">
        <div className="col-span-5">{dictionary.posts.tableTitle}</div>
        <div className="col-span-2">{dictionary.posts.tableCategory}</div>
        <div className="col-span-2">{dictionary.posts.tableDate}</div>
        <div className="col-span-2">{dictionary.posts.tableStatus}</div>
        <div className="col-span-1 text-right">{dictionary.posts.tableActions}</div>
      </div>

      <div className="space-y-4">
        {data.posts.map((post) => {
          const category = getCategoryById(data, post.categoryId);
          return (
          <AdminCard key={post.id} className="group p-6 hover:-translate-y-1 hover:bg-surface-container">
            <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
              <Link className="col-span-1 flex items-center gap-6 lg:col-span-5" href={`/admin/posts/edit?id=${encodeURIComponent(post.id)}`}>
                <div className="relative hidden size-16 shrink-0 overflow-hidden rounded bg-surface-variant sm:block">
                  {post.coverImage.src ? (
                    <Image alt={post.coverImage.alt || post.title} className="object-cover opacity-65 grayscale transition group-hover:opacity-100" fill sizes="64px" src={post.coverImage.src} />
                  ) : null}
                </div>
                <div>
                  <h2 className="mb-1 font-serif text-headline-md leading-tight text-on-surface">{post.title}</h2>
                  <p className="text-body-md text-on-surface-variant lg:hidden">{category.name} / {post.publishedAt || post.updatedAt}</p>
                </div>
              </Link>
              <div className="hidden text-body-md text-on-surface-variant lg:col-span-2 lg:block">{category.name}</div>
              <div className="hidden font-mono text-label-mono uppercase tracking-widest text-on-surface-variant lg:col-span-2 lg:block">{post.publishedAt || post.updatedAt}</div>
              <div className="lg:col-span-2">
                <StatusBadge status={post.status} />
              </div>
              <div className="flex items-center gap-3 opacity-100 transition lg:col-span-1 lg:justify-end lg:opacity-0 lg:group-hover:opacity-100">
                <Link className="text-on-surface-variant transition hover:text-on-surface" href={`/admin/posts/edit?id=${encodeURIComponent(post.id)}`} aria-label={`Edit ${post.title}`}>
                  <Edit3 aria-hidden size={19} />
                </Link>
                <button className="text-on-surface-variant transition hover:text-on-surface" type="button" aria-label={`Preview ${post.title}`}>
                  <Eye aria-hidden size={19} />
                </button>
                <button className="text-on-surface-variant transition hover:text-secondary" type="button" aria-label={`Delete ${post.title}`} onClick={() => void handleDelete(post.id)}>
                  <Archive aria-hidden size={19} />
                </button>
              </div>
            </div>
          </AdminCard>
          );
        })}
        {data.posts.length === 0 ? (
          <AdminCard className="p-10 text-center">
            <h2 className="font-serif text-headline-md text-on-surface">{dictionary.posts.noArticlesTitle}</h2>
            <p className="mt-3 text-body-md text-on-surface-variant">{dictionary.posts.noArticlesDescription}</p>
          </AdminCard>
        ) : null}
      </div>
    </main>
  );
}
