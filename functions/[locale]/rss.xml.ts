type FeedPost = {
  title: string;
  title_json: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_json: string | null;
  content: string;
  content_json: string | null;
  published_at: string | null;
  category: string | null;
};

import { localeFromRoute, localizedValue, prefixedPath } from "../_lib/localization";

const siteUrl = "https://journal.lewislee.online";
const siteName = "Lewis Photograph Blog";
const siteDescriptionByLocale = {
  "zh-CN": "Lewis Photograph Blog 最新发布内容。",
  "zh-TW": "Lewis Photograph Blog 最新發佈內容。",
  "en-US": "Latest published essays from Lewis Photograph Blog.",
} as const;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const onRequestGet: PagesFunction<Env, "locale"> = async (context) => {
  const locale = localeFromRoute(context);
  const result = await context.env.DB
    .prepare(
      `SELECT posts.title, posts.title_json, posts.slug, posts.excerpt, posts.excerpt_json,
              posts.content, posts.content_json, posts.published_at, categories.name AS category
       FROM posts
       LEFT JOIN categories ON categories.id = posts.category_id
       WHERE posts.status = 'published'
       ORDER BY posts.published_at DESC, posts.updated_at DESC
       LIMIT 50`,
    )
    .all<FeedPost>();

  const items = result.results
    .map((post) => {
      const link = `${siteUrl}${prefixedPath(locale, `/journal/${post.slug}`)}`;
      const title = localizedValue(post.title, post.title_json, locale);
      const excerpt = localizedValue(post.excerpt, post.excerpt_json, locale);
      const content = localizedValue(post.content, post.content_json, locale);
      return `<item>
  <title>${escapeXml(title)}</title>
  <link>${link}</link>
  <guid>${link}</guid>
  <description>${escapeXml(excerpt || "")}</description>
  ${post.category ? `<category>${escapeXml(post.category)}</category>` : ""}
  <pubDate>${new Date(post.published_at || Date.now()).toUTCString()}</pubDate>
  <content:encoded><![CDATA[${content}]]></content:encoded>
</item>`;
    })
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${escapeXml(siteName)}</title>
  <link>${siteUrl}${prefixedPath(locale, "/")}</link>
  <description>${escapeXml(siteDescriptionByLocale[locale])}</description>
  <language>${locale}</language>
  ${items}
</channel>
</rss>`, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};
