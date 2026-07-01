"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Edit3, FileText, GalleryHorizontal, LayoutDashboard, Settings, Video } from "lucide-react";
import { useAdminI18n } from "@/i18n/admin";
import { cn } from "@/lib/utils";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { dictionary } = useAdminI18n();
  const adminNavItems = [
    { href: "/admin", label: dictionary.nav.dashboard, icon: LayoutDashboard },
    { href: "/admin/posts", label: dictionary.nav.posts, icon: FileText },
    { href: "/admin/gallery", label: dictionary.nav.gallery, icon: GalleryHorizontal },
    { href: "/admin/videos", label: dictionary.nav.videos, icon: Video },
    { href: "/admin/drafts", label: dictionary.nav.drafts, icon: Edit3 },
    { href: "/admin/settings", label: dictionary.nav.settings, icon: Settings },
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-outline-variant/10 bg-background px-8 py-margin-desktop md:flex">
        <div className="mb-16">
          <Link className="block font-serif text-headline-md tracking-tight text-on-surface" href="/admin">
            Lewis Photograph Blog
          </Link>
          <p className="mt-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">Editorial CMS</p>
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
            N.
          </div>
          <div className="min-w-0">
            <p className="truncate font-mono text-label-mono text-on-surface">Admin</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Lewis.</p>
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-6 border-t border-outline-variant/10 bg-background/95 px-2 py-3 backdrop-blur-md md:hidden">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              aria-label={item.label}
              className={cn(
                "grid min-w-0 justify-items-center gap-1 px-1 font-mono text-[9px] uppercase tracking-widest transition",
                isActive ? "text-on-surface" : "text-on-surface-variant",
              )}
              href={item.href}
            >
              <Icon aria-hidden size={18} strokeWidth={1.5} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
