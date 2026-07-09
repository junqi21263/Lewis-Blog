import type { Metadata } from "next";
import AboutClient from "@/components/AboutClient";
import { localeFromSegment } from "@/i18n/config";
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

export default function LocalizedAboutPage() {
  return <AboutClient />;
}
