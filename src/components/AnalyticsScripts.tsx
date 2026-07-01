import Script from "next/script";
import { creatorConfig } from "@/data/creator";

export default function AnalyticsScripts() {
  const { cloudflareWebAnalyticsToken, domains, umamiScriptUrl, umamiWebsiteId } = creatorConfig.analytics;
  const isProduction = process.env.NODE_ENV === "production";
  const umamiDomains = domains.join(",");

  if (!isProduction) {
    return null;
  }

  return (
    <>
      {cloudflareWebAnalyticsToken ? (
        <Script
          id="cloudflare-web-analytics"
          data-cf-beacon={JSON.stringify({ token: cloudflareWebAnalyticsToken })}
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
        />
      ) : null}
      {umamiWebsiteId ? (
        <Script
          id="umami-analytics"
          data-domains={umamiDomains}
          data-website-id={umamiWebsiteId}
          defer
          src={umamiScriptUrl}
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
