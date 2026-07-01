import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { AdminI18nProvider } from "@/i18n/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminI18nProvider>
      <div className="min-h-screen bg-background text-on-background selection:bg-surface-variant selection:text-on-surface" data-pagefind-ignore>
        <AdminSidebar />
        <AdminTopbar />
        <div className="min-h-screen pb-28 pt-32 md:ml-64 md:pb-0 md:pt-36">{children}</div>
      </div>
    </AdminI18nProvider>
  );
}
