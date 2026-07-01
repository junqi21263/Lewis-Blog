import { creatorConfig } from "../../src/data/creator";
import { buildLanguageAlternates } from "../../src/i18n/metadata";
import { localizePostRecord, localeFromRoute, prefixedPath } from "../_lib/localization";
import type { Locale } from "../../src/i18n/config";

type ArticleRow = {
  id: string;
  title: string;
  title_json?: string | null;
  subtitle: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_json?: string | null;
  content: string;
  content_json?: string | null;
  cover_image_url: string | null;
  status: string;
  seo_title: string | null;
  seo_title_json?: string | null;
  seo_description: string | null;
  seo_description_json?: string | null;
  reading_time: number | null;
  published_at: string | null;
  updated_at: string | null;
  category_id: string | null;
  category: string | null;
  tag_names: string | null;
};

type StaticShell = {
  headAssets: string;
  bodyClass: string;
};

const {
  cloudflareWebAnalyticsToken,
  domains: analyticsDomains,
  umamiScriptUrl,
  umamiWebsiteId,
} = creatorConfig.analytics;

function renderAnalyticsScripts(enabled: boolean) {
  if (!enabled) return "";
  const scripts: string[] = [];

  if (cloudflareWebAnalyticsToken) {
    scripts.push(
      `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token: cloudflareWebAnalyticsToken })}'></script>`,
    );
  }

  if (umamiWebsiteId) {
    scripts.push(
      `<script defer src="${escapeAttribute(umamiScriptUrl)}" data-website-id="${escapeAttribute(umamiWebsiteId)}" data-domains="${escapeAttribute(analyticsDomains.join(","))}"></script>`,
    );
  }

  return scripts.join("");
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: unknown) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function routeParam(context: EventContext<Env, string, unknown>, name: string) {
  const value = context.params[name];
  return Array.isArray(value) ? value[0] : value;
}

function normalizeAssetUrl(value: string | null) {
  if (!value) {
    return "/images/open-road.jpg";
  }

  const r2Prefix = "r2://nordic-blog-assets/";
  if (value.startsWith(r2Prefix)) {
    return `/api/assets?key=${encodeURIComponent(value.slice(r2Prefix.length))}`;
  }

  return value;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Published";
  }

  try {
    return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getWordCount(content: string) {
  const withoutCode = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\[\^[^\]]+]:.*$/gm, " ")
    .replace(/\[\^[^\]]+]/g, " ");
  const words = withoutCode.match(/[\p{L}\p{N}’'-]+/gu);
  return words?.length ?? 0;
}

function getReadingMinutes(content: string) {
  return Math.max(1, Math.ceil(getWordCount(content) / 220));
}

function getToc(markdown: string) {
  return markdown
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim().match(/^(#{1,3})\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      id: slugifyHeading(match[2]),
      title: match[2],
      level: match[1].length,
    }));
}

function getFootnotes(markdown: string) {
  return markdown
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.match(/^\[\^([^\]]+)]:\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      id: `footnote-${slugifyHeading(match[1]) || match[1]}`,
      label: match[1],
      text: match[2],
    }));
}

