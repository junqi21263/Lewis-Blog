import type { Article, ImageAsset } from "@/data/site";
import { resolveLocalizedText, type LocalizedTextMap } from "@/i18n/content";
import type { Locale } from "@/i18n/config";
import { getReadingTime, slugifyTitle } from "@/lib/editor";

export type PostStatus = "draft" | "published" | "scheduled" | "archived";
export type TranslationField = "title" | "excerpt" | "content" | "seoTitle" | "seoDescription";
export type TranslationLocks = Partial<Record<Locale, Partial<Record<TranslationField, boolean>>>>;

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type Post = {
  id: string;
  title: string;
  titleJson: LocalizedTextMap;
  subtitle: string;
  slug: string;
  categoryId: string;
  tagIds: string[];
  coverImage: ImageAsset;
  excerpt: string;
  excerptJson: LocalizedTextMap;
  content: string;
  contentJson: LocalizedTextMap;
  status: PostStatus;
  featured: boolean;
  pinned: boolean;
  seoTitle: string;
  seoTitleJson: LocalizedTextMap;
  seoDescription: string;
  seoDescriptionJson: LocalizedTextMap;
  translationLocks: TranslationLocks;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type Photo = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  altText: string;
  status: PostStatus;
  featured: boolean;
  location: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  camera: string;
  lens: string;
  iso: string;
  aperture: string;
  shutterSpeed: string;
  focalLength: string;
  tags: string[];
};

export type VideoPlatform = "YouTube" | "Bilibili" | "Vimeo" | "Local URL";

export type Video = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  videoUrl: string;
  platform: VideoPlatform;
  status: PostStatus;
  featured: boolean;
  duration: string;
  tags: string[];
};

export type SiteSettings = {
  studioName: string;
  tagline: string;
  titleFormat: string;
  defaultDescription: string;
};

export type CmsData = {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  photos: Photo[];
  videos: Video[];
  siteSettings: SiteSettings;
};

export const CMS_STORAGE_KEY = "noah-studio-cms-data";

export const defaultCategories: Category[] = [
  { id: "architecture", name: "Architecture", slug: "architecture" },
  { id: "photography", name: "Photography", slug: "photography" },
  { id: "design", name: "Design", slug: "design" },
  { id: "essay", name: "Essay", slug: "essay" },
  { id: "travel", name: "Travel", slug: "travel" },
  { id: "editorial", name: "Editorial", slug: "editorial" },
];

export const defaultTags: Tag[] = [
  { id: "studio", name: "Studio", slug: "studio" },
  { id: "writing", name: "Writing", slug: "writing" },
  { id: "nordic", name: "Nordic", slug: "nordic" },
  { id: "field-notes", name: "Field Notes", slug: "field-notes" },
  { id: "monochrome", name: "Monochrome", slug: "monochrome" },
  { id: "architecture", name: "Architecture", slug: "architecture" },
];

export const defaultCmsData: CmsData = {
  categories: defaultCategories,
  tags: defaultTags,
  posts: [],
  photos: [],
  videos: [],
  siteSettings: {
    studioName: "Lewis Photograph Blog",
    tagline: "Editorial CMS",
    titleFormat: "%s | Lewis Photograph Blog",
    defaultDescription: "A minimalist editorial platform focusing on high-end visual narrative and sophisticated design.",
  },
};

export function createPostId(title: string) {
  return slugifyTitle(title) || `post-${Date.now()}`;
}

export function getCategoryById(data: CmsData, categoryId: string) {
  return data.categories.find((category) => category.id === categoryId) ?? data.categories[0];
}

export function getPostTags(data: CmsData, post: Post) {
  return post.tagIds.map((tagId) => data.tags.find((tag) => tag.id === tagId)).filter((tag): tag is Tag => Boolean(tag));
}

export function createEmptyPost(now = new Date().toISOString().slice(0, 16)): Post {
  const id = `draft-${Date.now()}`;

  return {
    id,
    title: "",
    titleJson: {},
    subtitle: "",
    slug: "",
    categoryId: "editorial",
    tagIds: [],
    coverImage: { src: "", alt: "" },
    excerpt: "",
    excerptJson: {},
    content: "",
    contentJson: {},
    status: "draft",
    featured: false,
    pinned: false,
    seoTitle: "",
    seoTitleJson: {},
    seoDescription: "",
    seoDescriptionJson: {},
    translationLocks: {},
    publishedAt: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function localizedPost(post: Post, locale: Locale): Post {
  return {
    ...post,
    title: resolveLocalizedText(post.titleJson, locale, post.title),
    excerpt: resolveLocalizedText(post.excerptJson, locale, post.excerpt),
    content: resolveLocalizedText(post.contentJson, locale, post.content),
    seoTitle: resolveLocalizedText(post.seoTitleJson, locale, post.seoTitle || post.title),
    seoDescription: resolveLocalizedText(post.seoDescriptionJson, locale, post.seoDescription || post.excerpt),
  };
}

export function postToArticle(post: Post, data: CmsData, locale?: Locale): Article {
  const resolvedPost = locale ? localizedPost(post, locale) : post;
  const category = getCategoryById(data, post.categoryId);

  return {
    slug: resolvedPost.slug || resolvedPost.id,
    title: resolvedPost.title || "Untitled Editorial",
    eyebrow: `Journal - ${category.name}`,
    category: category.name,
    tags: getPostTags(data, post).map((tag) => tag.name),
    author: "Lewis Photograph Blog",
    date: resolvedPost.publishedAt ? new Date(resolvedPost.publishedAt).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }) : "Draft",
    readTime: getReadingTime(resolvedPost.content),
    location: "Lewis Photograph Blog",
    equipment: [],
    excerpt: resolvedPost.excerpt || resolvedPost.subtitle,
    image: resolvedPost.coverImage,
    gallery: [],
    body: [{ type: "paragraph", lead: true, content: resolvedPost.excerpt || resolvedPost.subtitle || "A quiet editorial note." }],
  };
}

export function getVisibleJournalPosts(data: CmsData) {
  return data.posts
    .filter((post) => post.status === "published")
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
}
