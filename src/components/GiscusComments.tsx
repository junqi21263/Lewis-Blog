"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { creatorConfig } from "@/data/creator";
import { useI18n } from "@/i18n/useI18n";

const localizedTitles = {
  "zh-CN": "评论",
  "zh-TW": "留言",
  "en-US": "Discussion",
};

function canonicalizeDiscussionPath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized.replace(/^\/(?:zh|tw|en)(?=\/)/, "") || "/";
}

export default function GiscusComments() {
  const pathname = usePathname();
  const { locale } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const { category, categoryId, emitMetadata, inputPosition, lang, reactionsEnabled, repo, repoId, strict, theme } =
    creatorConfig.giscus;
  const discussionPath = useMemo(() => canonicalizeDiscussionPath(pathname || "/"), [pathname]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !repo || !repoId || !categoryId) {
      return;
    }

    container.replaceChildren();

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", discussionPath);
    script.setAttribute("data-strict", strict);
    script.setAttribute("data-reactions-enabled", reactionsEnabled);
    script.setAttribute("data-emit-metadata", emitMetadata);
    script.setAttribute("data-input-position", inputPosition);
    script.setAttribute("data-theme", theme);
    script.setAttribute("data-lang", lang);
    script.setAttribute("data-loading", "lazy");
    container.appendChild(script);

    return () => {
      container.replaceChildren();
    };
  }, [category, categoryId, discussionPath, emitMetadata, inputPosition, lang, reactionsEnabled, repo, repoId, strict, theme]);

  if (!repo || !repoId || !categoryId) {
    return null;
  }

  return (
    <section className="mt-20 border-t border-outline-variant/10 pt-10">
      <h2 className="mb-8 font-serif text-headline-md text-on-background">{localizedTitles[locale]}</h2>
      <div ref={containerRef} className="giscus min-h-24" />
    </section>
  );
}