function renderInline(markdown: string) {
  return escapeHtml(markdown)
    .replace(/\[\^([^\]]+)]/g, (_match, label: string) => `<sup id="footnote-ref-${escapeAttribute(label)}"><a class="ml-0.5 text-secondary" href="#footnote-${escapeAttribute(slugifyHeading(label) || label)}">${escapeHtml(label)}</a></sup>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function renderMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^\[\^[^\]]+]:\s+/.test(trimmed)) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.replace(/^```/, "").trim();
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      const code = escapeHtml(codeLines.join("\n"));
      html.push(`<figure class="my-12 overflow-hidden border border-outline-variant/10 bg-surface-container-low"><div class="flex items-center justify-between border-b border-outline-variant/10 px-5 py-3"><figcaption class="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">${escapeHtml(language || "Code")}</figcaption><button class="inline-grid size-8 place-items-center rounded-full text-on-surface-variant transition hover:text-on-background" type="button" data-copy-code aria-label="Copy code">Copy</button></div><pre class="overflow-x-auto p-6 font-mono text-sm leading-7 text-on-background"><code>${code}</code></pre></figure>`);
      index += 1;
      continue;
    }

    const imageMatch = trimmed.match(/^!\[(.*)]\((.*)\)$/);
    if (imageMatch) {
      const src = normalizeAssetUrl(imageMatch[2]);
      const alt = imageMatch[1];
      html.push(`<figure class="my-12"><button class="image-zoom group block w-full cursor-zoom-in text-left" type="button" data-image-zoom data-src="${escapeAttribute(src)}" data-alt="${escapeAttribute(alt)}" aria-label="Zoom image: ${escapeAttribute(alt)}"><img alt="${escapeAttribute(alt)}" class="w-full grayscale" src="${escapeAttribute(src)}"/></button><figcaption class="mt-4 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">${escapeHtml(alt)}</figcaption></figure>`);
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length <= 1 ? "h2" : "h3";
      const text = headingMatch[2];
      html.push(`<${level} id="${escapeAttribute(slugifyHeading(text))}" class="scroll-mt-36 mt-16 text-headline-lg">${renderInline(text)}</${level}>`);
      index += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      html.push(`<blockquote class="my-16 border-l pl-8"><p class="font-serif text-headline-md italic">${renderInline(quoteLines.join(" "))}</p></blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const tag = ordered ? "ol" : "ul";
      const className = ordered ? "list-decimal" : "list-disc";
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].trim();
        const match = ordered ? item.match(/^\d+\.\s+(.+)$/) : item.match(/^[-*]\s+(.+)$/);
        if (!match) {
          break;
        }
        items.push(`<li>${renderInline(match[1])}</li>`);
        index += 1;
      }
      html.push(`<${tag} class="${className}">${items.join("")}</${tag}>`);
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index].trim();
      if (/^(#{1,3})\s+/.test(next) || next.startsWith(">") || next.startsWith("```") || /^[-*]\s+/.test(next) || /^\d+\.\s+/.test(next) || /^\[\^[^\]]+]:\s+/.test(next)) {
        break;
      }
      paragraphLines.push(lines[index]);
      index += 1;
    }
    html.push(`<p>${renderInline(paragraphLines.join(" "))}</p>`);
  }

  return html.join("");
}

async function getStaticShell(context: EventContext<Env, string, unknown>): Promise<StaticShell> {
  const url = new URL("/journal/", context.request.url);
  const response = await context.env.ASSETS.fetch(new Request(url, { method: "GET" }));
  if (!response.ok) {
    return { headAssets: "", bodyClass: "antialiased" };
  }

  const html = await response.text();
  const headAssets = Array.from(
    html.matchAll(/<link[^>]+(?:rel="stylesheet"|rel="preload"[^>]+as="font")[^>]*>/g),
    (match) => match[0],
  ).join("");
  const bodyClass = html.match(/<body class="([^"]+)"/)?.[1] ?? "antialiased";
  return { headAssets, bodyClass };
}

async function findArticle(db: D1Database, slug: string) {
  return await db
    .prepare(
      `SELECT posts.*, categories.name AS category, GROUP_CONCAT(tags.name) AS tag_names
       FROM posts
       LEFT JOIN categories ON categories.id = posts.category_id
       LEFT JOIN post_tags ON post_tags.post_id = posts.id
       LEFT JOIN tags ON tags.id = post_tags.tag_id
       WHERE posts.slug = ?
       GROUP BY posts.id`,
    )
    .bind(slug)
    .first<ArticleRow>();
}

