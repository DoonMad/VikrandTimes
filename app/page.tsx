import PdfViewerClient from "@/components/PdfViewer/pdfviewerclient";
import PdfViewerSkeleton from "@/components/PdfViewer/PdfViewerSkeleton";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vikrand Times - Marathi Weekly Newspaper | Read Latest Edition",
  description:
    "Read the latest edition of Vikrand Times, a trusted Marathi weekly newspaper covering local news, public interest stories, and community issues since 2015.",
  alternates: {
    canonical: "https://www.vikrandtimes.com",
  },
  openGraph: {
    title: "Vikrand Times - Marathi Weekly Newspaper",
    description: "Read the latest edition of Vikrand Times",
    url: "https://www.vikrandtimes.com",
    siteName: "Vikrand Times",
    type: "website",
    images: [
      {
        url: "https://www.vikrandtimes.com/api/og?title=Latest%20Edition",
        width: 1200,
        height: 630,
        alt: "Vikrand Times - Latest Edition",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vikrand Times - Marathi Weekly Newspaper",
    description: "Read the latest edition of Vikrand Times",
    images: ["https://www.vikrandtimes.com/api/og?title=Latest%20Edition"],
  },
};

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("editions")
    .select("publish_date")
    .order("publish_date", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-on-surface mb-2">
            Vikrand Times
          </h1>
          <p className="text-on-surface-variant">
            We are facing some issues loading the latest edition. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/editions-pdf/editions/${data.publish_date}.pdf`;

  // Organization Schema for SEO
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "Vikrand Times",
    url: "https://www.vikrandtimes.com",
    logo: {
      "@type": "ImageObject",
      url: "https://www.vikrandtimes.com/logo.png",
    },
    foundingDate: "2015",
    description:
      "Vikrand Times is a Marathi weekly newspaper covering local news, public interest stories, and community issues.",
  };

  // Current edition as NewsArticle
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: `Vikrand Times - Latest Edition (${data.publish_date})`,
    datePublished: new Date(data.publish_date).toISOString(),
    dateModified: new Date(data.publish_date).toISOString(),
    author: [
      {
        "@type": "Organization",
        name: "Vikrand Times",
        url: "https://www.vikrandtimes.com",
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "Vikrand Times",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://www.vikrandtimes.com",
    },
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Suspense fallback={<PdfViewerSkeleton />}>
        <PdfViewerClient url={pdfUrl} />
      </Suspense>
    </>
  );
}
