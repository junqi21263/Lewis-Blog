import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = {
  title: {
    absolute: "Lewis Photograph Blog CMS",
  },
  description: "Editorial CMS for Lewis Photograph Blog.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
