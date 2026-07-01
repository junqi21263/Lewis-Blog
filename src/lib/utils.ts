import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getArticleBySlug(slug: string) {
  return import("@/data/site").then(({ articles }) => articles.find((article) => article.slug === slug));
}
