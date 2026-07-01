import { NextResponse } from "next/server";
import { articles, siteName, siteUrl } from "@/data/site";
import { localeFromSegment, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export const dynamic = "force-static";

type RouteProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "tw" }, { locale: "en" }];
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  const dictionary = getDictionary(locale);
  const items = articles
    .map((article) => {
      const link = `${siteUrl}${localePath(locale, `/journal/${article.slug}`)}`;
      const body = article.body
        .map((block) => ("content" in block ? block.content : ""))
        .filter(Boolean)
        .join("\n\n");

      return `<item>
  <title>${escapeXml(article.title)}</title>
  <link>${link}</link>
  <guid>${link}</guid>
  <description>${escapeXml(article.excerpt)}</description>
  <category>${escapeXml(article.category)}</category>
  <pubDate>${new Date(article.date).toUTCString()}</pubDate>
  <content:encoded><![CDATA[${body}]]></content:encoded>
</item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${escapeXml(siteName)}</title>
  <link>${siteUrl}${localePath(locale, "/")}</link>
  <description>${escapeXml(dictionary.seo.rssDescription)}</description>
  <language>${locale}</language>
  ${items}
</channel>
</rss>`;

  return new NextResponse(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
