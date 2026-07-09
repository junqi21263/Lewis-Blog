import type { Metadata } from "next";
import JournalClient from "@/components/JournalClient";

export const metadata: Metadata = {
  title: "Journal",
  description: "Essays, field notes, and visual studies from Lewis Photograph Blog.",
  openGraph: {
    title: "Journal",
    description: "Essays, field notes, and visual studies from Lewis Photograph Blog.",
  },
};

export default function JournalPage() {
  return <JournalClient />;
}
