export type ImageAsset = {
  src: string;
  alt: string;
  displayMode?: "cover" | "contain" | "original";
  focalX?: number;
  focalY?: number;
  width?: number | null;
  height?: number | null;
  aspectRatio?: number | null;
};

export const googleSiteVerification = "googlec60f62b45447f684.html";

export type Article = {
  slug: string;
  title: string;
  eyebrow: string;
  category: string;
  tags: string[];
  author: string;
  date: string;
  readTime: string;
  location: string;
  equipment: string[];
  excerpt: string;
  image: ImageAsset;
  gallery: ImageAsset[];
  body: Array<
    | { type: "paragraph"; content: string; lead?: boolean }
    | { type: "heading"; content: string }
    | { type: "quote"; content: string }
    | { type: "code"; filename: string; content: string }
  >;
};

export type GalleryImage = ImageAsset & {
  id: string;
  title: string;
  location: string;
  orientation: "portrait" | "landscape" | "square";
};

export type FeaturedImageSourceType = "gallery" | "article";

export type FeaturedImage = {
  id: string;
  imageUrl: string;
  alt: string;
  caption: string;
  sourceType: FeaturedImageSourceType;
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  width: number | null;
  height: number | null;
};

export type Film = {
  id: string;
  title: string;
  year: string;
  duration: string;
  category: string;
  description: string;
  poster: ImageAsset;
  videoSrc: string;
};

export const navItems = [
  { href: "/journal", label: "Journal" },
  { href: "/fragments", label: "Fragments" },
  { href: "/gallery", label: "Gallery" },
  { href: "/gear", label: "Gear" },
  { href: "/films", label: "Films" },
  { href: "/about", label: "About" },
];

export const siteUrl = "https://journal.lewislee.online";
export const siteName = "Lewis Photograph Blog";
export const brandMark = "Lewis.";
export const siteDescription = "A Nordic editorial journal for photography, travel, films, gear, and deliberate writing.";
