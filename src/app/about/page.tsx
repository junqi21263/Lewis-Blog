import type { Metadata } from "next";
import AboutClient from "@/components/AboutClient";

export const metadata: Metadata = {
  title: "About",
  description: "About Lewis Photograph Blog.",
};

export default function AboutPage() {
  return <AboutClient />;
}
