"use client";

import { CloudUpload, PlayCircle, Plus, Star, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminButton from "@/components/admin/AdminButton";
import AdminCard from "@/components/admin/AdminCard";
import AdminInput from "@/components/admin/AdminInput";
import AdminTextarea from "@/components/admin/AdminTextarea";
import StatusBadge from "@/components/admin/StatusBadge";
import type { Video } from "@/data/cms";
import { useCmsData } from "@/hooks/useCmsData";
import { useAdminI18n } from "@/i18n/admin";
import { slugifyTitle } from "@/lib/editor";
import { cn } from "@/lib/utils";

const platformOptions: Video["platform"][] = ["YouTube", "Bilibili", "Vimeo", "Local URL"];

function createVideo(): Video {
  return {
    id: `video-${Date.now()}`,
    title: "",
    description: "",
    coverImage: "",
    videoUrl: "",
    platform: "Local URL",
    status: "draft",
    featured: false,
    duration: "",
    tags: [],
  };
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function AdminVideosPage() {
  const { data, error, addVideo, updateVideo, deleteVideo, uploadAsset, uploadAssets } = useCmsData();
  const { dictionary } = useAdminI18n();
  const [selectedId, setSelectedId] = useState<string>("");
  const selectedVideo = useMemo(() => data.videos.find((video) => video.id === selectedId) ?? null, [data.videos, selectedId]);
  const [draft, setDraft] = useState<Video | null>(selectedVideo ?? null);
  const [saveState, setSaveState] = useState("Saved");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(selectedVideo ?? null);
    setSelectedId((current) => current || selectedVideo?.id || "");
  }, [selectedVideo]);

  function updateDraft<Key extends keyof Video>(key: Key, value: Video[Key]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleNewVideo() {
    const video = createVideo();
    setSaveState("Saving");
    try {
      const created = await addVideo(video);
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
    const nextVideo = {
      ...draft,
      id: draft.id || slugifyTitle(draft.title) || `video-${Date.now()}`,
      title: draft.title.trim() || "Untitled Video",
    };
    setSaveState("Saving");
    try {
      const saved = await updateVideo(nextVideo);
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
      await deleteVideo(draft.id);
      const next = data.videos.find((video) => video.id !== draft.id);
      setSelectedId(next?.id ?? "");
      setDraft(next ?? null);
      setSaveState("Saved");
    } catch {
      setSaveState("Unsaved");
    }
  }

  async function handleCoverUpload(file: File) {
    setSaveState("Saving");
    try {
      const uploaded = await uploadAsset(file, "videos");
      updateDraft("coverImage", uploaded.url);
      setSaveState("Saved");
    } catch {
      setSaveState("Unsaved");
    }
  }

  async function handleVideoUploads(files: File[]) {
    if (files.length === 0) {
      return;
    }

    setSaveState("Saving");
    try {
      const uploadedFiles = await uploadAssets(files, "videos");
      let lastCreated: Video | null = null;
      for (const [index, file] of files.entries()) {
        const uploaded = uploadedFiles[index];
        if (!uploaded) {
          continue;
        }
        const title = file.name.replace(/\.[^.]+$/, "") || "Untitled Video";
        lastCreated = await addVideo({
          ...createVideo(),
          title,
          videoUrl: uploaded.url,
          platform: "Local URL",
          tags: ["Local URL"],
        });
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

  return (
    <main className="grid h-auto gap-8 px-margin-mobile pb-section-gap md:px-margin-desktop xl:h-[calc(100vh-8rem)] xl:grid-cols-[minmax(0,1fr)_384px] xl:overflow-hidden">
      <input
        ref={coverInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.avif,.svg,.heic,.heif"
        className="hidden"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.currentTarget.value = "";
          if (file) {
            void handleCoverUpload(file);
          }
        }}
      />
      <input
        ref={videoInputRef}
        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,video/mpeg,.mp4,.m4v,.mov,.webm,.avi,.mkv,.mpeg,.mpg"
        className="hidden"
        multiple
        type="file"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.currentTarget.value = "";
          if (files.length > 0) {
            void handleVideoUploads(files);
          }
        }}
      />
      <section className="min-h-0 overflow-y-auto pr-0 xl:pr-2">
        <header className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
          <h1 className="font-serif text-display-lg text-on-surface">{dictionary.videos.title}</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">{dictionary.videos.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <AdminButton className="rounded-full" onClick={() => videoInputRef.current?.click()}>
            <CloudUpload aria-hidden size={15} />
            {dictionary.videos.uploadVideo}
          </AdminButton>
          <AdminButton className="rounded-full" onClick={() => void handleNewVideo()}>
            <Plus aria-hidden size={15} />
            {dictionary.videos.newVideo}
          </AdminButton>
        </div>
        </header>
        {error ? (
          <div className="mb-6 border border-secondary/30 bg-secondary/10 px-4 py-3 font-mono text-label-mono uppercase tracking-widest text-secondary">
            {error}
          </div>
        ) : null}

        {data.videos.length === 0 ? (
          <AdminCard className="border-outline-variant/15 bg-surface-container-lowest p-10 md:p-12">
            <h2 className="font-serif text-headline-md text-on-surface">{dictionary.videos.noFilmsTitle}</h2>
            <p className="mt-3 max-w-lg text-body-md text-on-surface-variant">{dictionary.videos.noFilmsDescription}</p>
          </AdminCard>
        ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-12">
          {data.videos.map((video, index) => (
            <AdminCard
              key={video.id}
              className={cn(
                "group cursor-pointer overflow-hidden bg-surface hover:border-primary/40",
                selectedId === video.id && "ring-1 ring-primary/50",
                index % 3 === 1 ? "xl:col-span-8" : "xl:col-span-4",
              )}
              onClick={() => setSelectedId(video.id)}
            >
              <div className={cn("relative overflow-hidden", index % 3 === 1 ? "aspect-[2/1]" : "aspect-video")}>
                <div className="h-full w-full bg-cover bg-center grayscale transition duration-700 group-hover:scale-105" style={{ backgroundImage: `url("${video.coverImage}")` }} />
                <div className="absolute inset-0 bg-black/20 transition group-hover:bg-transparent" />
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-outline-variant/20 bg-background/80 px-3 py-1 backdrop-blur-sm">
                  <PlayCircle aria-hidden size={14} />
                  <span className="font-mono text-label-mono text-on-surface">{video.platform}</span>
                </div>
                <div className="absolute bottom-4 right-4 rounded border border-white/10 bg-black/60 px-2 py-1 font-mono text-[10px] tracking-widest text-primary backdrop-blur-md">
                  {video.duration}
                </div>
              </div>
              <div className="p-6">
                <h2 className="mb-4 font-serif text-headline-md leading-tight text-on-surface transition group-hover:text-primary">{video.title}</h2>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{video.tags[0] ?? "Video"}</span>
                  {video.featured ? (
                    <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-primary">
                      <Star aria-hidden size={12} /> Featured
                    </span>
                  ) : (
                    <StatusBadge status={video.status} />
                  )}
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
        )}
      </section>

      <AdminCard className="min-h-0 flex-col overflow-hidden bg-surface-container-low xl:flex">
        {draft ? (
          <>
            <div className="flex items-center justify-between border-b border-outline-variant/10 p-8">
              <h2 className="font-serif text-2xl text-on-surface">{dictionary.videos.metadata}</h2>
              <button className="text-on-surface-variant transition hover:text-on-surface" type="button" aria-label={dictionary.videos.clearSelection} onClick={() => setSelectedId("")}>
                <X aria-hidden size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="mb-8 overflow-hidden rounded-lg border border-outline-variant/20">
                <div className="aspect-video w-full bg-cover bg-center grayscale" style={{ backgroundImage: `url("${draft.coverImage}")` }} />
              </div>
              <div className="space-y-8">
                <AdminInput label="Title" value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} />
                <AdminTextarea label="Description" rows={3} value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} />
                <AdminInput label="Cover Image" value={draft.coverImage} onChange={(event) => updateDraft("coverImage", event.target.value)} />
                <AdminButton onClick={() => coverInputRef.current?.click()}>{saveState === "Saving" ? "Uploading" : dictionary.videos.uploadCover}</AdminButton>
                <AdminInput label="Video URL" value={draft.videoUrl} onChange={(event) => updateDraft("videoUrl", event.target.value)} />
                <div className="grid grid-cols-[1fr_96px] gap-6">
                  <label className="block">
                    <span className="label-mono mb-2 block">Platform</span>
                    <select className="w-full border-0 border-b border-outline-variant/30 bg-transparent px-0 py-3 text-body-md text-on-surface focus:border-primary focus:ring-0" value={draft.platform} onChange={(event) => updateDraft("platform", event.target.value as Video["platform"])}>
                      {platformOptions.map((platform) => (
                        <option key={platform} className="bg-surface" value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </label>
                  <AdminInput className="text-center" label="Duration" value={draft.duration} onChange={(event) => updateDraft("duration", event.target.value)} />
                </div>
                <AdminInput label="Tags" value={draft.tags.join(", ")} onChange={(event) => updateDraft("tags", parseTags(event.target.value))} />
                <label className="flex cursor-pointer items-center justify-between border-t border-outline-variant/10 pt-4">
                  <span>
                    <span className="block text-body-md text-on-surface">Featured</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{dictionary.videos.featuredHint}</span>
                  </span>
                  <span className="relative inline-flex items-center">
                    <input checked={draft.featured} className="peer sr-only" type="checkbox" onChange={(event) => updateDraft("featured", event.target.checked)} />
                    <span className="h-6 w-11 rounded-full bg-surface-variant transition peer-checked:bg-primary" />
                    <span className="absolute left-1 top-1 size-4 rounded-full bg-on-surface transition peer-checked:translate-x-5 peer-checked:bg-background" />
                  </span>
                </label>
                <div className="flex justify-between gap-4 border-t border-outline-variant/10 pt-8">
                  <AdminButton className="text-secondary hover:text-secondary" variant="ghost" onClick={() => void handleDelete()}>
                    <Trash2 aria-hidden size={15} /> Delete
                  </AdminButton>
                  <div className="flex gap-4">
                    <AdminButton onClick={() => setDraft(selectedVideo ?? null)}>Cancel</AdminButton>
                    <AdminButton variant="primary" onClick={() => void handleSave()}>{saveState === "Saving" ? "Saving" : dictionary.videos.save}</AdminButton>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <h2 className="font-serif text-headline-md text-on-surface">{dictionary.videos.noSelectionTitle}</h2>
            <p className="mt-3 text-body-md text-on-surface-variant">{dictionary.videos.noSelectionDescription}</p>
          </div>
        )}
      </AdminCard>
    </main>
  );
}
