"use client";

import Link from "next/link";
import { resolveFooterContent } from "@/components/footer/footerContent";
import { useCmsData } from "@/hooks/useCmsData";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

export default function Footer() {
  const { locale, dictionary } = useI18n();
  const { data } = useCmsData();
  const footer = resolveFooterContent(data.siteSettings.footerJson, locale);
  const navItems = [
    { href: "/journal", label: dictionary.nav.journal },
    { href: "/gallery", label: dictionary.nav.gallery },
    { href: "/gear", label: dictionary.nav.gear },
    { href: "/films", label: dictionary.nav.films },
    { href: "/about", label: dictionary.nav.about },
  ];

  return (
    <footer className="border-t border-outline-variant/10 bg-background py-14 md:py-24">
      <div className="editorial-shell grid gap-10 md:grid-cols-[minmax(0,0.65fr)_minmax(280px,0.35fr)] md:items-start md:gap-12">
        <div className="max-w-xl">
          <Link className="mb-5 block font-serif text-headline-md tracking-tight text-on-background transition-colors duration-500 hover:text-secondary" href={withLocalePrefix("/", locale)}>
            {footer.brand}
          </Link>
          <p className="max-w-md text-body-md text-on-surface-variant">{footer.description}</p>
          <div className="mt-8 space-y-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant md:mt-10">
            <p>{footer.copyright}</p>
            <p>{footer.location}</p>
          </div>
        </div>
        <nav aria-label={dictionary.nav.about} className="grid gap-y-3 md:ml-auto md:flex md:flex-col md:items-end md:gap-y-5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="flex min-h-11 items-center font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition-colors duration-500 hover:text-secondary md:min-h-0"
              href={withLocalePrefix(item.href, locale)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
