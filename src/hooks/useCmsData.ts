"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { aboutImageDefaults } from "@/components/about/imagePresentation";
import { normalizeCoverDisplayMode, normalizeFocalPoint } from "@/components/article/coverPresentation";
import { normalizeBrandJson } from "@/components/brand/brandContent";
import { normalizeFooterJson } from "@/components/footer/footerContent";
import { normalizeHomepageJson } from "@/components/home/homepageContent";
import {
  createEmptyAboutPage,
  defaultCategories,
  defaultCmsData,
  defaultTags,
  type CmsData,
  type Category,
  type Fragment,
  type FragmentTranslationLocks,
  type GearItem,
  type SitePage,
  type Photo,
  type Post,
  type SiteSettings,
  type Tag,
  type TranslationLocks,
  type Video,
} from "@/data/cms";
import { normalizePageCopyJson } from "@/components/pages/pageCopy";
import { parseLocalizedText, parseLocalizedTextArray, stringifyLocalizedText, stringifyLocalizedTextArray, type LocalizedTextMap } from "@/i18n/content";
import { localeFromPathname, type Locale } from "@/i18n/config";
import { slugifyTitle } from "@/lib/editor";

type ApiEnvelope<T> = {
  data: T;
  meta?: {
    warnings?: string[];
  };
};

type ApiPost = {
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
  cover_display_mode?: string | null;
  cover_focal_x?: number | null;
  cover_focal_y?: number | null;
  cover_width?: number | null;
  cover_height?: number | null;
  cover_aspect_ratio?: number | null;
  status: Post["status"];
  category_id: string | null;
  featured: boolean | number;
  pinned: boolean | number;
  seo_title: string | null;
  seo_title_json?: string | null;
  seo_description: string | null;
  seo_description_json?: string | null;
  translation_locks_json?: string | null;
  reading_time: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  tags?: string[];
};

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number | null;
};

type ApiTag = {
  id: string;
  name: string;
  slug: string;
  post_count?: number | null;
};

type ApiPhoto = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  alt_text?: string | null;
  location: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  taken_at: string | null;
  camera: string | null;
  lens: string | null;
  iso?: string | null;
  aperture?: string | null;
  shutter_speed?: string | null;
  focal_length?: string | null;
  tags?: string[];
  featured: boolean | number;
  created_at: string;
  updated_at: string;
};

type ApiFragmentImage = {
  url: string;
  alt_json?: string | null;
  caption_json?: string | null;
  width?: number | null;
  height?: number | null;
  sort_order?: number | null;
};

type ApiFragment = {
  id: string;
  content?: string | null;
  content_json?: string | null;
  location?: string | null;
  location_json?: string | null;
  images_json?: string | null;
  camera?: string | null;
  mood?: string | null;
  status: Post["status"];
  is_public: boolean | number;
  translation_locks_json?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
};

type ApiVideo = {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  video_url: string;
  platform: Video["platform"];
  duration: string | null;
  featured: boolean | number;
  created_at: string;
  updated_at: string;
};

type ApiSitePage = {
  id: string;
  page_key: "about";
  content_json: string;
  seo_json: string;
  content?: Record<string, string>;
  seo?: Record<string, string>;
  created_at: string;
  updated_at: string;
};

type ApiSiteSettings = Partial<Omit<SiteSettings, "brandJson" | "footerJson" | "homepageJson" | "pageCopyJson">> & {
  brand_json?: unknown;
  brandJson?: unknown;
  footer_json?: unknown;
  footerJson?: unknown;
  homepage_json?: unknown;
  homepageJson?: unknown;
  page_copy_json?: unknown;
  pageCopyJson?: unknown;
};

