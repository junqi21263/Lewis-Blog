import type { Metadata } from "next";
import FilmsClient from "@/components/FilmsClient";
import { films } from "@/data/site";

export const metadata: Metadata = {
  title: "Films",
  description: "Short-form video essays and atmospheric moving notes.",
  openGraph: {
    title: "Films",
    description: "Short-form video essays and atmospheric moving notes.",
    images: [{ url: films[0].poster.src, alt: films[0].poster.alt }],
  },
};

export default function FilmsPage() {
  return <FilmsClient />;
}
