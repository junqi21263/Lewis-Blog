"use client";

import Link from "next/link";
import { Edit3, Eye, Plus, Trash2 } from "lucide-react";
import AdminButton from "@/components/admin/AdminButton";
import AdminCard from "@/components/admin/AdminCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { useCmsData } from "@/hooks/useCmsData";
import { useAdminI18n } from "@/i18n/admin";
import { formatAdminDate } from "@/lib/adminDate";

function copyForLocale(locale: string) {
  if (locale === "zh-CN") {
    return {
      title: "碎片",
      description: "管理轻量记录、现场笔记与公开碎片内容。",
      newEntry: "新建碎片",
      emptyTitle: "暂无碎片。",
      emptyDescription: "发布后的公开碎片会出现在前台 Fragments 页面。",
      publicLabel: "公开",
      privateLabel: "私密",
      imageLabel: "张图片",
      actions: { edit: "编辑", open: "查看", delete: "删除" },
    };
  }
  if (locale === "zh-TW") {
    return {
      title: "碎片",
      description: "管理輕量記錄、現場筆記與公開碎片內容。",
      newEntry: "新增碎片",
      emptyTitle: "暫無碎片。",
      emptyDescription: "發佈後的公開碎片會出現在前台 Fragments 頁面。",
      publicLabel: "公開",
      privateLabel: "私密",
      imageLabel: "張圖片",
      actions: { edit: "編輯", open: "查看", delete: "刪除" },
    };
  }
  return {
    title: "Fragments",
    description: "Manage lightweight notes, field records, and public fragments.",
    newEntry: "New Fragment",
    emptyTitle: "No fragments yet.",
    emptyDescription: "Published public fragments will appear on the front-end Fragments page.",
    publicLabel: "Public",
    privateLabel: "Private",
    imageLabel: "images",
    actions: { edit: "Edit", open: "Open", delete: "Delete" },
  };
}

export default function AdminFragmentsPage() {
  const { data, error, deleteFragment } = useCmsData();
  const { locale } = useAdminI18n();
  const copy = copyForLocale(locale);
  const fragments = [...data.fragments].sort((left, right) => (right.publishedAt || right.createdAt).localeCompare(left.publishedAt || left.createdAt));

  return (
    <main className="mx-auto max-w-[1400px] px-margin-mobile pb-section-gap md:px-margin-desktop">
      <header className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 font-serif text-display-lg text-on-surface md:text-display-xl">{copy.title}</h1>
          <p className="max-w-xl text-body-lg text-on-surface-variant">{copy.description}</p>
        </div>
        <Link href="/admin/fragments/new">
          <AdminButton variant="primary">
            <Plus aria-hidden size={15} />
            {copy.newEntry}
          </AdminButton>
        </Link>
      </header>

      {error ? (
        <div className="mb-6 border border-secondary/30 bg-secondary/10 px-4 py-3 font-mono text-label-mono uppercase tracking-widest text-secondary">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {fragments.map((fragment) => {
          const title = fragment.contentJson["zh-CN"] || fragment.locationJson["zh-CN"] || fragment.id;
          const metaDate = formatAdminDate(fragment.publishedAt || fragment.updatedAt || fragment.createdAt, locale);
          const visibilityLabel = fragment.isPublic ? copy.publicLabel : copy.privateLabel;
          const editHref = `/admin/fragments/edit?id=${encodeURIComponent(fragment.id)}`;

          return (
            <AdminCard key={fragment.id} className="group p-6">
              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_180px_140px]">
                <Link className="min-w-0" href={editHref}>
                  <div className="label-mono mb-3">{metaDate}</div>
                  <h2 className="line-clamp-2 font-serif text-headline-md leading-tight text-on-surface">{title}</h2>
                  <div className="mt-3 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
                    <span>{visibilityLabel}</span>
                    <span>{fragment.images.length} {copy.imageLabel}</span>
                    {fragment.camera ? <span>{fragment.camera}</span> : null}
                    {fragment.mood ? <span>{fragment.mood}</span> : null}
                  </div>
                </Link>
                <div className="lg:justify-self-start">
                  <StatusBadge status={fragment.status} />
                </div>
                <div className="flex items-center gap-3 lg:justify-end">
                  <Link aria-label={`${copy.actions.edit} ${title}`} className="text-on-surface-variant transition hover:text-on-surface" href={editHref}>
                    <Edit3 aria-hidden size={18} />
                  </Link>
                  <Link aria-label={`${copy.actions.open} ${title}`} className="text-on-surface-variant transition hover:text-on-surface" href="/zh/fragments">
                    <Eye aria-hidden size={18} />
                  </Link>
                  <button
                    aria-label={`${copy.actions.delete} ${title}`}
                    className="text-on-surface-variant transition hover:text-secondary"
                    type="button"
                    onClick={() => void deleteFragment(fragment.id)}
                  >
                    <Trash2 aria-hidden size={18} />
                  </button>
                </div>
              </div>
            </AdminCard>
          );
        })}

        {fragments.length === 0 ? (
          <AdminCard className="p-10 text-center">
            <h2 className="font-serif text-headline-md text-on-surface">{copy.emptyTitle}</h2>
            <p className="mt-3 text-body-md text-on-surface-variant">{copy.emptyDescription}</p>
          </AdminCard>
        ) : null}
      </div>
    </main>
  );
}