type ApiFeaturedImage = {
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

type ApiGearItem = {
  id: string;
  name?: string;
  name_json: string;
  description?: string;
  description_json: string;
  category: GearItem["category"];
  maker: string;
  year: string;
  status: GearItem["status"];
  archive_uses: number;
  image_url: string;
  image_alt?: string;
  image_alt_json: string;
  tags?: string[];
  tags_json: string;
  sort_order: number;
  is_featured: boolean | number;
  created_at: string;
  updated_at: string;
};

type UploadResult = {
  key: string;
  url: string;
  size: number;
  content_type: string;
  width?: number;
  height?: number;
  aspect_ratio?: number;
};
type UploadManyResult = {
  files: UploadResult[];
};

type RequestScope = "admin" | "public";
type SaveOptions = {
  generateTranslations?: boolean;
  regenerateLocales?: Locale[];
};
type SiteSettingsSaveOptions = {
  translateFooterFrom?: Locale;
  translateHomepageFrom?: Locale;
  translatePageCopyFrom?: Locale;
};
type SaveResponse<T> = {
  data: T;
  warnings: string[];
};

const defaultSiteSettings = defaultCmsData.siteSettings;

function siteSettingsFromApi(settings: ApiSiteSettings | null | undefined): SiteSettings {
  const {
    brand_json: brandJsonSnake,
    brandJson,
    footer_json: footerJsonSnake,
    footerJson,
    homepage_json: homepageJsonSnake,
    homepageJson,
    page_copy_json: pageCopyJsonSnake,
    pageCopyJson,
    ...rest
  } = settings ?? {};

  const normalizedBrandJson = normalizeBrandJson(brandJsonSnake ?? brandJson ?? defaultSiteSettings.brandJson);
  const legacyLogoImageUrl = typeof rest.logoImageUrl === "string" ? rest.logoImageUrl : "";

  return {
    ...defaultSiteSettings,
    ...rest,
    brandJson: legacyLogoImageUrl
      ? {
          "zh-CN": { ...normalizedBrandJson["zh-CN"], logoImageUrl: normalizedBrandJson["zh-CN"].logoImageUrl || legacyLogoImageUrl },
          "zh-TW": { ...normalizedBrandJson["zh-TW"], logoImageUrl: normalizedBrandJson["zh-TW"].logoImageUrl || legacyLogoImageUrl },
          "en-US": { ...normalizedBrandJson["en-US"], logoImageUrl: normalizedBrandJson["en-US"].logoImageUrl || legacyLogoImageUrl },
        }
      : normalizedBrandJson,
    footerJson: normalizeFooterJson(footerJsonSnake ?? footerJson ?? defaultSiteSettings.footerJson),
    homepageJson: normalizeHomepageJson(homepageJsonSnake ?? homepageJson ?? defaultSiteSettings.homepageJson),
    pageCopyJson: normalizePageCopyJson(pageCopyJsonSnake ?? pageCopyJson ?? defaultSiteSettings.pageCopyJson),
  };
}

function siteSettingsToApi(settings: SiteSettings, options?: SiteSettingsSaveOptions) {
  const { brandJson, footerJson, homepageJson, pageCopyJson, ...rest } = settings;

  return {
    ...rest,
    brand_json: normalizeBrandJson(brandJson),
    footer_json: normalizeFooterJson(footerJson),
    homepage_json: normalizeHomepageJson(homepageJson),
    page_copy_json: normalizePageCopyJson(pageCopyJson),
    ...(options?.translateFooterFrom ? { footer_translate_from: options.translateFooterFrom } : {}),
    ...(options?.translateHomepageFrom ? { homepage_translate_from: options.translateHomepageFrom } : {}),
    ...(options?.translatePageCopyFrom ? { page_copy_translate_from: options.translatePageCopyFrom } : {}),
  };
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Network request failed.";
}

function parseTranslationLocks(value: unknown): TranslationLocks {
  if (typeof value !== "string") {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as TranslationLocks;
  } catch {
    return {};
  }
}

function parseFragmentTranslationLocks(value: unknown): FragmentTranslationLocks {
  if (typeof value !== "string") {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as FragmentTranslationLocks;
  } catch {
    return {};
  }
}

async function apiRequest<T>(path: string, init?: RequestInit) {
  const envelope = await apiRequestEnvelope<T>(path, init);
  return envelope.data;
}

async function apiRequestEnvelope<T>(path: string, init?: RequestInit) {
  let response: Response;
  try {
    response = await fetch(path, {
      cache: "no-store",
      ...init,
      headers: {
        ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    throw new Error(normalizeError(error));
  }

  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  let payload: Partial<ApiEnvelope<T>> & { error?: { message?: string } } = {};

  if (text && contentType.includes("application/json")) {
    try {
      payload = JSON.parse(text) as Partial<ApiEnvelope<T>> & { error?: { message?: string } };
    } catch {
      throw new Error(`Expected JSON from ${path}, but received malformed JSON.`);
    }
  }

  const fallbackMessage =
    response.status === 401
      ? "Cloudflare Access login is required for this admin request."
      : response.status === 403
        ? "Your Cloudflare Access account is not allowed to perform this action."
        : response.status >= 500
          ? "The server returned an internal error. Check the Functions logs."
          : `Request failed with ${response.status}.`;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? fallbackMessage);
  }

  if (!contentType.includes("application/json")) {
    if (path.startsWith("/api/admin/")) {
      throw new Error("Expected JSON from the protected admin API, but received HTML. Cloudflare Access is likely intercepting this request.");
    }
    throw new Error(`Expected JSON from ${path}, but received ${contentType || "an unknown response type"}.`);
  }

  return {
    data: payload.data as T,
    meta: payload.meta,
  };
}

function buildTagsFromPosts(posts: ApiPost[]) {
  const byId = new Map(defaultTags.map((tag) => [tag.id, tag]));

  for (const post of posts) {
    for (const label of post.tags ?? []) {
      const id = slugifyTitle(label);
      if (id && !byId.has(id)) {
        byId.set(id, { id, name: label, slug: id });
      }
    }
  }

  return [...byId.values()];
}

function categoryFromApi(category: ApiCategory): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    icon: category.icon ?? "",
    color: category.color ?? "",
    sortOrder: category.sort_order ?? 0,
  };
}

function tagFromApi(tag: ApiTag): Tag {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    postCount: tag.post_count ?? 0,
  };
}

function categoryToApi(category: Category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug || slugifyTitle(category.name),
    description: category.description ?? "",
    icon: category.icon ?? "",
    color: category.color ?? "",
    sort_order: category.sortOrder ?? 0,
  };
}

function tagToApi(tag: Tag) {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug || slugifyTitle(tag.name),
  };
}

