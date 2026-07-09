"use client";

import { useMemo, useState } from "react";
import DynamicMetadata from "@/components/DynamicMetadata";
import EditorialImage from "@/components/media/EditorialImage";
import EditorialPageSkeleton from "@/components/loading/EditorialPageSkeleton";
import { resolvePageCopy } from "@/components/pages/pageCopy";
import StructuredData from "@/components/StructuredData";
import { type GearCategory } from "@/data/cms";
import { siteUrl } from "@/data/site";
import { withLocalePrefix } from "@/i18n/config";
import { resolveLocalizedText, resolveLocalizedTextArray } from "@/i18n/content";
import { useI18n } from "@/i18n/useI18n";
import { cn } from "@/lib/utils";
import { useCmsData } from "@/hooks/useCmsData";

const categories: Array<GearCategory | "All"> = ["All", "Camera", "Lens", "Phone", "Drone", "Audio", "Accessories"];

export default function GearClient() {
  const { locale } = useI18n();
  const { data, isReady, error } = useCmsData();
  const copy = resolvePageCopy(data.siteSettings.pageCopyJson, "gear", locale);
  const [category, setCategory] = useState<GearCategory | "All">("All");
  const canonicalUrl = `${siteUrl}${withLocalePrefix("/gear", locale)}`;
  const categoryLabels: Record<GearCategory | "All", string> =
    locale === "zh-CN"
      ? { All: "全部", Camera: "相机", Lens: "镜头", Phone: "手机", Drone: "无人机", Audio: "音频", Accessories: "配件" }
      : locale === "zh-TW"
        ? { All: "全部", Camera: "相機", Lens: "鏡頭", Phone: "手機", Drone: "無人機", Audio: "音訊", Accessories: "配件" }
        : { All: "All", Camera: "Camera", Lens: "Lens", Phone: "Phone", Drone: "Drone", Audio: "Audio", Accessories: "Accessories" };
  const archiveUsesLabel = locale === "zh-CN" ? "归档使用次数" : locale === "zh-TW" ? "歸檔使用次數" : "Archive Uses";
  const statusLabel = locale === "zh-CN" ? "状态" : locale === "zh-TW" ? "狀態" : "Status";
  const archiveYearFallback = locale === "zh-CN" ? "归档" : locale === "zh-TW" ? "歸檔" : "Archive";

  const items = useMemo(
    () =>
      data.gearItems.map((item) => ({
        ...item,
        name: resolveLocalizedText(item.nameJson, locale, ""),
        description: resolveLocalizedText(item.descriptionJson, locale, ""),
        imageAlt: resolveLocalizedText(item.imageAltJson, locale, ""),
        tags: resolveLocalizedTextArray(item.tagsJson, locale, []),
      })),
    [data.gearItems, locale],
  );

  const visibleItems = useMemo(
    () => (category === "All" ? items : items.filter((item) => item.category === category)),
    [category, items],
  );

  const description = copy.description;

  if (!isReady) {
    return <EditorialPageSkeleton />;
  }

  return (
    <div className="editorial-shell pb-24 md:pb-section-gap" data-pagefind-body>
      <DynamicMetadata canonicalUrl={canonicalUrl} description={description} title={copy.title} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          url: canonicalUrl,
          name: copy.title,
          description,
          inLanguage: locale,
        }}
      />

      <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-[0.85fr_1fr] md:items-end md:gap-8">
        <div>
          <div className="label-mono mb-5 md:mb-8">{copy.eyebrow}</div>
          <h1 className="font-serif text-[clamp(40px,12vw,64px)] leading-[1.04] text-on-background md:text-display-xl">{copy.title}</h1>
        </div>
        <p className="max-w-2xl text-body-md text-on-surface-variant md:text-body-lg">{copy.description}</p>
      </header>

      <div className="mb-10 flex gap-2 overflow-x-auto border-y border-outline-variant/10 py-5 md:mb-12 md:py-6">
        {categories.map((item) => (
          <button
            key={item}
            className={cn(
              "min-h-11 min-w-fit border border-outline-variant/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition hover:text-on-background",
              category === item ? "border-on-background text-on-background" : "text-on-surface-variant",
            )}
            type="button"
            onClick={() => setCategory(item)}
          >
            {categoryLabels[item]}
          </button>
        ))}
      </div>

      {error ? (
        <div className="mb-8 border border-secondary/20 bg-secondary/8 px-4 py-3 font-mono text-label-mono uppercase tracking-widest text-secondary">
          {error}
        </div>
      ) : null}

      {visibleItems.length === 0 ? (
        <section className="border-t border-outline-variant/10 py-14">
          <h2 className="font-serif text-headline-lg text-on-background">
            {copy.emptyTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
            {error || copy.emptyDescription}
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-gutter md:grid-cols-2">
          {visibleItems.map((item, index) => (
            <article key={item.id} className="group grid gap-5 border-t border-outline-variant/10 pt-7 transition hover:-translate-y-1 md:gap-6 lg:grid-cols-[180px_1fr]">
              {item.imageUrl ? (
                <EditorialImage
                  alt={item.imageAlt || item.name || item.maker}
                  aspectRatio={index % 2 === 0 ? "square" : "portrait"}
                  fit="cover"
                  height={720}
                  revealColorOnHover
                  sizes="(min-width: 1024px) 180px, (min-width: 768px) 50vw, 100vw"
                  src={item.imageUrl}
                  width={720}
                />
              ) : (
                <div className={cn("overflow-hidden bg-surface-container-low", index % 2 === 0 ? "aspect-square" : "aspect-[4/5]")}>
                  <div className="h-full w-full bg-surface-container-high" />
                </div>
              )}
              <div>
                <div className="label-mono mb-4">
                  {categoryLabels[item.category]} - {item.year || archiveYearFallback}
                </div>
                <h2 className="font-serif text-[34px] leading-tight text-on-background md:text-headline-lg">
                  {[item.maker, item.name].filter(Boolean).join(" ").trim() || item.name || item.maker}
                </h2>
                {item.description ? <p className="mt-4 text-body-md leading-8 text-on-surface-variant">{item.description}</p> : null}
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-outline-variant/10 pt-5">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{archiveUsesLabel}</div>
                    <div className="mt-1 font-serif text-headline-md text-on-background">{item.archiveUses}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{statusLabel}</div>
                    <div className="mt-2 text-sm text-on-background">{item.status}</div>
                  </div>
                </div>
                {item.tags.length > 0 ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={`${item.id}-${tag}`} className="rounded-full border border-outline-variant/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
