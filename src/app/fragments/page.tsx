import type { Metadata } from "next";
import FragmentsClient from "@/components/FragmentsClient";

export const metadata: Metadata = {
  title: "Fragments",
  description: "Daily notes, images, and lightweight field records from Lewis Photograph Blog.",
  openGraph: {
    title: "Fragments",
    description: "Daily notes, images, and lightweight field records from Lewis Photograph Blog.",
  },
};

export default function FragmentsPage() {
  return <FragmentsClient />;
}
