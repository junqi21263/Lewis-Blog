"use client";

import EditorialImage from "@/components/media/EditorialImage";
import DynamicMetadata from "@/components/DynamicMetadata";
import { resolvePageCopy } from "@/components/pages/pageCopy";
import { getVisibleFragments, localizedFragment } from "@/data/cms";
import { siteUrl } from "@/data/site";
import { useCmsData } from "@/hooks/useCmsData";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

function formatFragmentDate(value: string, locale: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const formatter = new Intl.DateTimeFormat(
    locale === "zh-CN" ? "zh-Hans-CN" : locale === "zh-TW" ? "zh-Hant-TW" : "en-US",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  );

  return formatter.format(date);
}

function imageGridClass(count: number) {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 md:grid-cols-2";
  return "grid-cols-2";
}

export default function FragmentsClient() {
  const { data, isReady, error } = useCmsData();
  const { locale, dictionary } = useI18n();
  const copy = resolvePageCopy(data.siteSettings.pageCopyJson, "fragments", locale);
  const canonicalUrl = `${siteUrl}${withLocalePrefix("/fragments", locale)}`;
  const fragments = getVisibleFragments(data).map((fragment) => localizedFragment(fragment, locale));

  if (!isReady) {
    return <div className="editorial-shell pb-28 md:pb-section-gap" />;
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
            <article key={fragment.id} className="border-t border-outline-variant/10 py-8 md:py-12">
              <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)] md:gap-10">
                <div className="grid gap-3 text-on-surface-variant sm:grid-cols-3 md:block md:space-y-3">
                  <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-on-surface-variant">
                    {formatFragmentDate(fragment.publishedAt || fragment.createdAt, locale)}
                  </div>
                  {fragment.location ? (
                    <div>
                      <div className="label-mono mb-1">{dictionary.fragments.locationLabel}</div>
                      <div className="text-body-sm text-on-surface-variant">{fragment.location}</div>
                    </div>
                  ) : null}
                  {fragment.camera ? (
                    <div>
                      <div className="label-mono mb-1">{dictionary.fragments.cameraLabel}</div>
                      <div className="text-body-sm text-on-surface-variant">{fragment.camera}</div>
                    </div>
                  ) : null}
                  {fragment.mood ? (
                    <div>
                      <div className="label-mono mb-1">{dictionary.fragments.moodLabel}</div>
                      <div className="text-body-sm text-on-surface-variant">{fragment.mood}</div>
                    </div>
                  ) : null}
                </div>

                <div>
                  {fragment.content ? (
                    <p className="max-w-3xl text-[17px] leading-8 text-on-background md:text-[20px]">{fragment.content}</p>
                  ) : null}

                  {fragment.images.length > 0 ? (
                    <div className={`mt-7 grid gap-3 md:gap-4 ${imageGridClass(fragment.images.length)}`}>
                      {fragment.images.slice(0, 4).map((image, index) => (
                        <EditorialImage
                          key={`${fragment.id}-${image.url}-${index}`}
                          alt={image.alt || fragment.content || "Fragment image"}
                          aspectRatio={fragment.images.length === 1 ? "cinema" : "square"}
                          className="w-full"
                          frameClassName="w-full border border-outline-variant/10 bg-surface-container-low"
                          grayscale
                          revealColorOnHover
                          sizes="(min-width: 768px) 50vw, 100vw"
                          src={image.url}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
