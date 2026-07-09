import { jsonResponse, methodNotAllowed, withErrorHandling } from "../_lib/api";
import { localeFromRequest, localizedValue, prefixedPath } from "../_lib/localization";

type PhotoRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  alt_text: string | null;
  taken_at: string | null;
  updated_at: string;
};

type PostImageRow = {
  id: string;
  slug: string;
  title: string;
  title_json: string | null;
  content: string;
  content_json: string | null;
  cover_image_url: string | null;
  cover_width: number | null;
  cover_height: number | null;
  published_at: string | null;
  created_at: string;
};

type CollectedGalleryImage = {
  id: string;
  imageUrl: string;
  alt: string;
  caption: string;
  sourceType: "gallery" | "article";
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  width: number | null;
  height: number | null;
};

function parseArticleImages(markdown: string) {
  const images: Array<{ alt: string; url: string }> = [];
  const markdownImagePattern = /!\[([^\]]*)]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const htmlImagePattern = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = markdownImagePattern.exec(markdown)) !== null) {
    images.push({ alt: match[1].trim(), url: match[2].trim() });
  }

  while ((match = htmlImagePattern.exec(markdown)) !== null) {
    const tag = match[0];
    const alt = tag.match(/\balt=["']([^"']*)["']/i)?.[1]?.trim() ?? "";
    images.push({ alt, url: match[1].trim() });
  }

  return images.filter((image) => image.url && !image.url.startsWith("data:"));
}

function uniqueByUrl(images: CollectedGalleryImage[]) {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (seen.has(image.imageUrl)) {
      return false;
    }
    seen.add(image.imageUrl);
    return true;
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const locale = localeFromRequest(context.request);
    const url = new URL(context.request.url);
    const limit = Math.min(120, Math.max(1, Number(url.searchParams.get("limit") || 72)));

    const [photos, posts] = await Promise.all([
      context.env.DB
        .prepare(
          `SELECT id, title, description, image_url, alt_text, taken_at, updated_at
           FROM photos
           WHERE image_url IS NOT NULL AND image_url != ''
           ORDER BY taken_at DESC, updated_at DESC
           LIMIT 120`,
        )
        .all<PhotoRow>(),
      context.env.DB
        .prepare(
          `SELECT id, slug, title, title_json, content, content_json, cover_image_url, cover_width, cover_height, published_at, created_at
           FROM posts
           WHERE status = 'published'
           ORDER BY COALESCE(NULLIF(published_at, ''), created_at) DESC, created_at DESC
           LIMIT 120`,
        )
        .all<PostImageRow>(),
    ]);

    const galleryImages: CollectedGalleryImage[] = photos.results.map((photo) => ({
      id: `gallery-${photo.id}`,
      imageUrl: photo.image_url,
      alt: photo.alt_text || photo.description || photo.title,
      caption: photo.description || photo.alt_text || photo.title,
      sourceType: "gallery",
      sourceId: photo.id,
      sourceTitle: photo.title,
      sourceUrl: prefixedPath(locale, "/gallery"),
      width: null,
      height: null,
    }));

    const articleImages: CollectedGalleryImage[] = posts.results.flatMap((post) => {
      const title = localizedValue(post.title, post.title_json, locale) || post.title;
      const content = localizedValue(post.content, post.content_json, locale) || post.content;
      const markdownImages = parseArticleImages(content).map((image, index) => ({
        id: `article-${post.id}-${index}`,
        imageUrl: image.url,
        alt: image.alt || title,
        caption: image.alt || title,
        width: null,
        height: null,
      }));
      const coverImage = post.cover_image_url
        ? [
            {
              id: `article-${post.id}-cover`,
              imageUrl: post.cover_image_url,
              alt: title,
              caption: title,
              width: post.cover_width,
              height: post.cover_height,
            },
          ]
        : [];

      return [...coverImage, ...markdownImages].map((image) => ({
        ...image,
        sourceType: "article" as const,
        sourceId: post.id,
        sourceTitle: title,
        sourceUrl: prefixedPath(locale, `/journal/${post.slug}`),
      }));
    });

    return jsonResponse({
      data: uniqueByUrl([...galleryImages, ...articleImages]).slice(0, limit),
    });
  });

export const onRequestPost: PagesFunction<Env> = () => methodNotAllowed();
