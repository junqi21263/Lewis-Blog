import type { Metadata } from "next";
import GalleryClient from "@/components/GalleryClient";
import { galleryImages } from "@/data/site";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Selected frames from the Noah. Studio image archive.",
  openGraph: {
    title: "Gallery",
    description: "Selected frames from the Noah. Studio image archive.",
    images: [{ url: galleryImages[0].src, alt: galleryImages[0].alt }],
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
