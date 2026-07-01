import { siteDescription, siteName, siteUrl } from "@/data/site";

const analyticsDomains = [new URL(siteUrl).hostname];

export const creatorConfig = {
  newsletter: {
    provider: "Buttondown",
    actionUrl: "https://buttondown.email/noah-studio",
  },
  giscus: {
    repo: "junqi21263/Lewis-Blog",
    repoId: "R_kgDOTKRktw",
    category: "Announcements",
    categoryId: "DIC_kwDOTKRkt84DARCa",
    mapping: "pathname",
    strict: "0",
    reactionsEnabled: "1",
    emitMetadata: "0",
    inputPosition: "bottom",
    theme: "preferred_color_scheme",
    lang: "en",
  },
  analytics: {
    cloudflareWebAnalyticsToken: "92294d832357401eb6ad2cb92f6a9514",
    domains: analyticsDomains,
    umamiWebsiteId: "cd5c5908-8e29-4617-87ba-f16f2a6862c7",
    umamiScriptUrl: "https://cloud.umami.is/script.js",
  },
};

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/journal?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/images/open-road.jpg`,
  };
}
