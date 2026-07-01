import LocaleRedirect from "@/components/LocaleRedirect";
import type { Metadata } from "next";
import { siteDescription, siteName, siteUrl } from "@/data/site";

export const metadata: Metadata = {
  title: siteName,
  description: siteDescription,
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: siteUrl,
    images: [{ url: `${siteUrl}/og/home`, alt: "Lewis Photograph Blog open graph cover." }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [`${siteUrl}/og/home`],
  },
};

export default function HomePage() {
  return <LocaleRedirect />;
}
