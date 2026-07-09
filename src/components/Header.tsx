"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import CommandSearch from "@/components/CommandSearch";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { resolveBrandContent } from "@/components/brand/brandContent";
import { useCmsData } from "@/hooks/useCmsData";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [canWriteFragments, setCanWriteFragments] = useState(false);
  const { locale, dictionary } = useI18n();
  const { data } = useCmsData();
  const brand = resolveBrandContent(data.siteSettings.brandJson, locale);
  const brandText = brand.logoText || brand.brandName;
  const navItems = [
    { href: "/", label: dictionary.nav.home },
    { href: "/journal", label: dictionary.nav.journal },
    { href: "/fragments", label: dictionary.nav.fragments },
    { href: "/gallery", label: dictionary.nav.gallery },
    { href: "/gear", label: dictionary.nav.gear },
    { href: "/films", label: dictionary.nav.films },
    { href: "/about", label: dictionary.nav.about },
  ];

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/access/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }
        return (await response.json()) as { data?: { authenticated?: boolean } };
      })
      .then((payload) => {
        if (!cancelled) {
          setCanWriteFragments(Boolean(payload?.data?.authenticated));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCanWriteFragments(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full bg-background/90 backdrop-blur-md">
      <nav className="flex h-20 w-full items-center justify-between px-margin-mobile md:h-auto md:px-margin-desktop md:py-8">
        <Link
          className="min-w-0 font-serif text-[28px] leading-none tracking-tight text-on-background transition-colors duration-500 hover:text-secondary md:text-headline-md"
          href={withLocalePrefix("/", locale)}
          onClick={() => setIsOpen(false)}
        >
          {brand.brandDisplayMode === "imageLogo" && brand.logoImageUrl ? (
            <img alt={brand.logoAlt || brand.brandName} className="max-h-8 w-auto max-w-[150px] object-contain grayscale md:max-h-9 md:max-w-[180px]" src={brand.logoImageUrl} />
          ) : (
            <span className={brand.brandDisplayMode === "stackedText" ? "block max-w-[9rem] whitespace-pre-line leading-tight md:max-w-[11rem]" : "block max-w-[180px] truncate md:max-w-none"}>
              {brandText}
            </span>
          )}
        </Link>

        <div className="hidden items-center gap-gutter md:flex">
          {navItems.map((item) => {
            const href = withLocalePrefix(item.href, locale);
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.22em] transition duration-[250ms] ease-[ease] hover:text-on-background hover:opacity-100",
                  isActive ? "text-on-background opacity-80" : "text-on-surface-variant opacity-60",
                )}
                href={href}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {canWriteFragments ? (
            <Link
              aria-label="Write fragment"
              className="hidden size-10 place-items-center rounded-full border border-outline-variant/20 text-on-surface-variant transition duration-500 hover:text-on-background md:grid"
              href="/admin/fragments/new"
            >
              <Plus aria-hidden size={17} strokeWidth={1.5} />
            </Link>
          ) : null}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <button
            aria-label="Search"
            className="hidden size-10 place-items-center rounded-full text-on-surface-variant transition duration-500 hover:text-on-background md:grid"
            type="button"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search aria-hidden size={19} strokeWidth={1.5} />
          </button>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <button
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            className="grid size-11 place-items-center rounded-full border border-outline-variant/20 text-on-surface-variant md:hidden"
            type="button"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X aria-hidden size={18} /> : <Menu aria-hidden size={18} />}
          </button>
        </div>
      </nav>

      {isOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-20 overflow-y-auto border-t border-outline-variant/10 bg-background/98 px-margin-mobile py-8 backdrop-blur-md md:hidden">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-outline-variant/10 pb-6">
            <LanguageSwitcher className="w-fit" onSelect={() => setIsOpen(false)} />
            <div className="flex items-center gap-3">
              <button
                aria-label="Search"
                className="grid size-11 place-items-center rounded-full border border-outline-variant/20 text-on-surface-variant"
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsSearchOpen(true);
                }}
              >
                <Search aria-hidden size={18} strokeWidth={1.5} />
              </button>
              <ThemeToggle />
            </div>
          </div>
          <div className="flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="flex min-h-11 items-center border-b border-outline-variant/10 font-mono text-[12px] uppercase tracking-[0.22em] text-on-surface-variant opacity-75 transition duration-[250ms] hover:text-on-background hover:opacity-100"
                href={withLocalePrefix(item.href, locale)}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {canWriteFragments ? (
              <Link
                className="mt-6 flex min-h-11 items-center gap-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition-colors hover:text-on-background"
                href="/admin/fragments/new"
                onClick={() => setIsOpen(false)}
              >
                + {locale === "zh-CN" ? "写碎片" : locale === "zh-TW" ? "寫碎片" : "Write Fragment"}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
      <CommandSearch open={isSearchOpen} onOpen={() => setIsSearchOpen(true)} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
