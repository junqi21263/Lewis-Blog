import type { Article, FeaturedImage, ImageAsset } from "@/data/site";
import type { AboutImageAspectRatio, AboutImageFit, AboutImagePositionX, AboutImagePositionY } from "@/components/about/imagePresentation";
import type { CoverDisplayMode } from "@/components/article/coverPresentation";
import { defaultBrandJson, type BrandJson } from "@/components/brand/brandContent";
import { defaultFooterJson, type FooterJson } from "@/components/footer/footerContent";
import { defaultHomepageJson, type HomepageJson } from "@/components/home/homepageContent";
import { defaultPageCopyJson, type PageCopyJson } from "@/components/pages/pageCopy";
import { resolveLocalizedText, type LocalizedTextMap } from "@/i18n/content";
import type { Locale } from "@/i18n/config";
import { getReadingTime, slugifyTitle } from "@/lib/editor";

export type PostStatus = "draft" | "published" | "scheduled" | "archived";
export type TranslationField = "title" | "excerpt" | "content" | "seoTitle" | "seoDescription";
export type TranslationLocks = Partial<Record<Locale, Partial<Record<TranslationField, boolean>>>>;
export type FragmentTranslationField = "content" | "location";
export type FragmentTranslationLocks = Partial<Record<Locale, Partial<Record<FragmentTranslationField, boolean>>>>;

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
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
  coverDisplayMode: CoverDisplayMode;
  coverFocalX: number;
  coverFocalY: number;
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

export type FragmentImage = {
  url: string;
  altJson: LocalizedTextMap;
  captionJson: LocalizedTextMap;
  width: number | null;
  height: number | null;
  sortOrder: number;
};

