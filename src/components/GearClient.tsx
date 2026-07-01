"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { gearItems, type GearCategory } from "@/data/gear";
import { useCmsData } from "@/hooks/useCmsData";
import { useI18n } from "@/i18n/useI18n";
import { cn } from "@/lib/utils";

const categories: Array<GearCategory | "All"> = ["All", "Camera", "Lens", "Phone", "Drone", "Audio", "Accessories"];

export default function GearClient() {
  const { dictionary } = useI18n();
  const { data } = useCmsData();
  const [category, setCategory] = useState<GearCategory | "All">("All");
  const usage = useMemo(() => {
    const map = new Map<string, number>();
    for (const photo of data.photos) {
      for (const value of [photo.camera, photo.lens]) {
        const normalized = value.toLowerCase();
        if (!normalized) continue;
        for (const item of gearItems) {
          if (normalized.includes(item.name.toLowerCase()) || normalized.includes(item.maker.toLowerCase())) {
            map.set(item.id, (map.get(item.id) ?? 0) + 1);
          }
        }
      }
    }
    return map;
  }, [data.photos]);
  const visibleItems = category === "All" ? gearItems : gearItems.filter((item) => item.category === category);

  return (
    <div className="editorial-shell pb-28 md:pb-section-gap">
      <header className="mb-16 grid gap-8 md:grid-cols-[0.85fr_1fr] md:items-end">
        <div>
          <div className="label-mono mb-8">{dictionary.gear.eyebrow}</div>
          <h1 className="font-serif text-display-lg text-on-background md:text-display-xl">{dictionary.gear.title}</h1>
        </div>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">
          {dictionary.gear.description}
        </p>
      </header>

      <div className="mb-12 flex gap-2 overflow-x-auto border-y border-outline-variant/10 py-6">
        {categories.map((item) => (
          <button
            key={item}
            className={cn(
              "min-w-fit border border-outline-variant/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition hover:text-on-background",
              category === item ? "border-on-background text-on-background" : "text-on-surface-variant",
            )}
            type="button"
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-1 gap-gutter md:grid-cols-2">
        {visibleItems.map((item, index) => (
          <article key={item.id} className="group grid gap-6 border-t border-outline-variant/10 pt-8 transition hover:-translate-y-1 lg:grid-cols-[180px_1fr]">
            <div className={cn("image-zoom aspect-[4/5]", index % 2 === 0 && "lg:aspect-square")}>
              <Image
                alt={`${item.maker} ${item.name}`}
                className="h-full w-full object-cover grayscale transition duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                height={720}
                sizes="(min-width: 1024px) 180px, (min-width: 768px) 50vw, 100vw"
                src={item.image}
                width={720}
              />
            </div>
            <div>
              <div className="label-mono mb-4">{item.category} - {item.years}</div>
              <h2 className="font-serif text-headline-lg text-on-background">{item.maker} {item.name}</h2>
              <p className="mt-4 text-body-md leading-8 text-on-surface-variant">{item.description}</p>
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-outline-variant/10 pt-5">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Archive Uses</div>
                  <div className="mt-1 font-serif text-headline-md text-on-background">{usage.get(item.id) ?? 0}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Maker</div>
                  <div className="mt-2 text-sm text-on-background">{item.maker}</div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {item.notes.map((note) => (
                  <span key={note} className="rounded-full border border-outline-variant/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
