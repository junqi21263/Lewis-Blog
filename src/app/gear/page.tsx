import type { Metadata } from "next";
import GearClient from "@/components/GearClient";

export const metadata: Metadata = {
  title: "Gear",
  description: "Cameras, lenses, audio tools, and travel equipment used across the Noah. Studio archive.",
  openGraph: {
    title: "Gear",
    description: "Cameras, lenses, audio tools, and travel equipment used across the Noah. Studio archive.",
    images: [{ url: "/images/packing.jpg", alt: "A neatly organized field kit on a dark surface." }],
  },
};

export default function GearPage() {
  return <GearClient />;
}
