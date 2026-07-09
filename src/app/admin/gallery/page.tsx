"use client";

import { CloudUpload, Plus, Search, SortDesc, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminButton from "@/components/admin/AdminButton";
import AdminCard from "@/components/admin/AdminCard";
import AdminInput from "@/components/admin/AdminInput";
import AdminTextarea from "@/components/admin/AdminTextarea";
import StatusBadge from "@/components/admin/StatusBadge";
import type { Photo } from "@/data/cms";
import { useCmsData } from "@/hooks/useCmsData";
import { useAdminI18n } from "@/i18n/admin";
import { slugifyTitle } from "@/lib/editor";

function createPhoto(): Photo {
  const now = new Date().toISOString().slice(0, 10);
  return {
    id: `photo-${Date.now()}`,
    title: "",
    description: "",
    imageUrl: "",
    altText: "",
    status: "draft",
    featured: false,
    location: "",
    city: "",
    country: "",
    latitude: null,
    longitude: null,
    date: now,
    camera: "",
    lens: "",
    iso: "",
    aperture: "",
    shutterSpeed: "",
    focalLength: "",
    tags: [],
  };
}

function tagString(photo: Photo) {
  return photo.tags.join(", ");
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function stringValue(value: unknown) {
  return value == null ? "" : String(value);
}

function formatExposureTime(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return stringValue(value);
  }
  if (value >= 1) {
    return `${value}s`;
  }
  return `1/${Math.round(1 / value)}`;
}

async function readExif(file: File): Promise<Partial<Photo>> {
  try {
    const exifr = await import("exifr");
    const metadata = await exifr.parse(file, {
      gps: true,
      tiff: true,
      exif: true,
      pick: [
        "Make",
        "Model",
        "LensModel",
        "ISO",
        "FNumber",
        "ExposureTime",
        "FocalLength",
        "DateTimeOriginal",
        "latitude",
        "longitude",
      ],
    });

    if (!metadata) {
      return {};
    }

    const date = metadata.DateTimeOriginal instanceof Date ? metadata.DateTimeOriginal.toISOString().slice(0, 10) : "";
    const make = stringValue(metadata.Make);
    const model = stringValue(metadata.Model);
    const camera = [make, model].filter(Boolean).join(" ");
    const aperture = typeof metadata.FNumber === "number" ? `f/${metadata.FNumber}` : "";
    const focalLength = typeof metadata.FocalLength === "number" ? `${metadata.FocalLength}mm` : stringValue(metadata.FocalLength);

    return {
      camera,
      lens: stringValue(metadata.LensModel),
      iso: stringValue(metadata.ISO),
      aperture,
      shutterSpeed: formatExposureTime(metadata.ExposureTime),
      focalLength,
      date,
      latitude: typeof metadata.latitude === "number" ? metadata.latitude : null,
      longitude: typeof metadata.longitude === "number" ? metadata.longitude : null,
    };
  } catch {
    return {};
  }
}

export default function AdminGalleryPage() {
  const { data, error, addPhoto, updatePhoto, deletePhoto, uploadAssets } = useCmsData();
  const { dictionary, locale } = useAdminI18n();
  const [selectedId, setSelectedId] = useState<string>("");
  const selectedPhoto = useMemo(() => data.photos.find((photo) => photo.id === selectedId) ?? null, [data.photos, selectedId]);
  const [draft, setDraft] = useState<Photo | null>(selectedPhoto);
  const [saveState, setSaveState] = useState("Saved");
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(selectedPhoto);
  }, [selectedPhoto]);

  function localizedSaveState(value: string) {
    if (value === "Saving") {
      return dictionary.editor.saving;
    }
    if (value === "Unsaved") {
      return dictionary.editor.unsaved;
    }
    return dictionary.editor.saved;
  }

  const localizedUntitledImage =
    locale === "zh-CN" ? "未命名图片" : locale === "zh-TW" ? "未命名圖片" : "Untitled Image";
  const aiMetadataFailed =
    locale === "zh-CN" ? "AI 图片元数据生成失败。" : locale === "zh-TW" ? "AI 圖片中繼資料生成失敗。" : "AI image metadata failed.";

  function updateDraft<Key extends keyof Photo>(key: Key, value: Photo[Key]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleUploads(files: File[]) {
    if (files.length === 0) {
      return;
    }

    setSaveState("Saving");
    try {
      const uploadedFiles = await uploadAssets(files, "gallery");
      let lastCreated: Photo | null = null;
      for (const [index, file] of files.entries()) {
        const uploaded = uploadedFiles[index];
        if (!uploaded) {
          continue;
        }
        const exif = await readExif(file);
        const photo = createPhoto();
        const nextPhoto = {
          ...photo,
          ...exif,
          title: file.name.replace(/\.[^.]+$/, "") || photo.title,
          imageUrl: uploaded.url,
          altText: file.name.replace(/\.[^.]+$/, "") || photo.title,
        };
        lastCreated = await addPhoto(nextPhoto);
      }
      if (lastCreated) {
        setSelectedId(lastCreated.id);
        setDraft(lastCreated);
      }
      setSaveState("Saved");
    } catch {
      setSaveState("Unsaved");
    }
  }

  async function handleNewPhoto() {
    const photo = createPhoto();
    setSaveState("Saving");
    try {
      const created = await addPhoto(photo);
      setSelectedId(created.id);
      setDraft(created);
      setSaveState("Saved");
    } catch {
      setSaveState("Unsaved");
    }
  }

  async function handleSave() {
    if (!draft) {
      return;
    }
    const nextPhoto = {
      ...draft,
      id: draft.id || slugifyTitle(draft.title) || `photo-${Date.now()}`,
      title: draft.title.trim() || localizedUntitledImage,
    };
    setSaveState("Saving");
    try {
      const saved = await updatePhoto(nextPhoto);
      setSelectedId(saved.id);
      setSaveState("Saved");
    } catch {
      setSaveState("Unsaved");
    }
  }

  async function handleDelete() {
    if (!draft) {
      return;
    }
    setSaveState("Saving");
    try {
      await deletePhoto(draft.id);
      setSelectedId("");
      setDraft(null);
      setSaveState("Saved");
    } catch {
      setSaveState("Unsaved");
    }
  }

  async function handleAiImageMetadata() {
    if (!draft) {
      return;
    }

    setSaveState("Saving");
    try {
      const response = await fetch("/api/admin/ai/image-understanding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId: draft.id,
          title: draft.title,
          description: draft.description,
          imageUrl: draft.imageUrl,
          location: draft.location,
          camera: draft.camera,
          lens: draft.lens,
        }),
      });
      const payload = (await response.json()) as {
        data?: { altText?: string; caption?: string; tags?: string[]; seoDescription?: string };
      };
      if (!response.ok) {
        throw new Error(aiMetadataFailed);
      }
      setDraft((current) =>
        current
          ? {
              ...current,
              altText: payload.data?.altText ?? current.altText,
              description: payload.data?.caption || payload.data?.seoDescription || current.description,
              tags: payload.data?.tags?.length ? payload.data.tags : current.tags,
            }
          : current,
      );
      setSaveState("Unsaved");
    } catch {
      setSaveState("Unsaved");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-margin-mobile pb-section-gap md:px-margin-desktop">
      <input
        ref={uploadInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/tiff,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.avif,.tif,.tiff,.heic,.heif"
        className="hidden"
        multiple
        type="file"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.currentTarget.value = "";
          if (files.length > 0) {
            void handleUploads(files);
          }
        }}
      />
      <header className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <h1 className="font-serif text-display-lg text-on-surface">{dictionary.gallery.title}</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">{dictionary.gallery.description}</p>
        </div>
        <button
          className="flex min-h-[160px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant/20 bg-surface-container-lowest/50 p-8 text-center transition hover:bg-surface-container-low md:w-96"
          type="button"
          onClick={() => uploadInputRef.current?.click()}
        >
          <CloudUpload aria-hidden className="mb-4 text-on-surface-variant" size={36} strokeWidth={1.4} />
          <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface">{dictionary.gallery.uploadImage}</p>
          <p className="mt-2 text-sm text-on-surface-variant">{localizedSaveState(saveState)}</p>
        </button>
      </header>

      <section className="mb-12 flex flex-col justify-between gap-6 border-b border-outline-variant/10 pb-6 lg:flex-row lg:items-center">
        <div className="flex gap-6 overflow-x-auto font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
          {[dictionary.gallery.allWorks, dictionary.gallery.featured, dictionary.gallery.drafts].map((tab, index) => (
            <button key={tab} className={index === 0 ? "border-b border-on-surface pb-1 text-on-surface" : "pb-1 transition hover:text-on-surface"} type="button">
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4">
          <label className="hidden items-center gap-3 rounded-full border border-outline-variant/20 bg-surface-container-low px-4 py-2 lg:flex">
            <Search aria-hidden className="text-on-surface-variant" size={15} />
            <input className="w-56 border-0 bg-transparent p-0 text-body-md text-on-surface focus:ring-0" placeholder={dictionary.gallery.searchPlaceholder} type="search" />
          </label>
          <AdminButton className="rounded-full" onClick={() => void handleNewPhoto()}>
            <Plus aria-hidden size={15} /> {dictionary.gallery.addImage}
          </AdminButton>
          <button className="hidden items-center gap-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition hover:text-on-surface md:flex" type="button">
            <SortDesc aria-hidden size={15} /> {dictionary.gallery.dateAdded}
          </button>
        </div>
      </section>
      {error ? (
        <div className="mb-6 border border-secondary/30 bg-secondary/10 px-4 py-3 font-mono text-label-mono uppercase tracking-widest text-secondary">
          {error}
        </div>
      ) : null}

      <div>
        {data.photos.length === 0 ? (
          <AdminCard className="border-outline-variant/15 bg-surface-container-lowest p-10 md:p-12">
            <h2 className="font-serif text-headline-md text-on-surface">{dictionary.gallery.emptyTitle}</h2>
            <p className="mt-3 max-w-lg text-body-md text-on-surface-variant">{dictionary.gallery.emptyDescription}</p>
          </AdminCard>
        ) : (
        <section className="columns-1 gap-6 md:columns-2 xl:columns-3">
          {data.photos.map((photo) => (
            <button
              key={photo.id}
              className="group mb-6 block w-full break-inside-avoid cursor-pointer text-left transition duration-500 ease-editorial hover:scale-[0.98] hover:opacity-80"
              type="button"
              onClick={() => setSelectedId(photo.id)}
            >
              <div className={`relative overflow-hidden rounded-[20px] bg-surface-container ${selectedId === photo.id ? "ring-1 ring-primary/50" : ""}`}>
                {photo.featured ? (
                  <span className="absolute right-4 top-4 z-10 rounded-full border border-outline-variant/20 bg-background/80 px-3 py-1 font-mono text-label-mono uppercase tracking-widest text-on-surface backdrop-blur">
                    {dictionary.gallery.featuredLabel}
                  </span>
                ) : null}
                <div className="aspect-[4/5] w-full bg-cover bg-center grayscale" style={{ backgroundImage: `url("${photo.imageUrl}")` }} />
              </div>
              <div className="mt-4 flex justify-between gap-4 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                <div>
                  <h2 className="font-serif text-2xl text-on-surface">{photo.title}</h2>
                  <p className="mt-1 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">{photo.location}</p>
                </div>
                <StatusBadge status={photo.status} />
              </div>
            </button>
          ))}
        </section>
        )}

        {draft ? (
          <div className="fixed inset-0 z-[70] bg-background/70 backdrop-blur-sm" role="presentation" onClick={() => setSelectedId("")}>
            <AdminCard
              aria-label="Image details drawer"
              className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-outline-variant/20 bg-surface p-8 shadow-2xl md:p-10"
              role="dialog"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-8 flex items-center justify-between border-b border-outline-variant/10 pb-6">
                <div>
                  <p className="label-mono mb-2">{dictionary.gallery.imageDetails}</p>
                  <h2 className="font-serif text-headline-md text-on-surface">{dictionary.gallery.assetMetadata}</h2>
                </div>
                <button className="text-on-surface-variant transition hover:text-on-surface" type="button" aria-label={dictionary.gallery.closeDetails} onClick={() => setSelectedId("")}>
                  <X aria-hidden size={20} />
                </button>
              </div>
              <div className="mb-10 overflow-hidden rounded-[20px] bg-surface-container">
                <div className="aspect-square w-full bg-cover bg-center grayscale" style={draft.imageUrl ? { backgroundImage: `url("${draft.imageUrl}")` } : undefined} />
              </div>
              <div className="space-y-8">
                <AdminInput label={dictionary.gallery.titleLabel} value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} />
                <AdminTextarea label={dictionary.gallery.descriptionLabel} rows={3} value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} />
                <AdminTextarea label={dictionary.gallery.altTextLabel} rows={2} value={draft.altText} onChange={(event) => updateDraft("altText", event.target.value)} />
                <AdminInput label={dictionary.gallery.imageUrlLabel} value={draft.imageUrl} onChange={(event) => updateDraft("imageUrl", event.target.value)} />
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <AdminInput label={dictionary.gallery.locationLabel} value={draft.location} onChange={(event) => updateDraft("location", event.target.value)} />
                  <AdminInput label={dictionary.gallery.dateLabel} type="date" value={draft.date} onChange={(event) => updateDraft("date", event.target.value)} />
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <AdminInput label={dictionary.gallery.cityLabel} value={draft.city} onChange={(event) => updateDraft("city", event.target.value)} />
                  <AdminInput label={dictionary.gallery.countryLabel} value={draft.country} onChange={(event) => updateDraft("country", event.target.value)} />
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <AdminInput label={dictionary.gallery.latitudeLabel} type="number" value={draft.latitude ?? ""} onChange={(event) => updateDraft("latitude", event.target.value ? Number(event.target.value) : null)} />
                  <AdminInput label={dictionary.gallery.longitudeLabel} type="number" value={draft.longitude ?? ""} onChange={(event) => updateDraft("longitude", event.target.value ? Number(event.target.value) : null)} />
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <AdminInput label={dictionary.gallery.cameraLabel} value={draft.camera} onChange={(event) => updateDraft("camera", event.target.value)} />
                  <AdminInput label={dictionary.gallery.lensLabel} value={draft.lens} onChange={(event) => updateDraft("lens", event.target.value)} />
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <AdminInput label={dictionary.gallery.isoLabel} value={draft.iso} onChange={(event) => updateDraft("iso", event.target.value)} />
                  <AdminInput label={dictionary.gallery.apertureLabel} value={draft.aperture} onChange={(event) => updateDraft("aperture", event.target.value)} />
                  <AdminInput label={dictionary.gallery.shutterSpeedLabel} value={draft.shutterSpeed} onChange={(event) => updateDraft("shutterSpeed", event.target.value)} />
                  <AdminInput label={dictionary.gallery.focalLengthLabel} value={draft.focalLength} onChange={(event) => updateDraft("focalLength", event.target.value)} />
                </div>
                <AdminInput label={dictionary.gallery.tagsLabel} value={tagString(draft)} onChange={(event) => updateDraft("tags", parseTags(event.target.value))} />
                <AdminButton variant="ghost" onClick={() => void handleAiImageMetadata()}>
                  {dictionary.gallery.generateAiAltText}
                </AdminButton>
                <label className="flex cursor-pointer items-center justify-between border-t border-outline-variant/10 pt-4">
                  <span>
                    <span className="block text-body-md text-on-surface">{dictionary.gallery.featuredLabel}</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{dictionary.gallery.featuredHint}</span>
                  </span>
                  <span className="relative inline-flex items-center">
                    <input checked={draft.featured} className="peer sr-only" type="checkbox" onChange={(event) => updateDraft("featured", event.target.checked)} />
                    <span className="h-6 w-11 rounded-full bg-surface-variant transition peer-checked:bg-primary" />
                    <span className="absolute left-1 top-1 size-4 rounded-full bg-on-surface transition peer-checked:translate-x-5 peer-checked:bg-background" />
                  </span>
                </label>
                <div className="flex flex-col justify-between gap-4 border-t border-outline-variant/10 pt-8 sm:flex-row">
                  <AdminButton className="text-secondary hover:text-secondary" variant="ghost" onClick={() => void handleDelete()}>
                    <Trash2 aria-hidden size={15} /> {dictionary.gallery.delete}
                  </AdminButton>
                  <div className="flex gap-4">
                    <AdminButton onClick={() => setDraft(selectedPhoto)}>{dictionary.gallery.cancel}</AdminButton>
                    <AdminButton variant="primary" onClick={() => void handleSave()}>{saveState === "Saving" ? dictionary.editor.saving : dictionary.gallery.saveChanges}</AdminButton>
                  </div>
                </div>
              </div>
            </AdminCard>
          </div>
        ) : null}
      </div>
    </main>
  );
}
