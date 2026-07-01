"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import CommandSearch from "@/components/CommandSearch";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { locale, dictionary } = useI18n();
  const navItems = [
    { href: "/", label: dictionary.nav.home },
    { href: "/journal", label: dictionary.nav.journal },
    { href: "/gallery", label: dictionary.nav.gallery },
    { href: "/gear", label: dictionary.nav.gear },
    { href: "/films", label: dictionary.nav.films },
    { href: "/about", label: dictionary.nav.about },
  ];

  return (
    <header className="fixed top-0 z-50 w-full border-b border-outline-variant/10 bg-background/85 backdrop-blur-md">
      <nav className="flex w-full items-center justify-between px-margin-mobile py-6 md:px-margin-desktop md:py-8">
        <Link
          className="font-serif text-headline-md tracking-tight text-on-background transition-colors duration-500 hover:text-secondary"
          href={withLocalePrefix("/", locale)}
          onClick={() => setIsOpen(false)}
        >
          Noah.
        </Link>

        <div className="hidden items-center gap-gutter md:flex">
          {navItems.map((item) => {
            const href = withLocalePrefix(item.href, locale);
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                className={cn(
                  "font-mono text-label-mono uppercase tracking-widest transition-colors duration-500 hover:text-on-background",
                  isActive ? "text-on-background" : "text-on-surface-variant",
                )}
                href={href}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <button
            aria-label="Search"
            className="grid size-10 place-items-center rounded-full text-on-surface-variant transition duration-500 hover:text-on-background"
            type="button"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search aria-hidden size={19} strokeWidth={1.5} />
          </button>
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            className="grid size-10 place-items-center rounded-full border border-outline-variant/20 text-on-surface-variant md:hidden"
            type="button"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X aria-hidden size={18} /> : <Menu aria-hidden size={18} />}
          </button>
        </div>
      </nav>

      {isOpen ? (
        <div className="border-t border-outline-variant/10 bg-background px-margin-mobile py-8 md:hidden">
          <div className="flex flex-col gap-6">
            <LanguageSwitcher className="w-fit" onSelect={() => setIsOpen(false)} />
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition-colors hover:text-on-background"
                href={withLocalePrefix(item.href, locale)}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <CommandSearch open={isSearchOpen} onOpen={() => setIsSearchOpen(true)} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
