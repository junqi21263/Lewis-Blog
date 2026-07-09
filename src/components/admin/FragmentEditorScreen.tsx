"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUp, ArrowDown, Globe, ImagePlus, Lock, Save, Send, Trash2, Unlock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminButton from "@/components/admin/AdminButton";
import AdminInput from "@/components/admin/AdminInput";
import AdminTextarea from "@/components/admin/AdminTextarea";
import { createEmptyFragment, type Fragment, type FragmentImage, type FragmentTranslationField } from "@/data/cms";
import { useCmsData } from "@/hooks/useCmsData";
import type { Locale } from "@/i18n/config";
import { useAdminI18n } from "@/i18n/admin";

type FragmentEditorScreenProps = {
  fragmentId?: string;
};

const locales: Array<{ locale: Locale; label: string }> = [
  { locale: "zh-CN", label: "简" },
  { locale: "zh-TW", label: "繁" },
  { locale: "en-US", label: "EN" },
];

function copyForLocale(locale: Locale) {
  if (locale === "zh-CN") {
    return {
      title: "碎片",
      description: "编辑轻量记录、图片和多语言碎片内容。",
      newEntry: "新建碎片",
      content: "内容",
      location: "地点",
      camera: "设备",
      mood: "心情",
      status: "状态",
      isPublic: "公开显示",
      images: "图片",
      saveDraft: "保存草稿",
      publish: "发布",
      delete: "删除",
      upload: "上传图片",
      back: "返回碎片列表",
      noImages: "暂无图片",
      auto: "AUTO",
      manual: "MANUAL",
      autoHint: "跟随简体自动生成",
      manualHint: "保留人工编辑内容",
      publishToast: "碎片已发布。",
      savedToast: "草稿已保存。",
      deletedToast: "碎片已删除。",
      visibilityHint: "仅 published 且公开的碎片会出现在前台。",
      warnings: "同步提示",
      notFound: "未找到该碎片。",
    };
  }
  if (locale === "zh-TW") {
    return {
      title: "碎片",
      description: "編輯輕量記錄、圖片與多語碎片內容。",
      newEntry: "新增碎片",
      content: "內容",
      location: "地點",
      camera: "設備",
      mood: "心情",
      status: "狀態",
      isPublic: "公開顯示",
      images: "圖片",
      saveDraft: "保存草稿",
      publish: "發佈",
      delete: "刪除",
      upload: "上傳圖片",
      back: "返回碎片列表",
      noImages: "暫無圖片",
      auto: "AUTO",
      manual: "MANUAL",
      autoHint: "跟隨簡體自動生成",
      manualHint: "保留人工編輯內容",
      publishToast: "碎片已發佈。",
      savedToast: "草稿已保存。",
      deletedToast: "碎片已刪除。",
      visibilityHint: "只有 published 且公開的碎片會出現在前台。",
      warnings: "同步提示",
      notFound: "找不到這則碎片。",
    };
  }
  return {
    title: "Fragments",
    description: "Edit lightweight notes, images, and localized fragment copy.",
    newEntry: "New Fragment",
    content: "Content",
    location: "Location",
    camera: "Camera / Device",
    mood: "Mood",
    status: "Status",
    isPublic: "Publicly visible",
    images: "Images",
    saveDraft: "Save Draft",
    publish: "Publish",
    delete: "Delete",
    upload: "Upload Images",
    back: "Back to Fragments",
    noImages: "No images yet",
    auto: "AUTO",
    manual: "MANUAL",
    autoHint: "Regenerate from Simplified Chinese",
    manualHint: "Keep manual edits",
    publishToast: "Fragment published.",
    savedToast: "Draft saved.",
    deletedToast: "Fragment deleted.",
    visibilityHint: "Only published and public fragments appear on the site.",
    warnings: "Sync warnings",
    notFound: "Fragment not found.",
  };
}

function updateImageOrder(images: FragmentImage[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= images.length) {
    return images;
  }

  const next = [...images];
  const current = next[index];
  next[index] = { ...next[nextIndex], sortOrder: index };
  next[nextIndex] = { ...current, sortOrder: nextIndex };
  return next;
}

