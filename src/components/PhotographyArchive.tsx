"use client";

import { Aperture, Grid3X3, Map, SlidersHorizontal, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { Photo } from "@/data/cms";
import {
  getArchiveValues,
  getExifRows,
  getPhotoCoordinate,
  groupPhotosByYear,
  photoCity,
  photoCountry,
  projectCoordinate,
  type PhotoArchiveKey,
} from "@/lib/photography";
import { cn } from "@/lib/utils";

type PhotographyArchiveProps = {
  photos: Photo[];
};

type ViewMode = "grid" | "map" | "timeline";

const archiveLabels: Record<PhotoArchiveKey, string> = {
  city: "City",
  country: "Country",
  camera: "Camera",
  lens: "Lens",
};

function matchesArchive(photo: Photo, key: PhotoArchiveKey, value: string) {
  if (!value) return true;
  if (key === "city") return photoCity(photo) === value;
  if (key === "country") return photoCountry(photo) === value;
  if (key === "camera") return (photo.camera || "Unknown") === value;
  return (photo.lens || "Unknown") === value;
}

function PhotoExif({ photo }: { photo: Photo }) {
  const rows = getExifRows(photo);

  if (rows.length === 0) {
    return null;
  }

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-outline-variant/10 pt-6">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{row.label}</dt>
          <dd className="mt-1 text-sm text-on-background">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PhotoLightbox({ photo, onClose }: { photo: Photo | null; onClose: () => void }) {
  if (!photo) {
    return null;
  }

  return (
    <div aria-modal="true" className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-md" role="dialog">
      <button
        aria-label="Close image details"
        className="absolute right-6 top-6 z-10 grid size-11 place-items-center rounded-full border border-outline-variant/20 text-on-surface-variant transition hover:text-on-background"
        type="button"
        onClick={onClose}
      >
        <X aria-hidden size={20} />
      </button>
      <div className="grid min-h-screen grid-cols-1 gap-gutter p-margin-mobile md:grid-cols-[minmax(0,1fr)_380px] md:p-margin-desktop">
        <figure className="flex min-h-[58vh] items-center justify-center">
          <Image
            alt={photo.altText || photo.description || photo.title}
            className="h-auto max-h-[80vh] w-auto object-contain grayscale"
            height={1200}
            sizes="(min-width: 768px) 66vw, 100vw"
            src={photo.imageUrl}
            width={1600}
          />
        </figure>
        <aside className="self-center border-t border-outline-variant/10 pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
          <p className="label-mono mb-5">{photo.location || photoCountry(photo)}</p>
          <h2 className="font-serif text-headline-lg text-on-background">{photo.title}</h2>
          {photo.description ? <p className="mt-5 text-body-md leading-8 text-on-surface-variant">{photo.description}</p> : null}
          <div className="my-8 flex flex-wrap gap-2">
            {photo.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-outline-variant/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                {tag}
              </span>
            ))}
          </div>
          <PhotoExif photo={photo} />
        </aside>
      </div>
    </div>
  );
}

