import Footer from "@/app/Footer";
import { Header } from "@/components/Header";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <>
          <Header />
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
            {children}
          </div>
        <Footer />
      </>
  );
}
