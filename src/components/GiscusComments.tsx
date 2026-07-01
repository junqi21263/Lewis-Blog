"use client";

import Script from "next/script";
import { creatorConfig } from "@/data/creator";

export default function GiscusComments() {
  const { category, categoryId, mapping, repo, repoId } = creatorConfig.giscus;

  if (!repo || !repoId || !categoryId) {
    return (
      <section className="mt-24 border-t border-outline-variant/10 pt-10">
        <div className="label-mono mb-4">Comments</div>
        <p className="text-body-md text-on-surface-variant">
          Giscus is ready to enable when the repository identifiers are configured.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-24 border-t border-outline-variant/10 pt-10">
      <div className="label-mono mb-8">Comments</div>
      <div className="giscus" />
      <Script
        crossOrigin="anonymous"
        data-category={category}
        data-category-id={categoryId}
        data-emit-metadata="0"
        data-input-position="top"
        data-lang="en"
        data-loading="lazy"
        data-mapping={mapping}
        data-reactions-enabled="1"
        data-repo={repo}
        data-repo-id={repoId}
        data-strict="0"
        data-theme="preferred_color_scheme"
        src="https://giscus.app/client.js"
        strategy="lazyOnload"
      />
    </section>
  );
}