function normalizeAssetUrl(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }
  const prefix = "r2://nordic-blog-assets/";
  if (value.startsWith(prefix)) {
    return `/api/assets?key=${encodeURIComponent(value.slice(prefix.length))}`;
  }
  return value;
}

function deriveCity(location: string | null | undefined) {
  return (location ?? "").split(",")[0]?.trim() ?? "";
}

function deriveCountry(location: string | null | undefined) {
  const parts = (location ?? "").split(",");
  return parts.length > 1 ? parts[parts.length - 1].trim() : "";
}

function postFromApi(post: ApiPost): Post {
  const tagIds = (post.tags ?? []).map((tag) => slugifyTitle(tag)).filter(Boolean);

  return {
    id: post.id,
    title: post.title,
    titleJson: parseLocalizedText(post.title_json),
    subtitle: post.subtitle ?? "",
    slug: post.slug,
    categoryId: post.category_id || "journal",
    tagIds,
    coverImage: {
      src: normalizeAssetUrl(post.cover_image_url, ""),
      alt: post.cover_image_url ? `${post.title || "Editorial"} cover image.` : "",
      displayMode: normalizeCoverDisplayMode(post.cover_display_mode),
      focalX: normalizeFocalPoint(post.cover_focal_x),
      focalY: normalizeFocalPoint(post.cover_focal_y),
      width: post.cover_width ?? null,
      height: post.cover_height ?? null,
      aspectRatio: post.cover_aspect_ratio ?? null,
    },
    coverDisplayMode: normalizeCoverDisplayMode(post.cover_display_mode),
    coverFocalX: normalizeFocalPoint(post.cover_focal_x),
    coverFocalY: normalizeFocalPoint(post.cover_focal_y),
    excerpt: post.excerpt ?? "",
    excerptJson: parseLocalizedText(post.excerpt_json),
    content: post.content,
    contentJson: parseLocalizedText(post.content_json),
    status: post.status,
    featured: Boolean(post.featured),
    pinned: Boolean(post.pinned),
    seoTitle: post.seo_title ?? "",
    seoTitleJson: parseLocalizedText(post.seo_title_json),
    seoDescription: post.seo_description ?? "",
    seoDescriptionJson: parseLocalizedText(post.seo_description_json),
    translationLocks: parseTranslationLocks(post.translation_locks_json),
    publishedAt: post.published_at ?? "",
    createdAt: post.created_at,
    updatedAt: post.updated_at,
  };
}

function photoFromApi(photo: ApiPhoto): Photo {
  return {
    id: photo.id,
    title: photo.title,
    description: photo.description ?? "",
    imageUrl: normalizeAssetUrl(photo.image_url, ""),
    altText: photo.alt_text ?? photo.description ?? photo.title,
    status: "published",
    featured: Boolean(photo.featured),
    location: photo.location ?? "",
    city: photo.city ?? deriveCity(photo.location),
    country: photo.country ?? deriveCountry(photo.location),
    latitude: typeof photo.latitude === "number" ? photo.latitude : null,
    longitude: typeof photo.longitude === "number" ? photo.longitude : null,
    date: photo.taken_at ?? "",
    camera: photo.camera ?? "",
    lens: photo.lens ?? "",
    iso: photo.iso ?? "",
    aperture: photo.aperture ?? "",
    shutterSpeed: photo.shutter_speed ?? "",
    focalLength: photo.focal_length ?? "",
    tags: photo.tags ?? [],
  };
}

function fragmentFromApi(fragment: ApiFragment): Fragment {
  const imagesRaw = typeof fragment.images_json === "string" ? JSON.parse(fragment.images_json) as ApiFragmentImage[] : [];

  return {
    id: fragment.id,
    contentJson: parseLocalizedText(fragment.content_json),
    locationJson: parseLocalizedText(fragment.location_json),
    images: Array.isArray(imagesRaw)
      ? imagesRaw.map((image, index) => ({
          url: normalizeAssetUrl(image.url ?? "", ""),
          altJson: parseLocalizedText(image.alt_json),
          captionJson: parseLocalizedText(image.caption_json),
          width: image.width ?? null,
          height: image.height ?? null,
          sortOrder: image.sort_order ?? index,
        }))
      : [],
    camera: fragment.camera ?? "",
    mood: fragment.mood ?? "",
    status: fragment.status,
    isPublic: Boolean(fragment.is_public),
    translationLocks: parseFragmentTranslationLocks(fragment.translation_locks_json),
    publishedAt: fragment.published_at ?? "",
    createdAt: fragment.created_at,
    updatedAt: fragment.updated_at,
  };
}

function videoFromApi(video: ApiVideo): Video {
  return {
    id: video.id,
    title: video.title,
    description: video.description ?? "",
    coverImage: normalizeAssetUrl(video.cover_image_url, ""),
    videoUrl: video.video_url,
    platform: video.platform,
    status: "published",
    featured: Boolean(video.featured),
    duration: video.duration ?? "",
    tags: [video.platform],
  };
}

