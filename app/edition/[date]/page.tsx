import PdfViewerClient from "@/components/PdfViewer/pdfviewerclient";
import PdfViewerSkeleton from "@/components/PdfViewer/PdfViewerSkeleton";
import { Suspense } from "react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const url = `https://www.vikrandtimes.com/edition/${date}`;

  return {
    title: `Edition - ${date}`,
    description: `Read Vikrand Times Marathi newspaper edition published on ${date}.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `Vikrand Times Edition - ${date}`,
      description: `Read the latest Marathi weekly newspaper edition published on ${date}.`,
      url,
      siteName: "Vikrand Times",
      type: "article",
      images: [
        {
          url: `https://www.vikrandtimes.com/api/og?date=${date}`, 
          width: 1200,
          height: 630,
          alt: `Vikrand Times Edition - ${date}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Vikrand Times Edition - ${date}`,
      description: `Read the latest Marathi weekly newspaper edition published on ${date}.`,
      images: [`https://www.vikrandtimes.com/api/og?date=${date}`],
    },
  };
}

type PageProps = {
  params: Promise<{
    date: string;
  }>;
};

export default async function Edition({params}: PageProps) {
  const {date} = await params;
  const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/editions-pdf/editions/${date}.pdf`;
  const url = `https://www.vikrandtimes.com/edition/${date}`;

  // Organization Schema
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "Vikrand Times",
    "url": "https://www.vikrandtimes.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.vikrandtimes.com/logo.webp"
    }
  };

  // Article (Edition) Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": `Vikrand Times Edition - ${date}`,
    "datePublished": new Date(date).toISOString(),
    "dateModified": new Date(date).toISOString(),
    "author": [{
      "@type": "Organization",
      "name": "Vikrand Times",
      "url": "https://www.vikrandtimes.com"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Vikrand Times"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };

  return (
    <>
      {/* Structured Data injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Suspense fallback={<PdfViewerSkeleton/>}>
        <PdfViewerClient url={pdfUrl} />
      </Suspense>
    </>
  );
}