export type Fragment = {
  id: string;
  contentJson: LocalizedTextMap;
  locationJson: LocalizedTextMap;
  images: FragmentImage[];
  camera: string;
  mood: string;
  status: PostStatus;
  isPublic: boolean;
  translationLocks: FragmentTranslationLocks;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
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

export type SitePageKey = "about";

export type AboutContentFields = {
  eyebrow: string;
  headline: string;
  description: string;
  body: string;
  heroImage: string;
  imageAlt: string;
  imageFit: AboutImageFit;
  imagePositionX: AboutImagePositionX;
  imagePositionY: AboutImagePositionY;
  imageAspectRatio: AboutImageAspectRatio;
};

export type AboutSeoFields = {
  title: string;
  description: string;
};

export type SitePageContentMap = Partial<Record<Locale, AboutContentFields>>;
export type SitePageSeoMap = Partial<Record<Locale, AboutSeoFields>>;

export type SitePage = {
  id: string;
  pageKey: SitePageKey;
  contentJson: SitePageContentMap;
  seoJson: SitePageSeoMap;
  createdAt: string;
  updatedAt: string;
};

export type GearCategory = "Camera" | "Lens" | "Phone" | "Drone" | "Audio" | "Accessories";
export type GearStatus = "current" | "archived";
export type LocalizedTagMap = Partial<Record<Locale, string[]>>;

export type GearItem = {
  id: string;
  nameJson: LocalizedTextMap;
  descriptionJson: LocalizedTextMap;
  category: GearCategory;
  maker: string;
  year: string;
  status: GearStatus;
  archiveUses: number;
  imageUrl: string;
  imageAltJson: LocalizedTextMap;
  tagsJson: LocalizedTagMap;
  sortOrder: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SiteSettings = {
  studioName: string;
  tagline: string;
  titleFormat: string;
  defaultDescription: string;
  logoImageUrl: string;
  brandJson: BrandJson;
  footerJson: FooterJson;
  homepageJson: HomepageJson;
  pageCopyJson: PageCopyJson;
};

export type CmsData = {
  posts: Post[];
  fragments: Fragment[];
  categories: Category[];
  tags: Tag[];
  photos: Photo[];
  videos: Video[];
  sitePages: Partial<Record<SitePageKey, SitePage>>;
  gearItems: GearItem[];
  siteSettings: SiteSettings;
  featuredImages: FeaturedImage[];
  galleryImages: FeaturedImage[];
};

export const CMS_STORAGE_KEY = "noah-studio-cms-data";

export const defaultCategories: Category[] = [
  { id: "journal", name: "Journal", slug: "journal", icon: "FileText", color: "#f5f1e8", sortOrder: 10 },
  { id: "travel", name: "Travel", slug: "travel", icon: "Map", color: "#d9e4dd", sortOrder: 20 },
  { id: "photography", name: "Photography", slug: "photography", icon: "Camera", color: "#e6e1dc", sortOrder: 30 },
  { id: "street", name: "Street", slug: "street", icon: "Footprints", color: "#d8d8d8", sortOrder: 40 },
  { id: "architecture", name: "Architecture", slug: "architecture", icon: "Building2", color: "#dfe3e6", sortOrder: 50 },
  { id: "film", name: "Film", slug: "film", icon: "Clapperboard", color: "#e3dfd4", sortOrder: 60 },
  { id: "gear", name: "Gear", slug: "gear", icon: "Aperture", color: "#e5e5e5", sortOrder: 70 },
  { id: "notes", name: "Notes", slug: "notes", icon: "NotebookPen", color: "#ece7dd", sortOrder: 80 },
  { id: "life", name: "Life", slug: "life", icon: "Circle", color: "#ddd8cf", sortOrder: 90 },
  { id: "projects", name: "Projects", slug: "projects", icon: "Folder", color: "#e0ded8", sortOrder: 100 },
];

export const defaultTags: Tag[] = [
  { id: "japan", name: "Japan", slug: "japan" },
  { id: "tokyo", name: "Tokyo", slug: "tokyo" },
  { id: "leica", name: "Leica", slug: "leica" },
  { id: "kodak-gold", name: "Kodak Gold", slug: "kodak-gold" },
  { id: "black-and-white", name: "Black and White", slug: "black-and-white" },
  { id: "osaka", name: "Osaka", slug: "osaka" },
  { id: "architecture", name: "Architecture", slug: "architecture" },
  { id: "night-walk", name: "Night Walk", slug: "night-walk" },
  { id: "film-scan", name: "Film Scan", slug: "film-scan" },
];

export const defaultCmsData: CmsData = {
  categories: defaultCategories,
  tags: defaultTags,
  posts: [],
  fragments: [],
  photos: [],
  videos: [],
  sitePages: {},
  gearItems: [],
  featuredImages: [],
  galleryImages: [],
  siteSettings: {
    studioName: "Lewis Photograph Blog",
    tagline: "Editorial CMS",
    titleFormat: "%s | Lewis Photograph Blog",
    defaultDescription: "A minimalist editorial platform focusing on high-end visual narrative and sophisticated design.",
    logoImageUrl: "",
    brandJson: defaultBrandJson,
    footerJson: defaultFooterJson,
    homepageJson: defaultHomepageJson,
    pageCopyJson: defaultPageCopyJson,
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
    categoryId: "journal",
    tagIds: [],
    coverImage: { src: "", alt: "" },
    coverDisplayMode: "cover",
    coverFocalX: 50,
    coverFocalY: 50,
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

export function localizedFragment(fragment: Fragment, locale: Locale) {
  return {
    ...fragment,
    content: resolveLocalizedText(fragment.contentJson, locale, fragment.contentJson["zh-CN"] ?? ""),
    location: resolveLocalizedText(fragment.locationJson, locale, fragment.locationJson["zh-CN"] ?? ""),
    images: fragment.images
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((image) => ({
        ...image,
        alt: resolveLocalizedText(image.altJson, locale, fragment.contentJson["zh-CN"] ?? "Fragment image"),
        caption: resolveLocalizedText(image.captionJson, locale, ""),
      })),
  };
}

export function postToArticle(post: Post, data: CmsData, locale?: Locale): Article {
  const resolvedPost = locale ? localizedPost(post, locale) : post;
  const category = getCategoryById(data, post.categoryId);
  const dateLocale = locale === "zh-CN" ? "zh-Hans-CN" : locale === "zh-TW" ? "zh-Hant-TW" : "en-US";

  return {
    slug: resolvedPost.slug || resolvedPost.id,
    title: resolvedPost.title || "Untitled Editorial",
    eyebrow: `Journal - ${category.name}`,
    category: category.name,
    tags: getPostTags(data, post).map((tag) => tag.name),
    author: "Lewis Photograph Blog",
    date: resolvedPost.publishedAt ? new Date(resolvedPost.publishedAt).toLocaleDateString(dateLocale, { month: "long", day: "2-digit", year: "numeric" }) : locale === "zh-CN" ? "草稿" : locale === "zh-TW" ? "草稿" : "Draft",
    readTime: getReadingTime(resolvedPost.content),
    location: "Lewis Photograph Blog",
    equipment: [],
    excerpt: resolvedPost.excerpt || resolvedPost.subtitle,
    image: {
      ...resolvedPost.coverImage,
      displayMode: resolvedPost.coverDisplayMode,
      focalX: resolvedPost.coverFocalX,
      focalY: resolvedPost.coverFocalY,
    },
    gallery: [],
    body: [{ type: "paragraph", lead: true, content: resolvedPost.excerpt || resolvedPost.subtitle || "A quiet editorial note." }],
  };
}

export function getVisibleJournalPosts(data: CmsData) {
  return data.posts
    .filter((post) => post.status === "published")
    .sort((a, b) => (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt));
}

export function getVisibleFragments(data: CmsData) {
  return data.fragments
    .filter((fragment) => fragment.status === "published" && fragment.isPublic)
    .sort((a, b) => (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt));
}

export function createEmptyAboutPage(now = new Date().toISOString()) : SitePage {
  return {
    id: "about",
    pageKey: "about",
    contentJson: {},
    seoJson: {},
    createdAt: now,
    updatedAt: now,
  };
}

export function createEmptyGearItem(now = new Date().toISOString()): GearItem {
  return {
    id: `gear-${Date.now()}`,
    nameJson: {},
    descriptionJson: {},
    category: "Camera",
    maker: "",
    year: "",
    status: "current",
    archiveUses: 0,
    imageUrl: "",
    imageAltJson: {},
    tagsJson: {},
    sortOrder: 0,
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function createEmptyFragment(now = new Date().toISOString()): Fragment {
  return {
    id: `fragment-${Date.now()}`,
    contentJson: {},
    locationJson: {},
    images: [],
    camera: "",
    mood: "",
    status: "draft",
    isPublic: true,
    translationLocks: {},
    publishedAt: "",
    createdAt: now,
    updatedAt: now,
  };
}
