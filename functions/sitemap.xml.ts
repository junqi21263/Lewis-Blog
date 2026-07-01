type SitemapPost = {
  slug: string;
  published_at: string | null;
  updated_at: string | null;
};

const siteUrl = "https://journal.lewislee.online";
const localeSegments = [
  { locale: "zh-CN", segment: "zh" },
  { locale: "zh-TW", segment: "tw" },
  { locale: "en", segment: "en" },
] as const;

function localizedPath(segment: string, path: string) {
  const normalized = path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return `/${segment}${normalized}`.replace(/\/+/g, "/");
}

function alternateLinks(path: string) {
  const links = localeSegments
    .map(({ locale, segment }) => `<xhtml:link rel="alternate" hreflang="${locale}" href="${siteUrl}${localizedPath(segment, path)}" />`)
    .join("");
  return `${links}<xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${localizedPath("zh", path)}" />`;
}

function urlEntry(path: string, segment: string, lastModified = new Date().toISOString(), priority = "0.8") {
  return `<url><loc>${siteUrl}${localizedPath(segment, path)}</loc>${alternateLinks(path)}<lastmod>${lastModified}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const result = await context.env.DB
    .prepare(
      `SELECT slug, published_at, updated_at
       FROM posts
       WHERE status = 'published'
       ORDER BY published_at DESC, updated_at DESC`,
    )
    .all<SitemapPost>();
  const staticRoutes = localeSegments.flatMap(({ segment }) =>
    ["/", "/journal", "/gallery", "/gear", "/films", "/about"].map((route) =>
      urlEntry(route, segment, new Date().toISOString(), route === "/" ? "1.0" : "0.8"),
    ),
  );
  const postRoutes = localeSegments.flatMap(({ segment }) =>
    result.results.map((post) => urlEntry(`/journal/${post.slug}`, segment, post.updated_at || post.published_at || new Date().toISOString(), "0.7")),
  );

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...staticRoutes, ...postRoutes].join("\n")}
</urlset>`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};