async function listPublishedArticles(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT posts.id, posts.title, posts.slug, posts.excerpt, posts.category_id,
              posts.title_json, posts.excerpt_json, posts.published_at, posts.updated_at, categories.name AS category,
              GROUP_CONCAT(DISTINCT tags.name) AS tag_names
       FROM posts
       LEFT JOIN categories ON categories.id = posts.category_id
       LEFT JOIN post_tags ON post_tags.post_id = posts.id
       LEFT JOIN tags ON tags.id = post_tags.tag_id
       WHERE posts.status = 'published'
       GROUP BY posts.id
       ORDER BY posts.published_at DESC, posts.updated_at DESC`,
    )
    .all<ArticleRow>();

  return result.results;
}

function renderNavigation(post: ArticleRow, articles: ArticleRow[], locale: Locale) {
  const sortDate = (item: ArticleRow) => item.published_at || item.updated_at || "";
  const index = articles.findIndex((item) => item.slug === post.slug);
  const currentTags = new Set(post.tag_names ? post.tag_names.split(",").filter(Boolean) : []);
  const previous = index >= 0 && index < articles.length - 1 ? articles[index + 1] : null;
  const next = index > 0 ? articles[index - 1] : null;
  const related = articles
    .filter((item) => item.slug !== post.slug)
    .map((item) => {
      const tags = item.tag_names ? item.tag_names.split(",").filter(Boolean) : [];
      const sharedTags = tags.filter((tag) => currentTags.has(tag)).length;
      const sameCategory = item.category_id && item.category_id === post.category_id ? 2 : 0;
      return { item, score: sharedTags + sameCategory };
    })
    .sort((a, b) => b.score - a.score || sortDate(b.item).localeCompare(sortDate(a.item)))
    .slice(0, 2)
    .map(({ item }) => item);

  const card = (label: string, item: ArticleRow | null) =>
    item
      ? `<a class="group border-t border-outline-variant/10 py-8 transition hover:-translate-y-1" href="${escapeAttribute(prefixedPath(locale, `/journal/${item.slug}/`))}"><div class="label-mono mb-3">${label}</div><h3 class="font-serif text-headline-md text-on-background transition group-hover:text-secondary">${escapeHtml(item.title)}</h3>${item.excerpt ? `<p class="mt-3 text-body-md text-on-surface-variant">${escapeHtml(item.excerpt)}</p>` : ""}</a>`
      : `<div class="border-t border-outline-variant/10 py-8 opacity-50"><div class="label-mono mb-3">${label}</div><p class="font-serif text-headline-md text-on-background">No entry.</p></div>`;

  return `<section class="mt-24 border-t border-outline-variant/10 pt-12"><div class="grid gap-gutter md:grid-cols-2">${card("Previous", previous)}${card("Next", next)}</div>${
    related.length > 0
      ? `<div class="mt-16"><div class="label-mono mb-8">Related Articles</div><div class="grid gap-gutter md:grid-cols-2">${related.map((item) => card(item.category || "Journal", item)).join("")}</div></div>`
      : ""
  }</section>`;
}

function renderHeader(locale: Locale) {
  const linkClass = "font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition-colors duration-500 hover:text-on-background";
  return `
    <header class="fixed top-0 z-50 w-full border-b border-outline-variant/10 bg-background/85 backdrop-blur-md">
      <nav class="flex w-full items-center justify-between px-margin-mobile py-6 md:px-margin-desktop md:py-8">
        <a class="font-serif text-headline-md tracking-tight text-on-background transition-colors duration-500 hover:text-secondary" href="${escapeAttribute(prefixedPath(locale, "/"))}">Noah.</a>
        <div class="hidden items-center gap-gutter md:flex">
          <a class="font-mono text-label-mono uppercase tracking-widest text-on-background transition-colors duration-500 hover:text-on-background" href="${escapeAttribute(prefixedPath(locale, "/journal/"))}">Journal</a>
          <a class="${linkClass}" href="${escapeAttribute(prefixedPath(locale, "/gallery/"))}">Gallery</a>
          <a class="${linkClass}" href="${escapeAttribute(prefixedPath(locale, "/gear/"))}">Gear</a>
          <a class="${linkClass}" href="${escapeAttribute(prefixedPath(locale, "/films/"))}">Films</a>
          <a class="${linkClass}" href="${escapeAttribute(prefixedPath(locale, "/about/"))}">About</a>
        </div>
        <button aria-label="Toggle theme" class="grid size-10 place-items-center rounded-full border border-outline-variant/20 text-on-surface-variant transition duration-500 hover:border-secondary/50 hover:text-secondary" type="button" data-theme-toggle>○</button>
      </nav>
    </header>`;
}

function renderFooter(locale: Locale) {
  return `
    <footer class="border-t border-outline-variant/10 bg-background pb-16 pt-28 md:pb-margin-desktop md:pt-section-gap">
      <div class="editorial-shell flex flex-col items-start justify-between gap-gutter md:flex-row">
        <div>
          <a class="mb-4 block font-serif text-headline-md tracking-tight text-on-background" href="${escapeAttribute(prefixedPath(locale, "/"))}">Noah.</a>
          <p class="max-w-sm text-body-md text-on-surface-variant">Editorial notes on travel, photography, films, and quiet design systems.</p>
        </div>
        <div class="grid grid-cols-2 gap-x-12 gap-y-6 md:flex md:gap-16">
          <a class="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition-colors duration-500 hover:text-secondary" href="${escapeAttribute(prefixedPath(locale, "/journal/"))}">Journal</a>
          <a class="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition-colors duration-500 hover:text-secondary" href="${escapeAttribute(prefixedPath(locale, "/gallery/"))}">Gallery</a>
          <a class="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition-colors duration-500 hover:text-secondary" href="${escapeAttribute(prefixedPath(locale, "/gear/"))}">Gear</a>
          <a class="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition-colors duration-500 hover:text-secondary" href="${escapeAttribute(prefixedPath(locale, "/films/"))}">Films</a>
          <a class="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition-colors duration-500 hover:text-secondary" href="${escapeAttribute(prefixedPath(locale, "/about/"))}">About</a>
        </div>
      </div>
    </footer>`;
}

function renderArticle(sourcePost: ArticleRow, request: Request, shell: StaticShell, sourceArticles: ArticleRow[], includeAnalytics: boolean, locale: Locale) {
  const post = localizePostRecord(sourcePost as unknown as Record<string, unknown>, locale) as ArticleRow;
  const articles = sourceArticles.map((item) => localizePostRecord(item as unknown as Record<string, unknown>, locale) as ArticleRow);
  const tags = post.tag_names ? post.tag_names.split(",").filter(Boolean) : [];
  const coverImage = normalizeAssetUrl(post.cover_image_url);
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || post.subtitle || `Read ${post.title}.`;
  const canonical = new URL(prefixedPath(locale, `/journal/${post.slug}/`), request.url).toString();
  const alternates = buildLanguageAlternates(`/journal/${post.slug}`);
  const hreflang = Object.entries(alternates)
    .map(([language, path]) => `<link rel="alternate" hreflang="${escapeAttribute(language)}" href="${escapeAttribute(new URL(path, request.url).toString())}"/>`)
    .join("");
  const toc = getToc(post.content);
  const footnotes = getFootnotes(post.content);
  const wordCount = getWordCount(post.content);
  const readingMinutes = getReadingMinutes(post.content);
  const tocHtml =
    toc.length > 0
      ? `<nav aria-label="Table of contents" class="border-t border-outline-variant/10 pt-8"><div class="label-mono mb-5">Contents</div><div class="flex gap-4 overflow-x-auto pb-2 md:block md:overflow-visible md:pb-0">${toc
          .map((item) => `<a class="block min-w-fit border-l border-outline-variant/10 py-2 pl-4 font-mono text-[11px] uppercase tracking-widest text-on-surface-variant transition hover:text-on-background ${item.level > 2 ? "md:ml-4" : ""}" href="#${escapeAttribute(item.id)}">${escapeHtml(item.title)}</a>`)
          .join("")}</div></nav>`
      : "";
  const footnotesHtml =
    footnotes.length > 0
      ? `<section class="mt-20 border-t border-outline-variant/10 pt-10"><div class="label-mono mb-6">Footnotes</div><ol class="space-y-4">${footnotes
          .map((footnote) => `<li id="${escapeAttribute(footnote.id)}" class="scroll-mt-36 text-body-md text-on-surface-variant"><span class="mr-3 font-mono text-label-mono text-on-background">[${escapeHtml(footnote.label)}]</span>${escapeHtml(footnote.text)}<a class="ml-3 text-on-background transition hover:text-secondary" href="#footnote-ref-${escapeAttribute(footnote.label)}">Back</a></li>`)
          .join("")}</ol></section>`
      : "";

  return `<!DOCTYPE html>
<html class="dark" lang="${escapeAttribute(locale)}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  ${shell.headAssets}
  <title>${escapeHtml(title)} | Noah. Studio Journal</title>
  <meta name="description" content="${escapeAttribute(description)}"/>
  <link rel="canonical" href="${escapeAttribute(canonical)}"/>
  ${hreflang}
  <meta property="og:locale" content="${escapeAttribute(locale === "zh-CN" ? "zh_CN" : locale === "zh-TW" ? "zh_TW" : "en_US")}"/>
  <meta property="og:title" content="${escapeAttribute(post.title)}"/>
  <meta property="og:description" content="${escapeAttribute(description)}"/>
  <meta property="og:url" content="${escapeAttribute(canonical)}"/>
  <meta property="og:site_name" content="Noah. Studio Journal"/>
  <meta property="og:type" content="article"/>
  <meta property="og:image" content="${escapeAttribute(new URL(`/og/${post.slug}`, request.url).toString())}"/>
  ${post.published_at ? `<meta property="article:published_time" content="${escapeAttribute(post.published_at)}"/>` : ""}
  ${tags.map((tag) => `<meta property="article:tag" content="${escapeAttribute(tag)}"/>`).join("")}
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${escapeAttribute(post.title)}"/>
  <meta name="twitter:description" content="${escapeAttribute(description)}"/>
  <meta name="twitter:image" content="${escapeAttribute(new URL(`/og/${post.slug}`, request.url).toString())}"/>
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: new URL(`/og/${post.slug}`, request.url).toString(),
    datePublished: post.published_at,
    author: { "@type": "Organization", name: "Noah. Studio" },
    publisher: { "@type": "Organization", name: "Noah. Studio Journal" },
    mainEntityOfPage: canonical,
    inLanguage: locale,
    keywords: tags.join(", "),
    wordCount,
  }).replace(/</g, "\\u003c")}</script>
