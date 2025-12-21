import type { Metadata } from "next";
import { Noto_Sans_Devanagari, Inter } from "next/font/google";
import "./globals.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/server";

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
  title: "Vikrand Times - साप्ताहिक मराठी वृत्तपत्र",
  description: "Vikrand Times - A Marathi weekly newspaper publishing for over 10 years",
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
      <AuthProvider user={user}>
        <body className="font-sans antialiased overflow-x-hidden bg-white">
          <Header />
          <main className="min-h-screen">{children}</main>
          
          {/* Footer */}
          <footer className="border-t border-gray-200 py-6 mt-8">
            <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
              <p>© {new Date().getFullYear()} Vikrand Times. सर्व हक्क राखीव.</p>
              <p className="mt-1">Postal Reg. No. H2/RNP/AGD-144/2017-1 | RNI NO. MAHMAR/20</p>
            </div>
          </footer>
        </body>
      </AuthProvider>
    </html>
  );
}