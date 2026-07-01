import { NextResponse } from "next/server";
import { articles, siteDescription, siteName, siteUrl } from "@/data/site";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const items = articles
    .map((article) => {
      const link = `${siteUrl}/journal/${article.slug}`;
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
  <link>${siteUrl}</link>
  <description>${escapeXml(siteDescription)}</description>
  <language>zh-CN</language>
  ${items}
</channel>
</rss>`;

  return new NextResponse(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
