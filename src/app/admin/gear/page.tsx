"use client";

import Image from "next/image";
import { Camera, Plus, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminButton from "@/components/admin/AdminButton";
import AdminCard from "@/components/admin/AdminCard";
import AdminInput from "@/components/admin/AdminInput";
import AdminTextarea from "@/components/admin/AdminTextarea";
import SaveIndicator from "@/components/admin/SaveIndicator";
import { createEmptyGearItem, type GearCategory, type GearItem, type GearStatus } from "@/data/cms";
import { useCmsData } from "@/hooks/useCmsData";
import type { Locale } from "@/i18n/config";
import { resolveLocalizedText, resolveLocalizedTextArray } from "@/i18n/content";
import { useAdminI18n } from "@/i18n/admin";
import { cn } from "@/lib/utils";

const localeTabs: Array<{ locale: Locale; short: string }> = [
  { locale: "zh-CN", short: "简" },
  { locale: "zh-TW", short: "繁" },
  { locale: "en-US", short: "EN" },
];

const gearCategories: GearCategory[] = ["Camera", "Lens", "Phone", "Drone", "Audio", "Accessories"];
const gearStatuses: GearStatus[] = ["current", "archived"];

type SaveState = "Unsaved" | "Saving" | "Saved";

function parseTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminGearPage() {
  const { data, error, addGearItem, updateGearItem, deleteGearItem, uploadAsset } = useCmsData();
  const { dictionary, locale } = useAdminI18n();
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<GearItem | null>(null);
  const [activeLocale, setActiveLocale] = useState<Locale>("zh-CN");
  const [categoryFilter, setCategoryFilter] = useState<GearCategory | "All">("All");
  const [saveState, setSaveState] = useState<SaveState>("Saved");
  const [notice, setNotice] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(
    () => (categoryFilter === "All" ? data.gearItems : data.gearItems.filter((item) => item.category === categoryFilter)),
    [categoryFilter, data.gearItems],
  );
  const selectedItem = useMemo(() => data.gearItems.find((item) => item.id === selectedId) ?? null, [data.gearItems, selectedId]);

  useEffect(() => {
    if (selectedItem) {
      setDraft(selectedItem);
      return;
    }
    if (!selectedId && data.gearItems.length > 0) {
      setSelectedId(data.gearItems[0].id);
      return;
    }
    if (!selectedId) {
      setDraft(null);
    }
  }, [data.gearItems, selectedId, selectedItem]);

  const localizedName = draft ? resolveLocalizedText(draft.nameJson, activeLocale, "") : "";
  const localizedDescription = draft ? resolveLocalizedText(draft.descriptionJson, activeLocale, "") : "";
  const localizedImageAlt = draft ? resolveLocalizedText(draft.imageAltJson, activeLocale, "") : "";
  const localizedTags = draft ? resolveLocalizedTextArray(draft.tagsJson, activeLocale, []).join(", ") : "";

  function categoryLabel(category: GearCategory) {
    if (locale === "zh-CN") {
      return {
        Camera: "相机",
        Lens: "镜头",
        Phone: "手机",
        Drone: "无人机",
        Audio: "音频",
        Accessories: "配件",
      }[category];
    }
    if (locale === "zh-TW") {
      return {
        Camera: "相機",
        Lens: "鏡頭",
        Phone: "手機",
        Drone: "無人機",
        Audio: "音訊",
        Accessories: "配件",
      }[category];
    }
    return category;
  }

  const archiveLabel = locale === "zh-CN" ? "归档" : locale === "zh-TW" ? "歸檔" : "Archive";
  const saveGearFailed = locale === "zh-CN" ? "无法保存器材条目。" : locale === "zh-TW" ? "無法儲存器材條目。" : "Unable to save gear item.";
  const deleteGearFailed = locale === "zh-CN" ? "无法删除器材条目。" : locale === "zh-TW" ? "無法刪除器材條目。" : "Unable to delete gear item.";
  const uploadImageFailed = locale === "zh-CN" ? "无法上传图片。" : locale === "zh-TW" ? "無法上傳圖片。" : "Unable to upload image.";
  const clearSelectionLabel = locale === "zh-CN" ? "清除器材选择" : locale === "zh-TW" ? "清除器材選擇" : "Clear gear selection";

  function localizedStatus(value: SaveState) {
    if (value === "Saved") return dictionary.editor.saved;
    if (value === "Saving") return dictionary.editor.saving;
    return dictionary.editor.unsaved;
  }

  function updateDraftField<Key extends keyof GearItem>(key: Key, value: GearItem[Key]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setSaveState("Unsaved");
  }

  function updateLocalizedField(field: "nameJson" | "descriptionJson" | "imageAltJson" | "tagsJson", value: string | string[]) {
    setDraft((current) => {
      if (!current) return current;
      if (field === "tagsJson") {
        return {
          ...current,
          tagsJson: {
            ...current.tagsJson,
            [activeLocale]: Array.isArray(value) ? value : parseTags(value),
          },
        };
      }
      return {
        ...current,
        [field]: {
          ...current[field],
          [activeLocale]: Array.isArray(value) ? value.join(", ") : value,
        },
      };
    });
    setSaveState("Unsaved");
  }

  function handleCreate() {
    const next = createEmptyGearItem();
    setSelectedId(next.id);
    setDraft(next);
    setActiveLocale("zh-CN");
    setNotice("");
    setSaveState("Unsaved");
  }

  async function handleSave() {
    if (!draft) return;
    setSaveState("Saving");
    try {
      const exists = data.gearItems.some((item) => item.id === draft.id);
      const result = exists ? await updateGearItem(draft) : await addGearItem(draft);
      setDraft(result.data);
      setSelectedId(result.data.id);
      setNotice(result.warnings.join(" "));
      setSaveState("Saved");
    } catch (requestError) {
      setNotice(requestError instanceof Error ? requestError.message : saveGearFailed);
      setSaveState("Unsaved");
    }
  }

  async function handleDelete() {
    if (!draft || !window.confirm(dictionary.gearCms.delete)) return;
    setSaveState("Saving");
    try {
      await deleteGearItem(draft.id);
      setSelectedId("");
      setDraft(null);
      setSaveState("Saved");
    } catch (requestError) {
      setNotice(requestError instanceof Error ? requestError.message : deleteGearFailed);
      setSaveState("Unsaved");
    }
  }

  async function handleImageUpload(file: File) {
    setSaveState("Saving");
    try {
      const uploaded = await uploadAsset(file, "gear");
      setDraft((current) => (current ? { ...current, imageUrl: uploaded.url } : current));
      setSaveState("Unsaved");
    } catch (requestError) {
      setNotice(requestError instanceof Error ? requestError.message : uploadImageFailed);
      setSaveState("Unsaved");
    }
  }

  return (
    <main className="grid h-auto gap-8 px-margin-mobile pb-section-gap md:px-margin-desktop xl:h-[calc(100vh-8rem)] xl:grid-cols-[minmax(0,1fr)_420px] xl:overflow-hidden">
      <input
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.avif,.svg,.heic,.heif"
        className="hidden"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.currentTarget.value = "";
          if (file) {
            void handleImageUpload(file);
          }
        }}
      />

      <section className="min-h-0 overflow-y-auto pr-0 xl:pr-2">
        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <h1 className="font-serif text-display-lg text-on-surface">{dictionary.gearCms.title}</h1>
              <SaveIndicator status={localizedStatus(saveState)} />
            </div>
            <p className="max-w-2xl text-body-lg text-on-surface-variant">{dictionary.gearCms.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <AdminButton variant="primary" onClick={handleCreate}>
              <Plus aria-hidden size={15} />
              {dictionary.gearCms.newItem}
            </AdminButton>
          </div>
        </header>

        <div className="mb-8 flex gap-2 overflow-x-auto border-y border-outline-variant/10 py-5">
          <button
            className={cn(
              "min-w-fit border border-outline-variant/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition",
              categoryFilter === "All" ? "border-on-background text-on-background" : "text-on-surface-variant hover:text-on-surface",
            )}
            type="button"
            onClick={() => setCategoryFilter("All")}
          >
            {dictionary.gearCms.allCategories}
          </button>
              {gearCategories.map((category) => (
            <button
              key={category}
              className={cn(
                "min-w-fit border border-outline-variant/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition",
                categoryFilter === category ? "border-on-background text-on-background" : "text-on-surface-variant hover:text-on-surface",
              )}
              type="button"
              onClick={() => setCategoryFilter(category)}
            >
              {categoryLabel(category)}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mb-6 border border-secondary/30 bg-secondary/10 px-4 py-3 font-mono text-label-mono uppercase tracking-widest text-secondary">
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="mb-6 border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-body-sm text-on-surface-variant">
            {notice}
          </div>
        ) : null}

        {filteredItems.length === 0 ? (
          <AdminCard className="border-outline-variant/15 bg-surface-container-lowest p-10 md:p-12">
            <h2 className="font-serif text-headline-md text-on-surface">{dictionary.gearCms.emptyTitle}</h2>
            <p className="mt-3 max-w-lg text-body-md text-on-surface-variant">{dictionary.gearCms.emptyDescription}</p>
          </AdminCard>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-12">
            {filteredItems.map((item, index) => {
              const title = resolveLocalizedText(item.nameJson, "zh-CN", item.maker);
              const description = resolveLocalizedText(item.descriptionJson, "zh-CN", "");
              return (
                <AdminCard
                  key={item.id}
                  className={cn(
                    "group cursor-pointer overflow-hidden bg-surface hover:border-primary/40",
                    selectedId === item.id && "ring-1 ring-primary/50",
                    index % 3 === 1 ? "xl:col-span-8" : "xl:col-span-4",
                  )}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className={cn("relative overflow-hidden", index % 3 === 1 ? "aspect-[2/1]" : "aspect-[4/5]")}>
                    {item.imageUrl ? (
                      <Image
                        alt={resolveLocalizedText(item.imageAltJson, "zh-CN", title)}
                        className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105"
                        fill
                        sizes="(min-width: 1280px) 30vw, 100vw"
                        src={item.imageUrl}
                      />
                    ) : (
                      <div className="h-full w-full bg-surface-container-high" />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="label-mono mb-4">
                      {categoryLabel(item.category)} - {item.year || archiveLabel}
                    </div>
                    <h2 className="font-serif text-headline-md text-on-surface">{[item.maker, title].filter(Boolean).join(" ").trim()}</h2>
                    {description ? <p className="mt-3 line-clamp-2 text-body-md text-on-surface-variant">{description}</p> : null}
                  </div>
                </AdminCard>
              );
            })}
          </div>
        )}
      </section>

      <AdminCard className="min-h-0 flex-col overflow-hidden bg-surface-container-low xl:flex">
        {draft ? (
          <>
            <div className="flex items-center justify-between border-b border-outline-variant/10 p-8">
              <h2 className="font-serif text-2xl text-on-surface">{dictionary.gearCms.details}</h2>
              <button
                aria-label={clearSelectionLabel}
                className="text-on-surface-variant transition hover:text-on-surface"
                type="button"
                onClick={() => {
                  setSelectedId("");
                  setDraft(null);
                }}
              >
                <X aria-hidden size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="inline-flex rounded-full border border-outline-variant/20 bg-surface-container-lowest/60 p-1">
                  {localeTabs.map((tab) => (
                    <button
                      key={tab.locale}
                      className={cn(
                        "min-w-12 rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] transition",
                        activeLocale === tab.locale ? "bg-primary text-background" : "text-on-surface-variant hover:text-on-surface",
                      )}
                      type="button"
                      onClick={() => setActiveLocale(tab.locale)}
                    >
                      {tab.short}
                    </button>
                  ))}
                </div>
                <AdminButton onClick={() => fileInputRef.current?.click()}>
                  <Upload aria-hidden size={14} />
                  {dictionary.gearCms.uploadImage}
                </AdminButton>
              </div>

              <div className="mb-8 overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container-high">
                {draft.imageUrl ? (
                  <div className="relative aspect-[4/5]">
                    <Image alt={localizedImageAlt || localizedName || draft.maker} className="object-cover grayscale" fill sizes="420px" src={draft.imageUrl} />
                  </div>
                ) : (
                  <div className="grid aspect-[4/5] place-items-center font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                    <Camera aria-hidden size={18} />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <AdminInput label={dictionary.gearCms.name} value={localizedName} onChange={(event) => updateLocalizedField("nameJson", event.target.value)} />
                <AdminTextarea label={dictionary.editor.excerpt} rows={4} value={localizedDescription} onChange={(event) => updateLocalizedField("descriptionJson", event.target.value)} />
                <AdminInput label={dictionary.gearCms.imageAlt} value={localizedImageAlt} onChange={(event) => updateLocalizedField("imageAltJson", event.target.value)} />
                <AdminInput label={dictionary.gearCms.tags} value={localizedTags} onChange={(event) => updateLocalizedField("tagsJson", event.target.value)} />
                <div className="grid gap-6 md:grid-cols-2">
                  <AdminInput label={dictionary.gearCms.maker} value={draft.maker} onChange={(event) => updateDraftField("maker", event.target.value)} />
                  <AdminInput label={dictionary.gearCms.year} value={draft.year} onChange={(event) => updateDraftField("year", event.target.value)} />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="label-mono">{dictionary.gearCms.category}</span>
                    <select
                      className="h-12 w-full border-b border-outline-variant/20 bg-transparent px-0 text-body-md text-on-surface outline-none transition focus:border-primary"
                      value={draft.category}
                      onChange={(event) => updateDraftField("category", event.target.value as GearCategory)}
                    >
                      {gearCategories.map((option) => (
                        <option key={option} className="bg-background text-on-surface" value={option}>
                          {categoryLabel(option)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="label-mono">{dictionary.gearCms.status}</span>
                    <select
                      className="h-12 w-full border-b border-outline-variant/20 bg-transparent px-0 text-body-md text-on-surface outline-none transition focus:border-primary"
                      value={draft.status}
                      onChange={(event) => updateDraftField("status", event.target.value as GearStatus)}
                    >
                      {gearStatuses.map((option) => (
                        <option key={option} className="bg-background text-on-surface" value={option}>
                          {option === "current" ? dictionary.gearCms.current : dictionary.gearCms.archived}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <AdminInput
                    label={dictionary.gearCms.archiveUses}
                    type="number"
                    value={String(draft.archiveUses)}
                    onChange={(event) => updateDraftField("archiveUses", Number(event.target.value) || 0)}
                  />
                  <AdminInput
                    label={dictionary.gearCms.sortOrder}
                    type="number"
                    value={String(draft.sortOrder)}
                    onChange={(event) => updateDraftField("sortOrder", Number(event.target.value) || 0)}
                  />
                </div>
                <label className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                  <span className="text-body-md text-on-surface">{dictionary.gearCms.featured}</span>
                  <input checked={draft.isFeatured} type="checkbox" onChange={(event) => updateDraftField("isFeatured", event.target.checked)} />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/10 p-8">
              <AdminButton className="text-secondary hover:border-secondary/30" onClick={() => void handleDelete()}>
                <Trash2 aria-hidden size={14} />
                {dictionary.gearCms.delete}
              </AdminButton>
              <AdminButton variant="primary" onClick={() => void handleSave()}>
                {dictionary.gearCms.save}
              </AdminButton>
            </div>
          </>
        ) : (
          <div className="grid h-full min-h-[340px] place-items-center p-8 text-center">
            <div>
              <h2 className="font-serif text-headline-md text-on-surface">{dictionary.gearCms.emptyTitle}</h2>
              <p className="mt-3 max-w-sm text-body-md text-on-surface-variant">{dictionary.gearCms.emptyDescription}</p>
            </div>
          </div>
        )}
      </AdminCard>
    </main>
  );
}
