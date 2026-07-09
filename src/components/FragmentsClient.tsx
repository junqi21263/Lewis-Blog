"use client";

import DynamicMetadata from "@/components/DynamicMetadata";
import FragmentCard from "@/components/fragments/FragmentCard";
import EditorialPageSkeleton from "@/components/loading/EditorialPageSkeleton";
import { resolvePageCopy } from "@/components/pages/pageCopy";
import { getVisibleFragments, localizedFragment } from "@/data/cms";
import { siteUrl } from "@/data/site";
import { useCmsData } from "@/hooks/useCmsData";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

export default function FragmentsClient() {
  const { data, isReady, error } = useCmsData();
  const { locale, dictionary } = useI18n();
  const copy = resolvePageCopy(data.siteSettings.pageCopyJson, "fragments", locale);
  const weatherLabel = locale === "zh-CN" ? "天气" : locale === "zh-TW" ? "天氣" : "Weather";
  const labels = {
    location: dictionary.fragments.locationLabel,
    weather: weatherLabel,
    camera: dictionary.fragments.cameraLabel,
    mood: dictionary.fragments.moodLabel,
  };
  const canonicalUrl = `${siteUrl}${withLocalePrefix("/fragments", locale)}`;
  const fragments = getVisibleFragments(data).map((fragment) => localizedFragment(fragment, locale));

  if (!isReady) {
    return <EditorialPageSkeleton />;
  }

  return (
    <div className="editorial-shell pb-24 md:pb-section-gap" data-pagefind-body>
      <DynamicMetadata canonicalUrl={canonicalUrl} description={copy.description} title={copy.title} />
      <header className="mb-10 border-b border-outline-variant/10 pb-7 pt-4 md:mb-14 md:pb-10 md:pt-10">
        <div className="label-mono mb-4">{copy.eyebrow}</div>
        <h1 className="max-w-[12ch] font-serif text-[clamp(40px,12vw,58px)] leading-[1.04] text-on-background md:text-[56px] lg:text-[68px]">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-2xl text-body-md text-on-surface-variant md:text-body-lg">{copy.description}</p>
      </header>

      {error || fragments.length === 0 ? (
        <section className="border-t border-outline-variant/10 py-16">
          <div className="label-mono mb-5">{dictionary.nav.fragments}</div>
          <h2 className="max-w-2xl font-serif text-headline-lg text-on-background">{copy.emptyTitle}</h2>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">{copy.emptyDescription}</p>
        </section>
      ) : (
        <section>
          {fragments.map((fragment) => (
            <FragmentCard
              key={fragment.id}
              fragment={{
                id: fragment.id,
                content: fragment.content,
                location: fragment.location,
                weather: fragment.weather,
                camera: fragment.camera,
                mood: fragment.mood,
                date: fragment.publishedAt || fragment.createdAt,
                images: fragment.images.map((image) => ({ url: image.url, alt: image.alt })),
              }}
              labels={labels}
              locale={locale}
            />
          ))}
        </section>
      )}
    </div>
  );
}
