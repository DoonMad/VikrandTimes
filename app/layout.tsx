import type { Metadata } from "next";
import { Noto_Sans_Devanagari, Inter } from "next/font/google";
import "./globals.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/layout/Footer";
import { Analytics } from '@vercel/analytics/next';
import Script from "next/script";

// Marathi font
const marathi = Noto_Sans_Devanagari({
  variable: "--font-marathi",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
});

// English font for fallback
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Vikrand Times - Marathi Weekly Newspaper",
    template: "%s | Vikrand Times",
  },
  description:
    "Vikrand Times is a Marathi weekly newspaper covering local news, public interest stories, and community issues.",
  metadataBase: new URL("https://vikrandtimes.com"),
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const supabase = await createClient();
  const {data: {user}} = await supabase.auth.getUser();

  return (
    <html lang="mr" className={`${marathi.variable} ${inter.variable}`}>
      <head>
        {/* Umami Analytics */}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="38090cc4-519e-4014-aa37-f5504164df72"
          strategy="afterInteractive"
        />
      </head>
      <AuthProvider user={user}>
        <body className="font-sans antialiased overflow-x-hidden bg-white">
          <Analytics /> {/* Vercel Analytics */}
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </body>
      </AuthProvider>
    </html>
  );
}