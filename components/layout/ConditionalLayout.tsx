"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileTabBar from '@/components/layout/MobileTabBar'

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Reading pages: /edition/[date] and /special-edition/[slug]
  const isReadingPage =
    pathname.startsWith("/edition/") || pathname.startsWith("/special-edition/");
  
  // Admin pages have their own layout
  const isAdminPage = pathname.startsWith("/admin");

  // Pages where footer should appear
  const showFooter = !isReadingPage && !isAdminPage;

  // Pages where header should appear (hide on mobile reading, show on desktop reading)
  const showHeader = !isAdminPage;

  // Show bottom tab bar on mobile (except reading pages and admin)
  const showTabBar = !isReadingPage && !isAdminPage;

  return (
    <>
      {showHeader && (
        <div className={isReadingPage ? "hidden md:block" : ""}>
          <Header />
        </div>
      )}

      <main className={`min-h-screen ${showTabBar ? "has-tab-bar md:pb-0" : ""}`}>
        {children}
      </main>

      {showFooter && <Footer />}

      {showTabBar && (
        <div className="md:hidden">
          <MobileTabBar />
        </div>
      )}
    </>
  );
}
