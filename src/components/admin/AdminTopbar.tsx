"use client";

import Link from "next/link";
import { Bell, CircleUserRound, Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";
import AdminButton from "@/components/admin/AdminButton";
import AdminLanguageSwitcher from "@/components/admin/AdminLanguageSwitcher";
import PublishButton from "@/components/admin/PublishButton";
import SaveIndicator from "@/components/admin/SaveIndicator";
import { useAdminI18n } from "@/i18n/admin";

type AccessSession = {
  authenticated: boolean;
  email: string;
  emailSource?: string;
  local: boolean;
};

export default function AdminTopbar() {
  const [session, setSession] = useState<AccessSession | null>(null);
  const { dictionary } = useAdminI18n();

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
    <header className="fixed right-0 top-0 z-40 flex h-24 w-full items-center justify-between border-b border-outline-variant/10 bg-background/90 px-margin-mobile backdrop-blur-md md:w-[calc(100%-16rem)] md:px-margin-desktop">
      <div className="flex items-center gap-6">
        <Link className="font-serif text-headline-md tracking-tight text-on-surface md:hidden" href="/admin">
          Lewis Photograph Blog
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

      <div className="flex items-center gap-3 md:gap-4">
        <div className="hidden lg:block">
          <AdminLanguageSwitcher />
        </div>
        <SaveIndicator status="Saved" />
        <Link className="hidden lg:block" href="/" target="_blank">
          <AdminButton className="rounded-full px-4 py-2" variant="ghost">
            <Eye aria-hidden size={15} strokeWidth={1.6} />
            {dictionary.topbar.previewSite}
          </AdminButton>
        </Link>
        <div className="hidden md:block">
          <PublishButton />
        </div>
        <button className="text-on-surface-variant transition hover:text-on-surface" type="button" aria-label={dictionary.topbar.notifications}>
          <Bell aria-hidden size={20} strokeWidth={1.5} />
        </button>
        <span className="hidden max-w-44 truncate font-mono text-[10px] uppercase tracking-widest text-on-surface-variant 2xl:inline">
          {session?.authenticated ? session.email : dictionary.topbar.accessRequired}
        </span>
        <button className="text-on-surface-variant transition hover:text-on-surface" type="button" aria-label={dictionary.topbar.account}>
          <CircleUserRound aria-hidden size={21} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
