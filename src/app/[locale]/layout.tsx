import { notFound } from "next/navigation";
import { isLocaleSegment, localeFromSegment } from "@/i18n/config";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "tw" }, { locale: "en" }];
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocaleSegment(locale)) {
    notFound();
  }
  void localeFromSegment(locale);
  return children;
}
