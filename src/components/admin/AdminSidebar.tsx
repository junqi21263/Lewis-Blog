"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Edit3, FileText, FolderTree, GalleryHorizontal, LayoutDashboard, Menu, PenSquare, Settings, Tags, UserRound, Video, X } from "lucide-react";
import { useState } from "react";
import { resolveBrandContent } from "@/components/brand/brandContent";
import { useCmsData } from "@/hooks/useCmsData";
import { useAdminI18n } from "@/i18n/admin";
import { cn } from "@/lib/utils";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { dictionary, locale } = useAdminI18n();
  const { data } = useCmsData();
  const brand = resolveBrandContent(data.siteSettings.brandJson, locale);
  const cmsTitle = brand.cmsTitle || brand.brandName;
  const cmsSubtitle = brand.cmsSubtitle;
  const brandText = brand.logoText || brand.brandName;
  const adminNavItems = [
    { href: "/admin", label: dictionary.nav.dashboard, icon: LayoutDashboard },
    { href: "/admin/posts", label: dictionary.nav.posts, icon: FileText },
    { href: "/admin/fragments", label: dictionary.nav.fragments, icon: PenSquare },
    { href: "/admin/categories", label: dictionary.nav.categories, icon: FolderTree },
    { href: "/admin/tags", label: dictionary.nav.tags, icon: Tags },
    { href: "/admin/gallery", label: dictionary.nav.gallery, icon: GalleryHorizontal },
    { href: "/admin/videos", label: dictionary.nav.videos, icon: Video },
    { href: "/admin/drafts", label: dictionary.nav.drafts, icon: Edit3 },
    { href: "/admin/about", label: dictionary.nav.about, icon: UserRound },
    { href: "/admin/gear", label: dictionary.nav.gear, icon: Camera },
    { href: "/admin/settings", label: dictionary.nav.settings, icon: Settings },
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-outline-variant/10 bg-background px-8 py-margin-desktop md:flex">
        <div className="mb-16">
          <Link className="block font-serif text-headline-md tracking-tight text-on-surface" href="/admin">
            {brand.brandDisplayMode === "imageLogo" && brand.logoImageUrl ? (
              <img alt={brand.logoAlt || cmsTitle} className="max-h-10 w-auto max-w-[190px] object-contain grayscale" src={brand.logoImageUrl} />
            ) : (
              cmsTitle
            )}
          </Link>
          {cmsSubtitle ? <p className="mt-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">{cmsSubtitle}</p> : null}
        </div>

        <nav className="flex flex-1 flex-col gap-6">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                className={cn(
                  "group -mr-8 flex origin-left scale-95 items-center gap-4 pr-8 text-body-md transition duration-300 hover:text-primary",
                  isActive
                    ? "border-r-2 border-primary font-medium text-on-surface"
                    : "text-on-surface-variant",
                )}
                href={item.href}
              >
                <Icon aria-hidden size={20} strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex items-center gap-4 border-t border-outline-variant/10 pt-8">
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-outline-variant/20 bg-surface-container-high font-serif text-headline-md text-on-surface">
            {brand.brandDisplayMode === "imageLogo" && brand.logoImageUrl ? (
              <img alt={brand.logoAlt || cmsTitle} className="h-full w-full object-cover grayscale" src={brand.logoImageUrl} />
            ) : (
              brandText.slice(0, 2)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-mono text-label-mono text-on-surface">Admin</p>
            <p className="truncate font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{brandText}</p>
          </div>
        </div>
      </aside>

      <button
        aria-expanded={isMobileOpen}
        aria-label={isMobileOpen ? "Close admin navigation" : "Open admin navigation"}
        className="fixed left-4 top-6 z-[60] grid size-11 place-items-center rounded-full border border-outline-variant/20 bg-background/90 text-on-surface-variant backdrop-blur-md md:hidden"
        type="button"
        onClick={() => setIsMobileOpen((value) => !value)}
      >
        {isMobileOpen ? <X aria-hidden size={18} /> : <Menu aria-hidden size={18} />}
      </button>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 bg-background/96 px-margin-mobile pb-10 pt-24 backdrop-blur-md md:hidden">
          <div className="mb-8 border-b border-outline-variant/10 pb-6 pl-14">
            <Link className="block font-serif text-headline-md tracking-tight text-on-surface" href="/admin" onClick={() => setIsMobileOpen(false)}>
              {cmsTitle}
            </Link>
            {cmsSubtitle ? <p className="mt-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">{cmsSubtitle}</p> : null}
          </div>
          <nav className="grid max-h-[calc(100vh-12rem)] gap-1 overflow-y-auto">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  className={cn(
                    "flex min-h-11 items-center gap-4 border-b border-outline-variant/10 font-mono text-[12px] uppercase tracking-widest transition",
                    isActive ? "text-on-surface" : "text-on-surface-variant",
                  )}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon aria-hidden size={18} strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </>
  );
}
