"use client";

import { Play, X } from "lucide-react";
import { useState } from "react";
import type { Film } from "@/data/site";

type FilmCardProps = {
  film: Film;
};

export default function FilmCard({ film }: FilmCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="group card-lift block w-full text-left" type="button" onClick={() => setIsOpen(true)}>
        <div className="image-zoom relative mb-6 aspect-video">
          <div
            aria-label={film.poster.alt}
            className="h-full w-full bg-cover bg-center grayscale transition duration-1000 group-hover:scale-105 group-hover:grayscale-0"
            role="img"
            style={{ backgroundImage: `url("${film.poster.src}")` }}
          />
          <div className="absolute inset-0 grid place-items-center bg-background/10 transition duration-500 group-hover:bg-background/0">
            <span className="grid size-16 place-items-center rounded-full border border-on-background/40 bg-background/30 text-on-background backdrop-blur-md transition duration-500 group-hover:scale-105 group-hover:border-secondary">
              <Play aria-hidden fill="currentColor" size={20} strokeWidth={1.5} />
            </span>
          </div>
        </div>
        <div className="label-mono mb-3">
          {film.category} — {film.year} / {film.duration}
        </div>
        <h2 className="mb-3 font-serif text-headline-md text-on-background transition-colors duration-500 group-hover:text-secondary">
          {film.title}
        </h2>
        <p className="text-body-md text-on-surface-variant">{film.description}</p>
      </button>

      {isOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/95 p-margin-mobile backdrop-blur-md md:p-margin-desktop"
          role="dialog"
        >
          <button
            aria-label="Close video"
            className="absolute right-6 top-6 grid size-11 place-items-center rounded-full border border-outline-variant/20 text-on-surface-variant transition hover:text-on-background"
            type="button"
            onClick={() => setIsOpen(false)}
          >
            <X aria-hidden size={20} />
          </button>
          <div className="w-full max-w-5xl">
            <video className="aspect-video w-full bg-black" controls playsInline src={film.videoSrc} />
            <div className="mt-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <h3 className="font-serif text-headline-md text-on-background">{film.title}</h3>
              <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                {film.year} / {film.duration}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
