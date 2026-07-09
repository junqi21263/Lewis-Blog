"use client";

import { useEffect } from "react";

type DynamicMetadataProps = {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
};

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

export default function DynamicMetadata({ title, description, canonicalUrl, ogImage }: DynamicMetadataProps) {
  useEffect(() => {
    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });
    if (ogImage) {
      upsertMeta('meta[property="og:image"]', { property: "og:image", content: ogImage });
      upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: ogImage });
    }
  }, [canonicalUrl, description, ogImage, title]);

  return null;
}
