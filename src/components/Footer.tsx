"use client";

import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

export default function Footer() {
  const { locale, dictionary } = useI18n();
  const navItems = [
    { href: "/journal", label: dictionary.nav.journal },
    { href: "/gallery", label: dictionary.nav.gallery },
    { href: "/gear", label: dictionary.nav.gear },
    { href: "/films", label: dictionary.nav.films },
    { href: "/about", label: dictionary.nav.about },
  ];

  return (
    <footer className="border-t border-outline-variant/10 bg-background pb-16 pt-28 md:pb-margin-desktop md:pt-section-gap">
      <div className="editorial-shell grid gap-gutter md:grid-cols-[0.9fr_1fr_0.8fr]">
        <div>
          <Link className="mb-4 block font-serif text-headline-md tracking-tight text-on-background" href={withLocalePrefix("/", locale)}>
            Noah.
          </Link>
          <p className="max-w-sm text-body-md text-on-surface-variant">
            {dictionary.footer.description}
          </p>
        </div>
        <NewsletterSignup />
        <div className="grid grid-cols-2 gap-x-12 gap-y-6 md:flex md:gap-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition-colors duration-500 hover:text-secondary"
              href={withLocalePrefix(item.href, locale)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