export default function FragmentEditorScreen({ fragmentId }: FragmentEditorScreenProps) {
  const { locale } = useAdminI18n();
  const copy = copyForLocale(locale);
  const { data, isReady, error, addFragment, updateFragment, deleteFragment, uploadAssets } = useCmsData();
  const existing = useMemo(() => data.fragments.find((item) => item.id === fragmentId) ?? null, [data.fragments, fragmentId]);
  const [draft, setDraft] = useState<Fragment>(() => existing ?? createEmptyFragment());
  const [activeLocale, setActiveLocale] = useState<Locale>("zh-CN");
  const [toast, setToast] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existing) {
      setDraft(existing);
    } else if (!fragmentId) {
      setDraft(createEmptyFragment());
    }
  }, [existing, fragmentId]);

  function updateDraft<Key extends keyof Fragment>(key: Key, value: Fragment[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateLocalized(field: FragmentTranslationField, localeKey: Locale, value: string) {
    setDraft((current) => ({
      ...current,
      [`${field}Json`]: { ...current[`${field}Json`], [localeKey]: value },
    } as Fragment));
  }

  function toggleManual(localeKey: Locale, field: FragmentTranslationField) {
    setDraft((current) => ({
      ...current,
      translationLocks: {
        ...current.translationLocks,
        [localeKey]: {
          ...current.translationLocks[localeKey],
          [field]: !current.translationLocks[localeKey]?.[field],
        },
      },
    }));
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    const remaining = Math.max(0, 4 - draft.images.length);
    const selected = Array.from(files).slice(0, remaining);
    if (selected.length === 0) {
      return;
    }

    const now = new Date();
    const folder = `fragments/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const uploaded = await uploadAssets(selected, folder);
    updateDraft("images", [
      ...draft.images,
      ...uploaded.map((file, index) => ({
        url: file.url,
        altJson: {},
        captionJson: {},
        width: "width" in file ? file.width ?? null : null,
        height: "height" in file ? file.height ?? null : null,
        sortOrder: draft.images.length + index,
      })),
    ]);
  }

  async function save(nextStatus: Fragment["status"]) {
    const nextDraft: Fragment = {
      ...draft,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      publishedAt: nextStatus === "published" ? draft.publishedAt || new Date().toISOString() : draft.publishedAt,
    };
    const result = draft.id && existing ? await updateFragment(nextDraft) : await addFragment(nextDraft);
    setDraft(result.data);
    setWarnings(result.warnings);
    setToast(nextStatus === "published" ? copy.publishToast : copy.savedToast);
    setTimeout(() => setToast(""), 3000);
  }

  async function removeCurrent() {
    if (!draft.id) return;
    await deleteFragment(draft.id);
    setToast(copy.deletedToast);
    setTimeout(() => {
      window.location.href = "/admin/fragments";
    }, 500);
  }

  if (fragmentId && isReady && !existing) {
    return (
      <main className="mx-auto max-w-6xl px-margin-mobile pb-section-gap md:px-margin-desktop">
        <p className="text-body-lg text-secondary">{copy.notFound}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-margin-mobile pb-section-gap md:px-margin-desktop">
      {toast ? (
        <div className="fixed right-6 top-24 z-50 border border-outline-variant/20 bg-background px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-on-background">
          {toast}
        </div>
      ) : null}

      <header className="mb-12 flex flex-col justify-between gap-6 border-b border-outline-variant/10 pb-6 md:flex-row md:items-end">
        <div>
          <Link className="label-mono mb-4 inline-flex items-center gap-2 hover:text-on-surface" href="/admin/fragments">
            <ArrowLeft aria-hidden size={14} />
            {copy.back}
          </Link>
          <h1 className="mb-2 font-serif text-display-md text-on-surface">{fragmentId ? copy.title : copy.newEntry}</h1>
          <p className="max-w-2xl text-body-lg text-on-surface-variant">{copy.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <AdminButton onClick={() => void save("draft")}>
            <Save aria-hidden size={15} />
            {copy.saveDraft}
          </AdminButton>
          <AdminButton variant="primary" onClick={() => void save("published")}>
            <Send aria-hidden size={15} />
            {copy.publish}
          </AdminButton>
          {fragmentId ? (
            <AdminButton variant="ghost" onClick={() => void removeCurrent()}>
              <Trash2 aria-hidden size={15} />
              {copy.delete}
            </AdminButton>
          ) : null}
        </div>
      </header>

      {warnings.length > 0 ? (
        <div className="mb-6 border border-secondary/30 bg-secondary/10 px-4 py-3">
          <div className="label-mono mb-2">{copy.warnings}</div>
          <div className="space-y-2 text-body-sm text-secondary">
            {warnings.map((warning, index) => (
              <p key={`${warning}-${index}`}>{warning}</p>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <div className="mb-6 text-body-sm text-secondary">{error}</div> : null}

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            {locales.map((item) => (
              <button
                key={item.locale}
                className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] ${activeLocale === item.locale ? "border-on-background text-on-background" : "border-outline-variant/20 text-on-surface-variant"}`}
                type="button"
                onClick={() => setActiveLocale(item.locale)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <span className="label-mono">{copy.content}</span>
              {activeLocale !== "zh-CN" ? (
                <button
                  className="inline-flex items-center gap-2 border border-outline-variant/20 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em]"
                  type="button"
                  onClick={() => toggleManual(activeLocale, "content")}
                >
                  {draft.translationLocks[activeLocale]?.content ? <Lock aria-hidden size={14} /> : <Unlock aria-hidden size={14} />}
                  {draft.translationLocks[activeLocale]?.content ? copy.manual : copy.auto}
                </button>
              ) : null}
            </div>
            <AdminTextarea
              rows={8}
              value={draft.contentJson[activeLocale] ?? ""}
              onChange={(event) => updateLocalized("content", activeLocale, event.target.value)}
            />

            <div className="flex items-center justify-between">
              <span className="label-mono">{copy.location}</span>
              {activeLocale !== "zh-CN" ? (
                <button
                  className="inline-flex items-center gap-2 border border-outline-variant/20 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em]"
                  type="button"
                  onClick={() => toggleManual(activeLocale, "location")}
                >
                  {draft.translationLocks[activeLocale]?.location ? <Lock aria-hidden size={14} /> : <Unlock aria-hidden size={14} />}
                  {draft.translationLocks[activeLocale]?.location ? copy.manual : copy.auto}
                </button>
              ) : null}
            </div>
            <AdminInput value={draft.locationJson[activeLocale] ?? ""} onChange={(event) => updateLocalized("location", activeLocale, event.target.value)} />
          </div>

          <section className="border-t border-outline-variant/10 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="label-mono">{copy.images}</div>
              <input
                ref={uploadRef}
                accept="image/*"
                className="hidden"
                multiple
                type="file"
                onChange={(event) => void handleUpload(event.target.files)}
              />
              <AdminButton onClick={() => uploadRef.current?.click()}>
                <ImagePlus aria-hidden size={15} />
                {copy.upload}
              </AdminButton>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {draft.images.map((image, index) => (
                <div key={`${image.url}-${index}`} className="border border-outline-variant/10 p-4">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-low">
                    <Image alt="" className="object-cover grayscale" fill sizes="(min-width: 768px) 50vw, 100vw" src={image.url} />
                  </div>
                  <div className="mt-4 grid gap-3">
                    <AdminInput
                      label="Alt"
                      value={image.altJson[activeLocale] ?? ""}
                      onChange={(event) =>
                        updateDraft(
                          "images",
                          draft.images.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, altJson: { ...entry.altJson, [activeLocale]: event.target.value } } : entry,
                          ),
                        )
                      }
                    />
                    <AdminInput
                      label="Caption"
                      value={image.captionJson[activeLocale] ?? ""}
                      onChange={(event) =>
                        updateDraft(
                          "images",
                          draft.images.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, captionJson: { ...entry.captionJson, [activeLocale]: event.target.value } } : entry,
                          ),
                        )
                      }
                    />
                    <div className="flex gap-2">
                      <button className="border border-outline-variant/20 p-2" type="button" onClick={() => updateDraft("images", updateImageOrder(draft.images, index, -1))}>
                        <ArrowUp aria-hidden size={14} />
                      </button>
                      <button className="border border-outline-variant/20 p-2" type="button" onClick={() => updateDraft("images", updateImageOrder(draft.images, index, 1))}>
                        <ArrowDown aria-hidden size={14} />
                      </button>
                      <button
                        className="border border-outline-variant/20 p-2 text-secondary"
                        type="button"
                        onClick={() => updateDraft("images", draft.images.filter((_, imageIndex) => imageIndex !== index).map((entry, entryIndex) => ({ ...entry, sortOrder: entryIndex })))}
                      >
                        <Trash2 aria-hidden size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {draft.images.length === 0 ? <div className="text-body-sm text-on-surface-variant">{copy.noImages}</div> : null}
            </div>
          </section>
        </div>

        <aside className="space-y-6 border-t border-outline-variant/10 pt-6 lg:border-t-0 lg:border-l lg:pl-8">
          <AdminInput label={copy.camera} value={draft.camera} onChange={(event) => updateDraft("camera", event.target.value)} />
          <AdminInput label={copy.mood} value={draft.mood} onChange={(event) => updateDraft("mood", event.target.value)} />
          <div>
            <span className="label-mono mb-2 block">{copy.status}</span>
            <select
              className="w-full border border-outline-variant/20 bg-transparent px-3 py-3 text-body-md text-on-surface"
              value={draft.status}
              onChange={(event) => updateDraft("status", event.target.value as Fragment["status"])}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </div>
          <label className="flex items-center justify-between gap-4 border-t border-outline-variant/10 pt-4">
            <span>
              <span className="block text-body-md text-on-surface">{copy.isPublic}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{copy.visibilityHint}</span>
            </span>
            <button
              className={`relative h-6 w-11 rounded-full ${draft.isPublic ? "bg-primary" : "bg-surface-variant"}`}
              type="button"
              onClick={() => updateDraft("isPublic", !draft.isPublic)}
            >
              <span className={`absolute top-1 size-4 rounded-full bg-background transition ${draft.isPublic ? "left-6" : "left-1"}`} />
            </button>
          </label>
          <div className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            <div className="mb-2 inline-flex items-center gap-2">
              <Globe aria-hidden size={14} />
              {copy.autoHint}
            </div>
            <div>{copy.manualHint}</div>
          </div>
        </aside>
      </section>
    </main>
  );
}
