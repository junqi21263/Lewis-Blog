import type { Metadata } from "next";
import { EB_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import SiteChrome from "@/components/SiteChrome";
import StructuredData from "@/components/StructuredData";
import { organizationJsonLd, websiteJsonLd } from "@/data/creator";
import { googleSiteVerification, siteDescription, siteName, siteUrl } from "@/data/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
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
    <html className="dark" lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${ebGaramond.variable} ${jetBrainsMono.variable} antialiased`}>
        <StructuredData data={websiteJsonLd()} />
        <StructuredData data={organizationJsonLd()} />
        <SiteChrome>{children}</SiteChrome>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
