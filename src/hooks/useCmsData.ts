"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  defaultCategories,
  defaultCmsData,
  defaultTags,
  type CmsData,
  type Photo,
  type Post,
  type SiteSettings,
  type TranslationLocks,
  type Video,
} from "@/data/cms";
import { parseLocalizedText, stringifyLocalizedText, type LocalizedTextMap } from "@/i18n/content";
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

type UploadResult = {
  key: string;
  url: string;
  size: number;
  content_type: string;
};

type RequestScope = "admin" | "public";
type SaveOptions = {
  generateTranslations?: boolean;
  regenerateLocales?: Locale[];
};
type SaveResponse<T> = {
  data: T;
  warnings: string[];
};

const defaultSiteSettings = defaultCmsData.siteSettings;

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

async function apiRequest<T>(path: string, init?: RequestInit) {
  const envelope = await apiRequestEnvelope<T>(path, init);
  return envelope.data;
}

async function apiRequestEnvelope<T>(path: string, init?: RequestInit) {
  let response: Response;
  try {
    response = await fetch(path, {
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
  const knownCategory = defaultCategories.some((category) => category.id === post.category_id);

  return {
    id: post.id,
    title: post.title,
    titleJson: parseLocalizedText(post.title_json),
    subtitle: post.subtitle ?? "",
    slug: post.slug,
    categoryId: knownCategory && post.category_id ? post.category_id : "editorial",
    tagIds,
    coverImage: {
      src: normalizeAssetUrl(post.cover_image_url, ""),
      alt: post.cover_image_url ? `${post.title || "Editorial"} cover image.` : "",
    },
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
    tags: post.tagIds.map((tagId) => defaultTags.find((tag) => tag.id === tagId)?.name ?? tagId),
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

export function useCmsData() {
  const pathname = usePathname();
  const [data, setData] = useState<CmsData>({ ...defaultCmsData, posts: [], photos: [], videos: [] });
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
    const photosPath = isAdminScope ? "/api/admin/photos" : "/api/photos";
    const videosPath = isAdminScope ? "/api/admin/videos" : "/api/videos";
    const settingsPath = isAdminScope ? "/api/admin/settings" : "/api/settings";
    const [posts, photos, videos, settings] = await Promise.all([
      apiRequest<ApiPost[]>(postPath),
      apiRequest<ApiPhoto[]>(photosPath),
      apiRequest<ApiVideo[]>(videosPath),
      apiRequest<Partial<SiteSettings>>(settingsPath),
    ]);
    const tags = buildTagsFromPosts(posts);

    replaceData({
      posts: posts.map((post) => postFromApi(post)),
      categories: defaultCategories,
      tags,
      photos: photos.map(photoFromApi),
      videos: videos.map(videoFromApi),
      siteSettings: {
        ...defaultSiteSettings,
        ...settings,
      },
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

  const updateSiteSettings = useCallback(async (siteSettings: SiteSettings) => {
    setError(null);
    try {
      await apiRequest<{ updated: boolean }>("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(siteSettings),
      });
      setData((current) => ({ ...current, siteSettings }));
      return siteSettings;
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
      addPhoto,
      updatePhoto,
      deletePhoto,
      addVideo,
      updateVideo,
      deleteVideo,
      updateSiteSettings,
      uploadAsset,
      resetCmsData,
    }),
    [
      addPhoto,
      addPost,
      addVideo,
      categories,
      data,
      deletePhoto,
      deletePost,
      deleteVideo,
      error,
      isReady,
      refreshData,
      resetCmsData,
      tags,
      updatePhoto,
      updatePost,
      updateSiteSettings,
      updateVideo,
      uploadAsset,
    ],
  );
}