</head>
<body class="${escapeAttribute(shell.bodyClass)}">
  <div class="pointer-events-none fixed left-0 top-0 z-[60] h-1 w-full bg-transparent">
    <div class="h-full w-full bg-outline-variant/40" data-reading-progress style="transform:scaleX(0);transform-origin:0 50%"></div>
  </div>
  ${renderHeader(locale)}
  <main class="page-fade min-h-screen pt-32">
    <article>
      <header class="mb-24 md:mb-section-gap">
        <div class="editorial-shell relative z-10 mb-14">
          <div class="label-mono mb-8">Journal - Editorial</div>
          <h1 class="mb-8 max-w-4xl font-serif text-display-lg text-on-background md:text-display-xl">${escapeHtml(post.title)}</h1>
          <div class="flex flex-wrap items-center gap-4 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
            <span>Noah. Studio</span>
            <span class="size-1 rounded-full bg-outline-variant"></span>
            <span>${escapeHtml(formatDate(post.published_at))}</span>
            <span class="size-1 rounded-full bg-outline-variant"></span>
            <span>${escapeHtml(readingMinutes)} min read</span>
            <span class="size-1 rounded-full bg-outline-variant"></span>
            <span>${escapeHtml(wordCount.toLocaleString("en-US"))} words</span>
          </div>
        </div>
        <div class="relative h-[60vh] min-h-[420px] w-full md:h-[80vh]">
          <img alt="${escapeAttribute(`${post.title} cover image`)}" class="h-full w-full object-cover grayscale" src="${escapeAttribute(coverImage)}"/>
          <div class="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        </div>
      </header>

      <div class="editorial-shell grid grid-cols-1 gap-gutter pb-28 md:grid-cols-12 md:pb-section-gap">
        <aside class="md:col-span-3 md:block">
          <div class="sticky top-40 flex flex-col gap-8">
            ${tocHtml}
            <div>
              <div class="label-mono mb-4">Tags</div>
              <div class="flex flex-wrap gap-2">
                ${tags.map((tag) => `<span class="rounded-full border border-outline-variant/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">${escapeHtml(tag)}</span>`).join("")}
              </div>
            </div>
            <div class="h-px w-full bg-outline-variant/20"></div>
            <a class="label-mono transition-colors hover:text-secondary" href="${escapeAttribute(prefixedPath(locale, "/journal/"))}">Back to journal</a>
          </div>
        </aside>

        <div class="md:col-span-7 md:col-start-5">
          ${post.subtitle || post.excerpt ? `<p class="mb-12 text-xl leading-9 text-on-surface-variant">${escapeHtml(post.subtitle || post.excerpt)}</p>` : ""}
          <div class="prose prose-invert max-w-none dark:prose-invert prose-p:font-body prose-p:text-body-lg prose-p:text-on-background prose-headings:font-serif prose-headings:font-normal prose-headings:text-on-background">
            ${renderMarkdown(post.content)}
          </div>
          ${footnotesHtml}
          <div class="mt-16 border-t border-outline-variant/10 pt-8">
            <div class="label-mono mb-3">Reading Completion</div>
            <p class="text-body-md text-on-surface-variant" data-reading-completion>Reach the end of the essay to mark it complete on this device.</p>
          </div>
          ${renderNavigation(post, articles, locale)}
          <section class="mt-24 border-t border-outline-variant/10 pt-10">
            <div class="label-mono mb-4">Comments</div>
            <p class="text-body-md text-on-surface-variant">Giscus is ready to enable when the repository identifiers are configured.</p>
          </section>
        </div>
      </div>
    </article>
  </main>
  ${renderFooter(locale)}
  <div class="fixed inset-0 z-[80] hidden items-center justify-center bg-background/95 p-margin-mobile backdrop-blur-md md:p-margin-desktop" data-image-modal>
    <button aria-label="Close lightbox" class="absolute right-6 top-6 grid size-11 place-items-center rounded-full border border-outline-variant/20 text-on-surface-variant transition hover:text-on-background" type="button" data-image-modal-close>×</button>
    <figure class="w-full max-w-5xl">
      <div class="relative mx-auto aspect-[4/3] max-h-[76vh] w-full">
        <div class="h-full w-full bg-contain bg-center bg-no-repeat" role="img" data-image-modal-frame></div>
      </div>
      <figcaption class="mt-6 text-center font-mono text-label-mono uppercase tracking-widest text-on-surface-variant" data-image-modal-caption></figcaption>
    </figure>
  </div>
  <script>
    (() => {
      const progress = document.querySelector("[data-reading-progress]");
      const completion = document.querySelector("[data-reading-completion]");
      const completionKey = ${JSON.stringify(`reading-complete:${post.slug}`)};
      const update = () => {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const value = height > 0 ? Math.min(window.scrollY / height, 1) : 0;
        if (progress) progress.style.transform = "scaleX(" + value + ")";
        if (completion && value >= 0.9) {
          window.localStorage.setItem(completionKey, "true");
          completion.textContent = "This essay is marked complete on this device.";
        }
      };
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      if (completion && window.localStorage.getItem(completionKey) === "true") {
        completion.textContent = "This essay is marked complete on this device.";
      }
      update();

      const toggle = document.querySelector("[data-theme-toggle]");
      toggle?.addEventListener("click", () => document.documentElement.classList.toggle("dark"));

      document.querySelectorAll("[data-copy-code]").forEach((button) => {
        button.addEventListener("click", async () => {
          const code = button.closest("figure")?.querySelector("code")?.textContent || "";
          await navigator.clipboard.writeText(code);
          button.textContent = "Copied";
          window.setTimeout(() => { button.textContent = "Copy"; }, 1400);
        });
      });

      const modal = document.querySelector("[data-image-modal]");
      const frame = document.querySelector("[data-image-modal-frame]");
      const caption = document.querySelector("[data-image-modal-caption]");
      document.querySelectorAll("[data-image-zoom]").forEach((button) => {
        button.addEventListener("click", () => {
          const src = button.getAttribute("data-src") || "";
          const alt = button.getAttribute("data-alt") || "";
          if (frame) {
            frame.style.backgroundImage = "url('" + src.replace(/'/g, "%27") + "')";
            frame.setAttribute("aria-label", alt);
          }
          if (caption) caption.textContent = alt;
          modal?.classList.remove("hidden");
          modal?.classList.add("flex");
        });
      });
      document.querySelector("[data-image-modal-close]")?.addEventListener("click", () => {
        modal?.classList.add("hidden");
        modal?.classList.remove("flex");
      });
    })();
  </script>
  ${renderAnalyticsScripts(includeAnalytics)}
</body>
</html>`;
}

export const onRequestGet: PagesFunction<Env, "slug"> = async (context) => {
  const slug = routeParam(context, "slug");
  const locale = localeFromRoute(context);
  if (!slug) {
    return await context.next();
  }

  const post = await findArticle(context.env.DB, slug);
  if (!post) {
    return await context.next();
  }

  if (post.status !== "published") {
    return new Response("Not found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const [shell, articles] = await Promise.all([getStaticShell(context), listPublishedArticles(context.env.DB)]);
  const includeAnalytics =
    (context.env as Env & { CF_PAGES_BRANCH?: string }).CF_PAGES_BRANCH !== "local" &&
    analyticsDomains.includes(new URL(context.request.url).hostname);
  return new Response(renderArticle(post, context.request, shell, articles, includeAnalytics, locale), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
};