function postToApi(post: Post) {
  const localizedFields: Partial<Record<Locale, { title?: string; excerpt?: string; content?: string; seoTitle?: string; seoDescription?: string }>> = {
    "zh-CN": {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
    },
    "zh-TW": {
      title: post.titleJson["zh-TW"],
      excerpt: post.excerptJson["zh-TW"],
      content: post.contentJson["zh-TW"],
      seoTitle: post.seoTitleJson["zh-TW"],
      seoDescription: post.seoDescriptionJson["zh-TW"],
    },
    "en-US": {
      title: post.titleJson["en-US"],
      excerpt: post.excerptJson["en-US"],
      content: post.contentJson["en-US"],
      seoTitle: post.seoTitleJson["en-US"],
      seoDescription: post.seoDescriptionJson["en-US"],
    },
  };

  return {
    id: post.id,
    title: post.title,
    subtitle: post.subtitle,
    slug: post.slug || slugifyTitle(post.title),
    excerpt: post.excerpt,
    content: post.content,
    cover_image_url: post.coverImage.src,
    cover_display_mode: post.coverDisplayMode,
    cover_focal_x: post.coverFocalX,
    cover_focal_y: post.coverFocalY,
    cover_width: post.coverImage.width ?? null,
    cover_height: post.coverImage.height ?? null,
    cover_aspect_ratio: post.coverImage.aspectRatio ?? null,
    status: post.status,
    category_id: post.categoryId,
    featured: post.featured,
    pinned: post.pinned,
    seo_title: post.seoTitle,
    seo_description: post.seoDescription,
    localized_fields: localizedFields,
    translation_locks: post.translationLocks,
    title_json: stringifyLocalizedText(post.titleJson as LocalizedTextMap),
    excerpt_json: stringifyLocalizedText(post.excerptJson as LocalizedTextMap),
    content_json: stringifyLocalizedText(post.contentJson as LocalizedTextMap),
    seo_title_json: stringifyLocalizedText(post.seoTitleJson as LocalizedTextMap),
    seo_description_json: stringifyLocalizedText(post.seoDescriptionJson as LocalizedTextMap),
    published_at: post.publishedAt,
    tags: post.tagIds.map((tagId) => tagId),
  };
}

function photoToApi(photo: Photo) {
  return {
    id: photo.id,
    title: photo.title,
    description: photo.description,
    image_url: photo.imageUrl,
    alt_text: photo.altText,
    location: photo.location,
    city: photo.city,
    country: photo.country,
    latitude: photo.latitude,
    longitude: photo.longitude,
    taken_at: photo.date,
    camera: photo.camera,
    lens: photo.lens,
    iso: photo.iso,
    aperture: photo.aperture,
    shutter_speed: photo.shutterSpeed,
    focal_length: photo.focalLength,
    tags: photo.tags,
    featured: photo.featured,
  };
}

function videoToApi(video: Video) {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    cover_image_url: video.coverImage,
    video_url: video.videoUrl,
    platform: video.platform,
    duration: video.duration,
    featured: video.featured,
  };
}

function fragmentToApi(fragment: Fragment) {
  return {
    id: fragment.id,
    content: fragment.contentJson["zh-CN"] ?? "",
    location: fragment.locationJson["zh-CN"] ?? "",
    localized_fields: {
      "zh-CN": {
        content: fragment.contentJson["zh-CN"] ?? "",
        location: fragment.locationJson["zh-CN"] ?? "",
      },
      "zh-TW": {
        content: fragment.contentJson["zh-TW"] ?? "",
        location: fragment.locationJson["zh-TW"] ?? "",
      },
      "en-US": {
        content: fragment.contentJson["en-US"] ?? "",
        location: fragment.locationJson["en-US"] ?? "",
      },
    },
    images_json: fragment.images.map((image) => ({
      url: image.url,
      alt_json: stringifyLocalizedText(image.altJson),
      caption_json: stringifyLocalizedText(image.captionJson),
      width: image.width ?? null,
      height: image.height ?? null,
      sort_order: image.sortOrder,
    })),
    camera: fragment.camera,
    mood: fragment.mood,
    status: fragment.status,
    is_public: fragment.isPublic,
    translation_locks: fragment.translationLocks,
    published_at: fragment.publishedAt,
  };
}

function sitePageFromApi(page: ApiSitePage | null | undefined): SitePage {
  if (!page) {
    return createEmptyAboutPage();
  }

  return {
    id: page.id,
    pageKey: page.page_key,
    contentJson: JSON.parse(page.content_json || "{}") as SitePage["contentJson"],
    seoJson: JSON.parse(page.seo_json || "{}") as SitePage["seoJson"],
    createdAt: page.created_at,
    updatedAt: page.updated_at,
  };
}

function sitePageToApi(page: SitePage) {
  const source = {
    eyebrow: "",
    headline: "",
    description: "",
    body: "",
    heroImage: "",
    imageAlt: "",
    ...aboutImageDefaults,
    ...(page.contentJson["zh-CN"] ?? {}),
  };
  const sourceSeo = page.seoJson["zh-CN"] ?? { title: "", description: "" };

  return {
    id: page.id,
    eyebrow: source.eyebrow,
    headline: source.headline,
    description: source.description,
    body: source.body,
    hero_image: source.heroImage,
    image_alt: source.imageAlt,
    image_fit: source.imageFit,
    image_position_x: source.imagePositionX,
    image_position_y: source.imagePositionY,
    image_aspect_ratio: source.imageAspectRatio,
    seo_title: sourceSeo.title,
    seo_description: sourceSeo.description,
    localized_fields: Object.fromEntries(
      Object.entries(page.contentJson).map(([locale, fields]) => [
        locale,
        {
          ...fields,
          seoTitle: page.seoJson[locale as Locale]?.title ?? "",
          seoDescription: page.seoJson[locale as Locale]?.description ?? "",
        },
      ]),
    ),
  };
}

