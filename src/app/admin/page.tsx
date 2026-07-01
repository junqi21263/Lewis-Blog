"use client";

import Link from "next/link";
import { ArrowRight, CloudUpload, FileText, PenLine, Video } from "lucide-react";
import AdminButton from "@/components/admin/AdminButton";
import AdminCard from "@/components/admin/AdminCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { getCategoryById } from "@/data/cms";
import { useCmsData } from "@/hooks/useCmsData";
import { useAdminI18n } from "@/i18n/admin";

export default function AdminDashboardPage() {
  const { data } = useCmsData();
  const { dictionary } = useAdminI18n();
  const draftCount = data.posts.filter((post) => post.status === "draft").length;
  const publishedCount = data.posts.filter((post) => post.status === "published").length;
  const hasContent = data.posts.length > 0 || data.photos.length > 0 || data.videos.length > 0;

  return (
    <main className="mx-auto max-w-7xl px-margin-mobile pb-section-gap md:px-margin-desktop">
      <header className="mb-20 md:mb-28">
        <h1 className="mb-6 font-serif text-display-lg text-on-surface">{dictionary.dashboard.title}</h1>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">{dictionary.dashboard.description}</p>
      </header>

      {!hasContent ? (
        <AdminCard className="mb-24 border-outline-variant/15 bg-surface-container-lowest p-10 md:p-14">
          <div className="max-w-3xl">
            <p className="label-mono mb-5">{dictionary.dashboard.emptyEyebrow}</p>
            <h2 className="max-w-2xl font-serif text-display-md text-on-surface md:text-display-lg">{dictionary.dashboard.emptyTitle}</h2>
            <p className="mt-5 max-w-xl text-body-lg text-on-surface-variant">{dictionary.dashboard.emptyDescription}</p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <Link href="/admin/posts/new">
                <AdminCard className="flex min-h-[180px] flex-col justify-between p-6 transition hover:border-outline-variant/30 hover:bg-surface-container-low">
                  <PenLine aria-hidden className="text-on-surface-variant" size={20} />
                  <div>
                    <h3 className="font-serif text-2xl text-on-surface">{dictionary.dashboard.newArticle}</h3>
                    <p className="mt-2 text-body-md text-on-surface-variant">{dictionary.dashboard.newArticleDescription}</p>
                  </div>
                </AdminCard>
              </Link>
              <Link href="/admin/gallery">
                <AdminCard className="flex min-h-[180px] flex-col justify-between p-6 transition hover:border-outline-variant/30 hover:bg-surface-container-low">
                  <CloudUpload aria-hidden className="text-on-surface-variant" size={20} />
                  <div>
                    <h3 className="font-serif text-2xl text-on-surface">{dictionary.dashboard.uploadImage}</h3>
                    <p className="mt-2 text-body-md text-on-surface-variant">{dictionary.dashboard.uploadImageDescription}</p>
                  </div>
                </AdminCard>
              </Link>
              <Link href="/admin/videos">
                <AdminCard className="flex min-h-[180px] flex-col justify-between p-6 transition hover:border-outline-variant/30 hover:bg-surface-container-low">
                  <Video aria-hidden className="text-on-surface-variant" size={20} />
                  <div>
                    <h3 className="font-serif text-2xl text-on-surface">{dictionary.dashboard.addFilm}</h3>
                    <p className="mt-2 text-body-md text-on-surface-variant">{dictionary.dashboard.addFilmDescription}</p>
                  </div>
                </AdminCard>
              </Link>
            </div>
          </div>
        </AdminCard>
      ) : (
        <section className="mb-28 grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          <AdminCard className="flex min-h-[220px] flex-col justify-between p-6 md:p-8">
            <span className="label-mono">{dictionary.dashboard.posts}</span>
            <span className="font-serif text-display-lg leading-none text-on-surface md:text-display-xl">{data.posts.length}</span>
          </AdminCard>
          <AdminCard className="flex min-h-[220px] flex-col justify-between p-6 md:p-8">
            <span className="label-mono">{dictionary.dashboard.drafts}</span>
            <span className="font-serif text-display-lg leading-none text-on-surface md:text-display-xl">{draftCount}</span>
          </AdminCard>
          <AdminCard className="flex min-h-[220px] flex-col justify-between p-6 md:p-8">
            <span className="label-mono">{dictionary.dashboard.published}</span>
            <span className="font-serif text-display-lg leading-none text-on-surface md:text-display-xl">{publishedCount}</span>
          </AdminCard>
          <AdminCard className="flex min-h-[220px] flex-col justify-between p-6 md:p-8">
            <span className="label-mono">{dictionary.dashboard.galleryFilms}</span>
            <span className="font-serif text-display-lg leading-none text-on-surface md:text-display-xl">{data.photos.length + data.videos.length}</span>
          </AdminCard>
        </section>
      )}

      <section className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="mb-8 flex items-end justify-between border-b border-outline-variant/20 pb-4">
            <h2 className="font-serif text-headline-md text-on-surface">{dictionary.dashboard.recentActivity}</h2>
            <Link className="label-mono transition hover:text-on-surface" href="/admin/posts">
              {dictionary.dashboard.viewAll}
            </Link>
          </div>
          <div className="space-y-4">
            {data.posts.slice(0, 5).map((post) => {
              const category = getCategoryById(data, post.categoryId);
              return (
                <Link key={post.id} href={`/admin/posts/edit?id=${encodeURIComponent(post.id)}`}>
                  <AdminCard className="group flex flex-col justify-between gap-4 p-6 hover:border-outline-variant/30 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="mb-2 font-serif text-2xl text-on-surface transition group-hover:text-primary">{post.title}</h3>
                      <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                        {category.name} / {post.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-5">
                      <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant/70">{post.updatedAt}</p>
                      <StatusBadge status={post.status} />
                    </div>
                  </AdminCard>
                </Link>
              );
            })}
            {data.posts.length === 0 ? (
              <AdminCard className="border-outline-variant/15 bg-surface-container-lowest p-8">
                <FileText aria-hidden className="mb-5 text-on-surface-variant" size={18} />
                <h3 className="font-serif text-headline-md text-on-surface">{dictionary.dashboard.noRecentActivity}</h3>
                <p className="mt-3 max-w-lg text-body-md text-on-surface-variant">{dictionary.dashboard.noRecentActivityDescription}</p>
              </AdminCard>
            ) : null}
          </div>
        </div>

        <aside className="lg:col-span-4 lg:pt-20">
          <AdminCard className="flex h-full flex-col bg-surface-container p-8">
            <h2 className="mb-8 font-serif text-headline-md text-on-surface">{dictionary.dashboard.actions}</h2>
            <div className="flex flex-1 flex-col gap-4">
              <Link href="/admin/posts/new">
                <AdminButton className="w-full justify-between rounded-[20px]" variant="primary">
                  <span className="flex items-center gap-2">
                    <PenLine aria-hidden size={15} /> {dictionary.dashboard.newArticle}
                  </span>
                  <ArrowRight aria-hidden size={15} />
                </AdminButton>
              </Link>
              <Link href="/admin/gallery">
                <AdminButton className="w-full justify-between rounded-[20px]">
                  <span className="flex items-center gap-2">
                    <CloudUpload aria-hidden size={15} /> {dictionary.dashboard.uploadImage}
                  </span>
                  <ArrowRight aria-hidden size={15} />
                </AdminButton>
              </Link>
            </div>
          </AdminCard>
        </aside>
      </section>
    </main>
  );
}
