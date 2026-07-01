import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="page-fade min-h-screen pt-32">{children}</main>
      <Footer />
    </>
  );
}
