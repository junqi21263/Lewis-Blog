import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import HtmlRuntimeSync from "@/components/HtmlRuntimeSync";
import SiteChrome from "@/components/SiteChrome";
import StructuredData from "@/components/StructuredData";
import { organizationJsonLd, websiteJsonLd } from "@/data/creator";
import { googleSiteVerification, siteDescription, siteName, siteUrl } from "@/data/site";
import { defaultLocale } from "@/i18n/config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif-loaded",
  weight: ["400", "500", "600"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono-loaded",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.webmanifest",
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  icons: {
    icon: [
      { url: "/api/site-icon", sizes: "any" },
      { url: "/api/site-icon?size=32", sizes: "32x32" },
      { url: "/api/site-icon?size=16", sizes: "16x16" },
    ],
    apple: [{ url: "/api/site-icon?size=180", sizes: "180x180" }],
    shortcut: ["/api/site-icon"],
  },
  verification: {
    google: googleSiteVerification,
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: siteUrl,
    siteName,
    type: "website",
    images: [
      {
        url: "/og/home",
        alt: "Lewis Photograph Blog open graph cover.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/og/home"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang={defaultLocale} suppressHydrationWarning>
      <body className={`${inter.variable} ${cormorant.variable} ${ibmPlexMono.variable} antialiased`}>
        <HtmlRuntimeSync />
        <StructuredData data={websiteJsonLd()} />
        <StructuredData data={organizationJsonLd()} />
        <SiteChrome>{children}</SiteChrome>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
