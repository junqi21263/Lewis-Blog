import type { Metadata } from "next";
import GearClient from "@/components/GearClient";

export const metadata: Metadata = {
  title: "Gear",
  description: "Cameras, lenses, audio tools, and travel equipment used across Lewis Photograph Blog.",
  openGraph: {
    title: "Gear",
    description: "Cameras, lenses, audio tools, and travel equipment used across Lewis Photograph Blog.",
    images: [{ url: "/og/home", alt: "Lewis Photograph Blog open graph cover." }],
  },
};

export default function GearPage() {
  return <GearClient />;
}
