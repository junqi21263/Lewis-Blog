import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { localeFromSegment, withLocalePrefix } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildLocaleMetadata } from "@/i18n/metadata";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  const dictionary = getDictionary(locale);
  return buildLocaleMetadata(locale, "/about", dictionary.seo.aboutTitle, dictionary.seo.aboutDescription);
}

export default async function LocalizedAboutPage({ params }: LocalePageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  const dictionary = getDictionary(locale);

  return (
    <div className="pb-28 md:pb-section-gap">
      <section className="editorial-shell mb-20 grid gap-12 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <div className="label-mono mb-8">{dictionary.about.eyebrow}</div>
          <h1 className="font-serif text-display-lg text-on-background md:text-display-xl">{dictionary.about.title}</h1>
        </div>
        <p className="text-body-lg text-on-surface-variant md:col-span-5">{dictionary.about.description}</p>
      </section>

      <section className="mb-20 h-[56vh] min-h-[360px] w-full overflow-hidden">
        <Image
          alt="A quiet Nordic shoreline used as an about page editorial image."
          className="h-full w-full object-cover grayscale"
          height={1200}
          priority
          src="/images/northern-light.jpg"
          width={1800}
        />
      </section>

      <section className="editorial-shell grid gap-gutter md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="label-mono mb-4">{dictionary.about.sectionEyebrow}</div>
          <h2 className="font-serif text-headline-lg text-on-background">{dictionary.about.sectionTitle}</h2>
        </div>
        <div className="space-y-8 text-body-lg text-on-surface-variant md:col-span-7 md:col-start-6">
          <p>{dictionary.about.paragraphOne}</p>
          <p>{dictionary.about.paragraphTwo}</p>
          <Link className="label-mono inline-block transition-colors hover:text-secondary" href={withLocalePrefix("/journal", locale)}>
            {dictionary.about.readJournal}
          </Link>
        </div>
      </section>
    </div>
  );
}
