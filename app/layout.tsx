import type { Metadata, Viewport } from "next";
import { Noto_Sans_Devanagari, Inter, Newsreader } from "next/font/google";
import "./globals.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/server";
import { Analytics } from '@vercel/analytics/next';
import Script from "next/script";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import PWAInstallPrompt from "@/components/layout/PWAInstallPrompt";

// Marathi font
const marathi = Noto_Sans_Devanagari({
  variable: "--font-marathi",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
});

// English font for body/labels
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Headline/Display font — editorial serif
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#93000b",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vikrandtimes.com"),
  title: {
    default: "Vikrand Times - Marathi Weekly Newspaper",
    template: "%s | Vikrand Times",
  },
  description:
    "Vikrand Times is a Marathi weekly newspaper covering local news, public interest stories, and community issues.",
  keywords: ["Vikrand Times", "Marathi newspaper", "weekly news", "local news Marathi", "Maharashtra news"],
  authors: [{ name: "Vikrand Times" }],
  openGraph: {
    type: "website",
    locale: "mr_IN",
    url: "https://www.vikrandtimes.com",
    siteName: "Vikrand Times",
    title: "Vikrand Times - Marathi Weekly Newspaper",
    description: "Vikrand Times is a Marathi weekly newspaper covering local news, public interest stories, and community issues.",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Vikrand Times Default Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vikrand Times - Marathi Weekly Newspaper",
    description: "Vikrand Times is a Marathi weekly newspaper covering local news, public interest stories, and community issues.",
    images: ["/og-image.webp"],
  },
  alternates: {
    canonical: "https://www.vikrandtimes.com",
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const supabase = await createClient();
  const {data: {user}} = await supabase.auth.getUser();

  return (
    <html lang="mr" className={`${marathi.variable} ${inter.variable} ${newsreader.variable}`}>
      <head>
        {/* Umami Analytics */}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="38090cc4-519e-4014-aa37-f5504164df72"
          strategy="afterInteractive"
        />
      </head>
      <AuthProvider user={user}>
        <body className="font-body antialiased overflow-x-hidden bg-surface text-on-surface">
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <PWAInstallPrompt />
        </body>
      </AuthProvider>
    </html>
  );
}