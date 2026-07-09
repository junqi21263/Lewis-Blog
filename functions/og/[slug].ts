import { routeParam } from "../_lib/api";
import { renderOgImage } from "../_lib/og";

type OgPost = {
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  slug: string;
  published_at: string | null;
  category: string | null;
  title_json?: string | null;
  excerpt_json?: string | null;
  seo_title_json?: string | null;
  seo_description_json?: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "Journal";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

async function findPost(db: D1Database, slug: string) {
  return await db
    .prepare(
      `SELECT posts.title, posts.subtitle, posts.excerpt, posts.slug, posts.published_at,
              posts.title_json, posts.excerpt_json, posts.seo_title_json, posts.seo_description_json,
              categories.name AS category
       FROM posts
       LEFT JOIN categories ON categories.id = posts.category_id
       WHERE posts.slug = ? AND posts.status = 'published'`,
    )
    .bind(slug)
    .first<OgPost>();
}

function localizedJson(value: string | null | undefined, fallback: string | null | undefined) {
  if (!value) {
    return fallback || "";
  }
  try {
    const parsed = JSON.parse(value) as Partial<Record<string, string>>;
    return parsed["zh-CN"] || parsed["en-US"] || fallback || "";
  } catch {
    return fallback || "";
  }
}

export const onRequestGet: PagesFunction<Env, "slug"> = async (context) => {
  const slug = routeParam(context, "slug");
  if (!slug) {
    return new Response("Not found", { status: 404 });
  }

  const post = await findPost(context.env.DB, slug);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const origin = new URL(context.request.url).origin;
  const image = await renderOgImage(origin, {
    title: localizedJson(post.seo_title_json, post.title_json ? localizedJson(post.title_json, post.title) : post.title),
    kicker: `${post.category || "Journal"} / ${formatDate(post.published_at)}`,
    subtitle:
      localizedJson(post.seo_description_json, null) ||
      post.subtitle ||
      localizedJson(post.excerpt_json, post.excerpt) ||
      "Editorial notes on travel, photography, films, and quiet design systems.",
    footerLabel: "Lewis Photograph Blog",
    titleSize: 82,
    centered: true,
  });

  return new Response(image, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
