"use client";

import Link from "next/link";
import { Bell, CircleUserRound, Eye, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AdminButton from "@/components/admin/AdminButton";
import AdminLanguageSwitcher from "@/components/admin/AdminLanguageSwitcher";
import PublishButton from "@/components/admin/PublishButton";
import SaveIndicator from "@/components/admin/SaveIndicator";
import { resolveBrandContent } from "@/components/brand/brandContent";
import { useCmsData } from "@/hooks/useCmsData";
import { useAdminI18n } from "@/i18n/admin";

type AccessSession = {
  authenticated: boolean;
  email: string;
  emailSource?: string;
  local: boolean;
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<AccessSession | null>(null);
  const { dictionary, locale } = useAdminI18n();
  const { data } = useCmsData();
  const brand = resolveBrandContent(data.siteSettings.brandJson, locale);
  const canPublishCurrentPost = pathname === "/admin/posts/new" || pathname === "/admin/posts/edit";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/access/session")
      .then(async (response): Promise<{ data?: AccessSession } | null> => {
        if (!response.ok) {
          return null;
        }
        return (await response.json()) as { data?: AccessSession };
      })
      .then((payload) => {
        if (!cancelled) {
          setSession(payload?.data ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="fixed right-0 top-0 z-40 flex h-24 w-full items-center justify-between border-b border-outline-variant/10 bg-background/90 py-0 pl-20 pr-margin-mobile backdrop-blur-md md:w-[calc(100%-16rem)] md:px-margin-desktop">
      <div className="flex items-center gap-6">
        <Link className="max-w-[42vw] truncate font-serif text-[26px] leading-none tracking-tight text-on-surface md:hidden" href="/admin">
          {brand.cmsTitle || brand.brandName}
        </Link>
        <div className="hidden items-center gap-3 border-b border-outline-variant/30 bg-transparent pb-2 transition focus-within:border-outline-variant/60 lg:flex">
          <Search aria-hidden className="text-on-surface-variant" size={15} strokeWidth={1.5} />
          <input
            className="w-72 border-0 bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:ring-0"
            placeholder={dictionary.topbar.searchPlaceholder}
            type="search"
          />
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 md:gap-3 xl:gap-4">
        <div className="hidden xl:block">
          <AdminLanguageSwitcher />
        </div>
        <SaveIndicator status={dictionary.editor.saved} />
        <Link className="hidden xl:block" href="/" target="_blank">
          <AdminButton className="rounded-full px-4 py-2" variant="ghost">
            <Eye aria-hidden size={15} strokeWidth={1.6} />
            {dictionary.topbar.previewSite}
          </AdminButton>
        </Link>
        {canPublishCurrentPost ? (
        <div className="hidden md:block">
          <PublishButton />
        </div>
        ) : null}
        <button className="hidden text-on-surface-variant transition hover:text-on-surface xl:block" type="button" aria-label={dictionary.topbar.notifications}>
          <Bell aria-hidden size={20} strokeWidth={1.5} />
        </button>
        <span className="hidden max-w-44 truncate font-mono text-[10px] uppercase tracking-widest text-on-surface-variant 2xl:inline">
          {session?.authenticated ? session.email : dictionary.topbar.accessRequired}
        </span>
        <button className="hidden text-on-surface-variant transition hover:text-on-surface xl:block" type="button" aria-label={dictionary.topbar.account}>
          <CircleUserRound aria-hidden size={21} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
