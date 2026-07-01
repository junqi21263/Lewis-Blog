"use client";

import { useAdminI18n } from "@/i18n/admin";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export default function AdminLanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useAdminI18n();
  const items: Array<{ locale: Locale; label: string; aria: string }> = [
    { locale: "zh-CN", label: "简", aria: "简体中文" },
    { locale: "zh-TW", label: "繁", aria: "繁體中文" },
    { locale: "en-US", label: "EN", aria: "English" },
  ];

  return (
    <div
      aria-label="Admin language switcher"
      className={cn("inline-flex items-center rounded-full border border-outline-variant/20 bg-surface-container-lowest/50 p-1", className)}
      role="group"
    >
      {items.map((item) => {
        const active = locale === item.locale;

        return (
          <button
            key={item.locale}
            aria-label={item.aria}
            className={cn(
              "min-w-11 rounded-full px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.24em] transition duration-200",
              active ? "bg-primary text-background" : "text-on-surface-variant hover:text-on-background",
            )}
            type="button"
            onClick={() => setLocale(item.locale)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
