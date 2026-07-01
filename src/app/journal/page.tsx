import type { Metadata } from "next";
import JournalClient from "@/components/JournalClient";

export const metadata: Metadata = {
  title: "Journal",
  description: "Essays, field notes, and visual studies from Noah. Studio.",
  openGraph: {
    title: "Journal",
    description: "Essays, field notes, and visual studies from Noah. Studio.",
  },
};

export default function JournalPage() {
  return <JournalClient />;
}
