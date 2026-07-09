import type { Locale } from "@/i18n/config";

const adminDateLocales: Record<Locale, string> = {
  "zh-CN": "zh-Hans-CN",
  "zh-TW": "zh-Hant-TW",
  "en-US": "en-US",
};

export function formatAdminDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(adminDateLocales[locale], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(date);
}
