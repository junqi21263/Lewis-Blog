import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import StructuredData from "@/components/StructuredData";
import { localeFromSegment } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildLocaleMetadata, buildSiteStructuredData } from "@/i18n/metadata";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  const dictionary = getDictionary(locale);
  return buildLocaleMetadata(locale, "/", dictionary.seo.siteTitle, dictionary.seo.siteDescription);
}

export default async function LocalizedHomePage({ params }: LocalePageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);

  return (
    <>
      <StructuredData data={buildSiteStructuredData(locale)} />
      <HomeClient />
    </>
  );
}
