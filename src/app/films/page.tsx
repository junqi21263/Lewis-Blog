import type { Metadata } from "next";
import FilmsClient from "@/components/FilmsClient";

export const metadata: Metadata = {
  title: "Films",
  description: "Short-form video essays and atmospheric moving notes.",
  openGraph: {
    title: "Films",
    description: "Short-form video essays and atmospheric moving notes.",
    images: [{ url: "/og/home", alt: "Lewis Photograph Blog open graph cover." }],
  },
};

export default function FilmsPage() {
  return <FilmsClient />;
}