function MapView({ photos, onSelect }: { photos: Photo[]; onSelect: (photo: Photo) => void }) {
  const plotted = photos
    .map((photo) => {
      const coordinate = getPhotoCoordinate(photo);
      if (!coordinate) return null;
      return { photo, coordinate, point: projectCoordinate(coordinate.latitude, coordinate.longitude) };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <section className="grid gap-gutter border-t border-outline-variant/10 pt-10 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="relative min-h-[420px] overflow-hidden border border-outline-variant/10 bg-surface-container-low">
        <div className="absolute inset-x-0 top-1/2 h-px bg-outline-variant/10" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-outline-variant/10" />
        <svg aria-hidden className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M6 56 C18 38 33 34 46 45 C58 55 63 31 76 27 C86 24 91 34 96 43" fill="none" stroke="currentColor" strokeWidth="0.25" />
          <path d="M14 70 C28 65 42 69 55 62 C69 55 79 61 90 53" fill="none" stroke="currentColor" strokeWidth="0.18" />
          <path d="M22 25 C38 17 49 25 61 18 C72 11 84 15 93 24" fill="none" stroke="currentColor" strokeWidth="0.16" />
        </svg>
        {plotted.map(({ photo, point }) => (
          <button
            key={photo.id}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            type="button"
            onClick={() => onSelect(photo)}
          >
            <span className="block size-3 rounded-full border border-on-background bg-background transition group-hover:scale-150" />
            <span className="pointer-events-none absolute left-5 top-1/2 hidden min-w-40 -translate-y-1/2 border border-outline-variant/10 bg-background/90 px-3 py-2 text-left backdrop-blur md:group-hover:block">
              <span className="block font-serif text-lg text-on-background">{photo.title}</span>
              <span className="label-mono mt-1 block">{photo.location}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {plotted.map(({ photo, coordinate }) => (
          <button key={photo.id} className="group w-full border-t border-outline-variant/10 py-5 text-left transition hover:-translate-y-1" type="button" onClick={() => onSelect(photo)}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-headline-md text-on-background group-hover:text-secondary">{photo.title}</h3>
                <p className="label-mono mt-2">{photoCity(photo)} - {photoCountry(photo)}</p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                {coordinate.latitude.toFixed(2)}, {coordinate.longitude.toFixed(2)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function TimelineView({ photos, onSelect }: { photos: Photo[]; onSelect: (photo: Photo) => void }) {
  const groups = groupPhotosByYear(photos);
  const years = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <section className="space-y-16 border-t border-outline-variant/10 pt-10">
      {years.map((year) => (
        <div key={year} className="grid gap-gutter md:grid-cols-[180px_1fr]">
          <div>
            <p className="sticky top-36 font-serif text-display-md text-on-background">{year}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {groups[year].map((photo) => (
              <button key={photo.id} className="group grid gap-5 border-t border-outline-variant/10 pt-6 text-left transition hover:-translate-y-1 md:grid-cols-[120px_1fr]" type="button" onClick={() => onSelect(photo)}>
                <div className="aspect-square overflow-hidden bg-surface-container-low">
                  <Image
                    alt={photo.altText || photo.title}
                    className="h-full w-full object-cover grayscale transition duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                    height={320}
                    sizes="120px"
                    src={photo.imageUrl}
                    width={320}
                  />
                </div>
                <div>
                  <p className="label-mono mb-3">{photo.date || "Undated"} - {photo.location}</p>
                  <h3 className="font-serif text-headline-md text-on-background">{photo.title}</h3>
                  <p className="mt-3 text-body-md text-on-surface-variant">{photo.camera || "Camera unknown"} / {photo.lens || "Lens unknown"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default function PhotographyArchive({ photos }: PhotographyArchiveProps) {
  const [mode, setMode] = useState<ViewMode>("grid");
  const [archiveKey, setArchiveKey] = useState<PhotoArchiveKey>("country");
  const [archiveValue, setArchiveValue] = useState("");
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const archiveValues = useMemo(() => getArchiveValues(photos, archiveKey), [archiveKey, photos]);
  const filteredPhotos = useMemo(() => photos.filter((photo) => matchesArchive(photo, archiveKey, archiveValue)), [archiveKey, archiveValue, photos]);

  return (
    <>
      <section className="mb-12 border-y border-outline-variant/10 py-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "grid", label: "Grid", icon: Grid3X3 },
              { id: "map", label: "Map", icon: Map },
              { id: "timeline", label: "Timeline", icon: Aperture },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={cn(
                    "inline-flex items-center gap-2 border border-outline-variant/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition hover:text-on-background",
                    mode === item.id ? "border-on-background text-on-background" : "text-on-surface-variant",
                  )}
                  type="button"
                  onClick={() => setMode(item.id as ViewMode)}
                >
                  <Icon aria-hidden size={14} /> {item.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="inline-flex items-center gap-2 label-mono">
              <SlidersHorizontal aria-hidden size={14} /> Archive
            </div>
            <select
              className="border border-outline-variant/20 bg-background px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-on-background"
              value={archiveKey}
              onChange={(event) => {
                setArchiveKey(event.target.value as PhotoArchiveKey);
                setArchiveValue("");
              }}
            >
              {Object.entries(archiveLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              className="border border-outline-variant/20 bg-background px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-on-background"
              value={archiveValue}
              onChange={(event) => setArchiveValue(event.target.value)}
            >
              <option value="">All {archiveLabels[archiveKey]}</option>
              {archiveValues.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {mode === "grid" ? (
        <section className="grid grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-3">
          {filteredPhotos.map((photo, index) => (
            <button key={photo.id} className={cn("group card-lift block w-full text-left", index % 3 === 0 && "md:row-span-2")} type="button" onClick={() => setActivePhoto(photo)}>
              <div className={cn("image-zoom relative mb-5", index % 3 === 0 ? "aspect-[4/5]" : index % 3 === 1 ? "aspect-[4/3]" : "aspect-square")}>
                <Image
                  alt={photo.altText || photo.description || photo.title}
                  className="h-full w-full object-cover grayscale transition duration-1000 group-hover:grayscale-0"
                  height={900}
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  src={photo.imageUrl}
                  width={720}
                />
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-serif text-headline-md text-on-background">{photo.title}</h3>
                  <p className="label-mono mt-2">{photo.location || `${photoCity(photo)} - ${photoCountry(photo)}`}</p>
                </div>
                <span className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-outline-variant/10 pt-4">
                {getExifRows(photo).slice(0, 4).map((row) => (
                  <div key={row.label}>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">{row.label}</div>
                    <div className="mt-1 text-xs text-on-background">{row.value}</div>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </section>
      ) : null}

      {mode === "map" ? <MapView photos={filteredPhotos} onSelect={setActivePhoto} /> : null}
      {mode === "timeline" ? <TimelineView photos={filteredPhotos} onSelect={setActivePhoto} /> : null}

      {filteredPhotos.length === 0 ? (
        <section className="border-t border-outline-variant/10 py-16">
          <h2 className="font-serif text-headline-lg text-on-background">No frames in this archive.</h2>
          <p className="mt-4 text-body-lg text-on-surface-variant">Change archive filters to continue browsing.</p>
        </section>
      ) : null}

      <PhotoLightbox photo={activePhoto} onClose={() => setActivePhoto(null)} />
    </>
  );
}