function gearItemFromApi(item: ApiGearItem): GearItem {
  return {
    id: item.id,
    nameJson: parseLocalizedText(item.name_json),
    descriptionJson: parseLocalizedText(item.description_json),
    category: item.category,
    maker: item.maker,
    year: item.year,
    status: item.status,
    archiveUses: Number(item.archive_uses) || 0,
    imageUrl: normalizeAssetUrl(item.image_url, ""),
    imageAltJson: parseLocalizedText(item.image_alt_json),
    tagsJson: parseLocalizedTextArray(item.tags_json),
    sortOrder: Number(item.sort_order) || 0,
    isFeatured: Boolean(item.is_featured),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function gearItemToApi(item: GearItem) {
  return {
    id: item.id,
    name: item.nameJson["zh-CN"] ?? "",
    description: item.descriptionJson["zh-CN"] ?? "",
    category: item.category,
    maker: item.maker,
    year: item.year,
    status: item.status,
    archive_uses: item.archiveUses,
    image_url: item.imageUrl,
    image_alt: item.imageAltJson["zh-CN"] ?? "",
    tags: item.tagsJson["zh-CN"] ?? [],
    sort_order: item.sortOrder,
    is_featured: item.isFeatured,
    localized_fields: {
      "zh-CN": {
        name: item.nameJson["zh-CN"] ?? "",
        description: item.descriptionJson["zh-CN"] ?? "",
        imageAlt: item.imageAltJson["zh-CN"] ?? "",
        tags: item.tagsJson["zh-CN"] ?? [],
      },
      "zh-TW": {
        name: item.nameJson["zh-TW"] ?? "",
        description: item.descriptionJson["zh-TW"] ?? "",
        imageAlt: item.imageAltJson["zh-TW"] ?? "",
        tags: item.tagsJson["zh-TW"] ?? [],
      },
      "en-US": {
        name: item.nameJson["en-US"] ?? "",
        description: item.descriptionJson["en-US"] ?? "",
        imageAlt: item.imageAltJson["en-US"] ?? "",
        tags: item.tagsJson["en-US"] ?? [],
      },
    },
  };
}

export function useCmsData() {
  const pathname = usePathname();
  const [data, setData] = useState<CmsData>({ ...defaultCmsData, posts: [], fragments: [], photos: [], videos: [], sitePages: {}, gearItems: [], featuredImages: [], galleryImages: [] });
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<RequestScope | null>(null);

  const replaceData = useCallback((nextData: CmsData) => {
    setData(nextData);
  }, []);

  const refreshData = useCallback(async () => {
    if (!scope) {
      return;
    }

    setError(null);
    const isAdminScope = scope === "admin";
    const locale = localeFromPathname(pathname || "/");
    const postPath = isAdminScope ? "/api/admin/posts" : `/api/posts?lang=${encodeURIComponent(locale)}`;
    const fragmentsPath = isAdminScope ? "/api/admin/fragments" : `/api/fragments?lang=${encodeURIComponent(locale)}`;
    const photosPath = isAdminScope ? "/api/admin/photos" : "/api/photos";
    const videosPath = isAdminScope ? "/api/admin/videos" : "/api/videos";
    const settingsPath = isAdminScope ? "/api/admin/settings" : "/api/settings";
    const aboutPath = isAdminScope ? "/api/admin/pages/about" : `/api/pages/about?lang=${encodeURIComponent(locale)}`;
    const gearPath = isAdminScope ? "/api/admin/gear" : `/api/gear?lang=${encodeURIComponent(locale)}`;
    const categoriesPath = isAdminScope ? "/api/admin/categories" : "/api/categories";
    const tagsPath = isAdminScope ? "/api/admin/tags" : "/api/tags";
    const featuredImagesPath = `/api/featured-images?lang=${encodeURIComponent(locale)}`;
    const galleryImagesPath = `/api/gallery-images?lang=${encodeURIComponent(locale)}`;
    const [posts, fragments, photos, videos, settings, aboutPage, gearItems, apiCategories, apiTags, featuredImages, galleryImages] = await Promise.all([
      apiRequest<ApiPost[]>(postPath),
      apiRequest<ApiFragment[]>(fragmentsPath),
      apiRequest<ApiPhoto[]>(photosPath),
      apiRequest<ApiVideo[]>(videosPath),
      apiRequest<ApiSiteSettings>(settingsPath),
      apiRequest<ApiSitePage | null>(aboutPath),
      apiRequest<ApiGearItem[]>(gearPath),
      apiRequest<ApiCategory[]>(categoriesPath).catch(() => defaultCategories.map(categoryToApi)),
      apiRequest<ApiTag[]>(tagsPath).catch(() => []),
      apiRequest<ApiFeaturedImage[]>(featuredImagesPath).catch(() => []),
      apiRequest<ApiFeaturedImage[]>(galleryImagesPath).catch(() => []),
    ]);
    const categories = apiCategories.length > 0 ? apiCategories.map(categoryFromApi) : defaultCategories;
    const tags = apiTags.length > 0 ? apiTags.map(tagFromApi) : buildTagsFromPosts(posts);

    replaceData({
      posts: posts.map((post) => postFromApi(post)),
      fragments: fragments.map((fragment) => fragmentFromApi(fragment)),
      categories,
      tags,
      photos: photos.map(photoFromApi),
      videos: videos.map(videoFromApi),
      sitePages: {
        about: sitePageFromApi(aboutPage),
      },
      gearItems: gearItems.map(gearItemFromApi),
      siteSettings: siteSettingsFromApi(settings),
      featuredImages,
      galleryImages,
    });
    setIsReady(true);
  }, [pathname, replaceData, scope]);

  useEffect(() => {
    setScope((pathname ?? "/").startsWith("/admin") ? "admin" : "public");
  }, [pathname]);

  useEffect(() => {
    if (!scope) {
      return;
    }

    let cancelled = false;
    refreshData().catch((requestError: unknown) => {
      if (!cancelled) {
        setError(normalizeError(requestError));
        setIsReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [refreshData, scope]);

  const categories = data.categories;
  const tags = data.tags;

  const addPost = useCallback(
    async (post: Post, options?: SaveOptions): Promise<SaveResponse<Post>> => {
      setError(null);
      try {
        const created = await apiRequestEnvelope<ApiPost>("/api/admin/posts", {
          method: "POST",
          body: JSON.stringify({
            ...postToApi(post),
            generate_translations: Boolean(options?.generateTranslations),
            regenerate_locales: options?.regenerateLocales ?? [],
          }),
        });
        const nextPost = postFromApi(created.data);
        setData((current) => ({ ...current, posts: [nextPost, ...current.posts.filter((item) => item.id !== nextPost.id)] }));
        return { data: nextPost, warnings: created.meta?.warnings ?? [] };
      } catch (requestError) {
        setError(normalizeError(requestError));
        throw requestError;
      }
    },
    [],
  );

  const updatePost = useCallback(
    async (post: Post, options?: SaveOptions): Promise<SaveResponse<Post>> => {
      const exists = data.posts.some((item) => item.id === post.id);
      if (!exists) {
        return await addPost(post, options);
      }

      setError(null);
      try {
        const updated = await apiRequestEnvelope<ApiPost>(`/api/admin/posts/${encodeURIComponent(post.id)}`, {
          method: "PUT",
          body: JSON.stringify({
            ...postToApi(post),
            generate_translations: Boolean(options?.generateTranslations),
            regenerate_locales: options?.regenerateLocales ?? [],
          }),
        });
        const nextPost = postFromApi(updated.data);
        setData((current) => ({ ...current, posts: current.posts.map((item) => (item.id === nextPost.id ? nextPost : item)) }));
        return { data: nextPost, warnings: updated.meta?.warnings ?? [] };
      } catch (requestError) {
        setError(normalizeError(requestError));
        throw requestError;
      }
    },
    [addPost, data.posts],
  );

  const deletePost = useCallback(async (postId: string) => {
    setError(null);
    try {
      await apiRequest<{ id: string; deleted: boolean }>(`/api/admin/posts/${encodeURIComponent(postId)}`, { method: "DELETE" });
      setData((current) => ({ ...current, posts: current.posts.filter((post) => post.id !== postId) }));
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const addFragment = useCallback(async (fragment: Fragment): Promise<SaveResponse<Fragment>> => {
    setError(null);
    try {
      const created = await apiRequestEnvelope<ApiFragment>("/api/admin/fragments", {
        method: "POST",
        body: JSON.stringify(fragmentToApi(fragment)),
      });
      const nextFragment = fragmentFromApi(created.data);
      setData((current) => ({ ...current, fragments: [nextFragment, ...current.fragments.filter((item) => item.id !== nextFragment.id)] }));
      return { data: nextFragment, warnings: created.meta?.warnings ?? [] };
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const updateFragment = useCallback(async (fragment: Fragment): Promise<SaveResponse<Fragment>> => {
    const exists = data.fragments.some((item) => item.id === fragment.id);
    if (!exists) {
      return await addFragment(fragment);
    }

    setError(null);
    try {
      const updated = await apiRequestEnvelope<ApiFragment>(`/api/admin/fragments/${encodeURIComponent(fragment.id)}`, {
        method: "PUT",
        body: JSON.stringify(fragmentToApi(fragment)),
      });
      const nextFragment = fragmentFromApi(updated.data);
      setData((current) => ({
        ...current,
        fragments: current.fragments.map((item) => (item.id === nextFragment.id ? nextFragment : item)),
      }));
      return { data: nextFragment, warnings: updated.meta?.warnings ?? [] };
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, [addFragment, data.fragments]);

  const deleteFragment = useCallback(async (fragmentId: string) => {
    setError(null);
    try {
      await apiRequest<{ id: string; deleted: boolean }>(`/api/admin/fragments/${encodeURIComponent(fragmentId)}`, { method: "DELETE" });
      setData((current) => ({ ...current, fragments: current.fragments.filter((fragment) => fragment.id !== fragmentId) }));
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const updateSiteSettings = useCallback(async (siteSettings: SiteSettings, options?: SiteSettingsSaveOptions) => {
    setError(null);
    try {
      const updated = await apiRequestEnvelope<{ updated: boolean }>("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(siteSettingsToApi(siteSettings, options)),
      });
      setData((current) => ({ ...current, siteSettings }));
      return { data: siteSettings, warnings: updated.meta?.warnings ?? [] };
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const updateSitePage = useCallback(async (page: SitePage, options?: SaveOptions) => {
    setError(null);
    try {
      const updated = await apiRequestEnvelope<ApiSitePage | null>("/api/admin/pages/about", {
        method: "PUT",
        body: JSON.stringify({
          ...sitePageToApi(page),
          generate_translations: Boolean(options?.generateTranslations),
          regenerate_locales: options?.regenerateLocales ?? [],
        }),
      });
      const nextPage = sitePageFromApi(updated.data);
      setData((current) => ({ ...current, sitePages: { ...current.sitePages, about: nextPage } }));
      return { data: nextPage, warnings: updated.meta?.warnings ?? [] };
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const addGearItem = useCallback(async (item: GearItem) => {
    setError(null);
    try {
      const created = await apiRequestEnvelope<ApiGearItem | null>("/api/admin/gear", {
        method: "POST",
        body: JSON.stringify(gearItemToApi(item)),
      });
      const nextItem = gearItemFromApi(created.data ?? { ...gearItemToApi(item), name_json: stringifyLocalizedText(item.nameJson), description_json: stringifyLocalizedText(item.descriptionJson), image_alt_json: stringifyLocalizedText(item.imageAltJson), tags_json: stringifyLocalizedTextArray(item.tagsJson), created_at: item.createdAt, updated_at: item.updatedAt } as ApiGearItem);
      setData((current) => ({ ...current, gearItems: [nextItem, ...current.gearItems.filter((entry) => entry.id !== nextItem.id)] }));
      return { data: nextItem, warnings: created.meta?.warnings ?? [] };
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const updateGearItem = useCallback(async (item: GearItem) => {
    const exists = data.gearItems.some((entry) => entry.id === item.id);
    if (!exists) {
      return await addGearItem(item);
    }

    setError(null);
    try {
      const updated = await apiRequestEnvelope<ApiGearItem | null>(`/api/admin/gear/${encodeURIComponent(item.id)}`, {
        method: "PUT",
        body: JSON.stringify(gearItemToApi(item)),
      });
      const nextItem = gearItemFromApi(updated.data ?? { ...gearItemToApi(item), name_json: stringifyLocalizedText(item.nameJson), description_json: stringifyLocalizedText(item.descriptionJson), image_alt_json: stringifyLocalizedText(item.imageAltJson), tags_json: stringifyLocalizedTextArray(item.tagsJson), created_at: item.createdAt, updated_at: item.updatedAt } as ApiGearItem);
      setData((current) => ({ ...current, gearItems: current.gearItems.map((entry) => (entry.id === nextItem.id ? nextItem : entry)) }));
      return { data: nextItem, warnings: updated.meta?.warnings ?? [] };
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, [addGearItem, data.gearItems]);

  const deleteGearItem = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiRequest<{ id: string; deleted: boolean }>(`/api/admin/gear/${encodeURIComponent(id)}`, { method: "DELETE" });
      setData((current) => ({ ...current, gearItems: current.gearItems.filter((entry) => entry.id !== id) }));
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const addPhoto = useCallback(async (photo: Photo) => {
    setError(null);
    try {
      const created = await apiRequest<ApiPhoto>("/api/admin/photos", {
        method: "POST",
        body: JSON.stringify(photoToApi(photo)),
      });
      const nextPhoto = { ...photo, id: created.id };
      setData((current) => ({ ...current, photos: [nextPhoto, ...current.photos.filter((item) => item.id !== nextPhoto.id)] }));
      return nextPhoto;
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const updatePhoto = useCallback(async (photo: Photo) => {
    setError(null);
    try {
      await apiRequest<ApiPhoto>(`/api/admin/photos/${encodeURIComponent(photo.id)}`, {
        method: "PUT",
        body: JSON.stringify(photoToApi(photo)),
      });
      setData((current) => ({ ...current, photos: current.photos.map((item) => (item.id === photo.id ? photo : item)) }));
      return photo;
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const deletePhoto = useCallback(async (photoId: string) => {
    setError(null);
    try {
      await apiRequest<{ id: string; deleted: boolean }>(`/api/admin/photos/${encodeURIComponent(photoId)}`, { method: "DELETE" });
      setData((current) => ({ ...current, photos: current.photos.filter((photo) => photo.id !== photoId) }));
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const addVideo = useCallback(async (video: Video) => {
    setError(null);
    try {
      const created = await apiRequest<ApiVideo>("/api/admin/videos", {
        method: "POST",
        body: JSON.stringify(videoToApi(video)),
      });
      const nextVideo = { ...video, id: created.id };
      setData((current) => ({ ...current, videos: [nextVideo, ...current.videos.filter((item) => item.id !== nextVideo.id)] }));
      return nextVideo;
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const updateVideo = useCallback(async (video: Video) => {
    setError(null);
    try {
      await apiRequest<ApiVideo>(`/api/admin/videos/${encodeURIComponent(video.id)}`, {
        method: "PUT",
        body: JSON.stringify(videoToApi(video)),
      });
      setData((current) => ({ ...current, videos: current.videos.map((item) => (item.id === video.id ? video : item)) }));
      return video;
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const deleteVideo = useCallback(async (videoId: string) => {
    setError(null);
    try {
      await apiRequest<{ id: string; deleted: boolean }>(`/api/admin/videos/${encodeURIComponent(videoId)}`, { method: "DELETE" });
      setData((current) => ({ ...current, videos: current.videos.filter((video) => video.id !== videoId) }));
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const addCategory = useCallback(async (category: Category) => {
    setError(null);
    try {
      const created = await apiRequest<ApiCategory>("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(categoryToApi(category)),
      });
      const nextCategory = categoryFromApi(created);
      setData((current) => ({ ...current, categories: [...current.categories.filter((item) => item.id !== nextCategory.id), nextCategory].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) }));
      return nextCategory;
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const updateCategory = useCallback(async (category: Category) => {
    setError(null);
    try {
      const updated = await apiRequest<ApiCategory>(`/api/admin/categories/${encodeURIComponent(category.id)}`, {
        method: "PUT",
        body: JSON.stringify(categoryToApi(category)),
      });
      const nextCategory = categoryFromApi(updated);
      setData((current) => ({ ...current, categories: current.categories.map((item) => (item.id === nextCategory.id ? nextCategory : item)).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) }));
      return nextCategory;
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    setError(null);
    try {
      await apiRequest<{ id: string; deleted: boolean }>(`/api/admin/categories/${encodeURIComponent(categoryId)}`, { method: "DELETE" });
      setData((current) => ({ ...current, categories: current.categories.filter((category) => category.id !== categoryId) }));
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const addTag = useCallback(async (tag: Tag) => {
    setError(null);
    try {
      const created = await apiRequest<ApiTag>("/api/admin/tags", {
        method: "POST",
        body: JSON.stringify(tagToApi(tag)),
      });
      const nextTag = tagFromApi(created);
      setData((current) => ({ ...current, tags: [...current.tags.filter((item) => item.id !== nextTag.id), nextTag].sort((a, b) => a.name.localeCompare(b.name)) }));
      return nextTag;
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const updateTag = useCallback(async (tag: Tag) => {
    setError(null);
    try {
      const updated = await apiRequest<ApiTag>(`/api/admin/tags/${encodeURIComponent(tag.id)}`, {
        method: "PUT",
        body: JSON.stringify(tagToApi(tag)),
      });
      const nextTag = tagFromApi(updated);
      setData((current) => ({ ...current, tags: current.tags.map((item) => (item.id === nextTag.id ? nextTag : item)).sort((a, b) => a.name.localeCompare(b.name)) }));
      return nextTag;
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const deleteTag = useCallback(async (tagId: string) => {
    setError(null);
    try {
      await apiRequest<{ id: string; deleted: boolean }>(`/api/admin/tags/${encodeURIComponent(tagId)}`, { method: "DELETE" });
      setData((current) => ({ ...current, tags: current.tags.filter((tag) => tag.id !== tagId) }));
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const uploadAsset = useCallback(async (file: File, folder: string) => {
    setError(null);
    const formData = new FormData();
    formData.append("folder", folder);
    formData.append("file", file);

    try {
      return await apiRequest<UploadResult>("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const uploadAssets = useCallback(async (files: File[], folder: string) => {
    setError(null);
    const formData = new FormData();
    formData.append("folder", folder);
    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const result = await apiRequest<UploadManyResult | UploadResult>("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      return "files" in result ? result.files : [result];
    } catch (requestError) {
      setError(normalizeError(requestError));
      throw requestError;
    }
  }, []);

  const resetCmsData = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  return useMemo(
    () => ({
      data,
      isReady,
      error,
      categories,
      tags,
      refreshData,
      addPost,
      updatePost,
      deletePost,
      addFragment,
      updateFragment,
      deleteFragment,
      addPhoto,
      updatePhoto,
      deletePhoto,
      addVideo,
      updateVideo,
      deleteVideo,
      addCategory,
      updateCategory,
      deleteCategory,
      addTag,
      updateTag,
      deleteTag,
      updateSitePage,
      addGearItem,
      updateGearItem,
      deleteGearItem,
      updateSiteSettings,
      uploadAsset,
      uploadAssets,
      resetCmsData,
    }),
    [
      addPhoto,
      addFragment,
      addPost,
      addTag,
      addVideo,
      addCategory,
      categories,
      data,
      deleteCategory,
      deletePhoto,
      deleteFragment,
      deletePost,
      deleteTag,
      deleteVideo,
      error,
      isReady,
      refreshData,
      resetCmsData,
      tags,
      updateCategory,
      updateSitePage,
      updateTag,
      addGearItem,
      updateGearItem,
      deleteGearItem,
      updatePhoto,
      updateFragment,
      updatePost,
      updateSiteSettings,
      updateVideo,
      uploadAsset,
      uploadAssets,
    ],
  );
}
