"use client";

import { usePathname } from "next/navigation";
import Layout from "@/components/Layout";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return <Layout>{children}</Layout>;
}
