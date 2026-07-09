"use client";

import Link from "next/link";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

export default function NotFound() {
  const { locale, dictionary } = useI18n();

  return (
    <div className="editorial-shell flex min-h-[calc(100vh-18rem)] flex-col justify-center pb-28">
      <p className="label-mono mb-8">{dictionary.notFound.eyebrow}</p>
      <h1 className="max-w-3xl font-serif text-display-lg text-on-background md:text-display-xl">
        {dictionary.notFound.title}
      </h1>
      <p className="mt-8 max-w-xl text-body-lg text-on-surface-variant">
        {dictionary.notFound.description}
      </p>
      <div className="mt-10 flex flex-wrap gap-6">
        <Link className="label-mono transition hover:text-secondary" href={withLocalePrefix("/journal", locale)}>
          {dictionary.notFound.journalLink}
        </Link>
        <Link className="label-mono transition hover:text-secondary" href={withLocalePrefix("/", locale)}>
          {dictionary.notFound.homeLink}
        </Link>
      </div>
    </div>
  );
}
