import type { Metadata } from "next";
import GalleryClient from "@/components/GalleryClient";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Selected frames from the Lewis Photograph Blog image archive.",
  openGraph: {
    title: "Gallery",
    description: "Selected frames from the Lewis Photograph Blog image archive.",
    images: [{ url: "/og/home", alt: "Lewis Photograph Blog open graph cover." }],
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
