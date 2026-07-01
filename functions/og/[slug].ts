import { routeParam } from "../_lib/api";
import { renderOgImage } from "../_lib/og";
import { getArticleBySlug } from "../../src/data/site";

type OgPost = {
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  slug: string;
  published_at: string | null;
  category: string | null;
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
      `SELECT posts.title, posts.subtitle, posts.excerpt, posts.slug, posts.published_at, categories.name AS category
       FROM posts
       LEFT JOIN categories ON categories.id = posts.category_id
       WHERE posts.slug = ? AND posts.status = 'published'`,
    )
    .bind(slug)
    .first<OgPost>();
}

function findStaticPost(slug: string): OgPost | null {
  const article = getArticleBySlug(slug);
  if (!article) {
    return null;
  }

  return {
    title: article.title,
    subtitle: null,
    excerpt: article.excerpt,
    slug: article.slug,
    published_at: article.date,
    category: article.category,
  };
}

export const onRequestGet: PagesFunction<Env, "slug"> = async (context) => {
  const slug = routeParam(context, "slug");
  if (!slug) {
    return new Response("Not found", { status: 404 });
  }

  const post = (await findPost(context.env.DB, slug)) ?? findStaticPost(slug);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const origin = new URL(context.request.url).origin;
  const image = await renderOgImage(origin, {
    title: post.title,
    kicker: `${post.category || "Journal"} / ${formatDate(post.published_at)}`,
    subtitle: post.subtitle || post.excerpt || "Editorial notes on travel, photography, films, and quiet design systems.",
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
