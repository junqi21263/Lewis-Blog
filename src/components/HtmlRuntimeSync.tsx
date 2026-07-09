"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { localeFromPathname } from "@/i18n/config";

type SiteSettingsPayload = {
  data?: {
    brand_json?: Record<string, { logoImageUrl?: string }>;
    logoImageUrl?: string;
  };
};

function resolveIconUrl(payload: SiteSettingsPayload) {
  const brandJson = payload.data?.brand_json;
  const brandIcon =
    brandJson?.["zh-CN"]?.logoImageUrl ||
    brandJson?.["zh-TW"]?.logoImageUrl ||
    brandJson?.["en-US"]?.logoImageUrl ||
    "";

  return brandIcon || payload.data?.logoImageUrl || "";
}

function withVersion(url: string) {
  if (!url) {
    return "";
  }

  const absoluteUrl = new URL(url, window.location.origin);
  absoluteUrl.searchParams.set("v", encodeURIComponent(url));
  return absoluteUrl.toString();
}

function upsertIconLink(rel: string, href: string, sizes?: string) {
  let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]${sizes ? `[sizes="${sizes}"]` : ""}`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    if (sizes) {
      link.sizes = sizes;
    }
    document.head.appendChild(link);
  }
  link.href = href;
}

export default function HtmlRuntimeSync() {
  const pathname = usePathname();

  useEffect(() => {
    const locale = localeFromPathname(pathname || "/");
    document.documentElement.lang = locale;
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/settings", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }
        return (await response.json()) as SiteSettingsPayload;
      })
      .then((payload) => {
        if (cancelled || !payload) {
          return;
        }

        const iconUrl = withVersion(resolveIconUrl(payload));
        if (!iconUrl) {
          return;
        }

        upsertIconLink("icon", iconUrl);
        upsertIconLink("shortcut icon", iconUrl);
        upsertIconLink("apple-touch-icon", iconUrl, "180x180");

        const manifestLink = document.head.querySelector<HTMLLinkElement>('link[rel="manifest"]');
        if (manifestLink) {
          const manifestUrl = new URL(manifestLink.href, window.location.origin);
          manifestUrl.searchParams.set("v", encodeURIComponent(iconUrl));
          manifestLink.href = manifestUrl.toString();
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
