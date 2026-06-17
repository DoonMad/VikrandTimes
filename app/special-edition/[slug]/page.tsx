import PdfViewerClient from "@/components/PdfViewer/pdfviewerclient";
import PdfViewerSkeleton from "@/components/PdfViewer/PdfViewerSkeleton";
import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: edition } = await supabase
    .from("special_editions")
    .select("title, thumbnail_url, publish_date")
    .eq("slug", slug)
    .single();

  if (!edition) {
    return { title: "Special Edition Not Found" };
  }

  const url = `https://www.vikrandtimes.com/special-edition/${slug}`;
  const displayImage = edition.thumbnail_url || `https://www.vikrandtimes.com/api/og?title=${encodeURIComponent(edition.title)}&type=special`;

  return {
    title: `${edition.title} - Special Edition`,
    description: `Read the Vikrand Times exclusive special edition: ${edition.title}.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${edition.title} - Vikrand Times Special Edition`,
      description: `Read the Vikrand Times exclusive special edition: ${edition.title}.`,
      url,
      siteName: "Vikrand Times",
      type: "article",
      images: [
        {
          url: displayImage,
          width: 1200,
          height: 630,
          alt: edition.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${edition.title} - Vikrand Times Special Edition`,
      images: [displayImage],
    },
  };
}

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SpecialEdition({params}: PageProps) {
  const {slug} = await params;
  const supabase = await createClient();

  const { data: edition, error } = await supabase
    .from("special_editions")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !edition) {
    notFound();
  }

  // File is named as slug.pdf inside special-editions-pdf bucket
  const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/special-editions-pdf/${slug}.pdf`;
  const url = `https://www.vikrandtimes.com/special-edition/${slug}`;

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
    "headline": `${edition.title} - Special Edition`,
    "image": edition.thumbnail_url ? [edition.thumbnail_url] : [`https://www.vikrandtimes.com/api/og?title=${encodeURIComponent(edition.title)}&type=special`],
    "datePublished": new Date(edition.publish_date).toISOString(),
    "dateModified": new Date(edition.updated_at).toISOString(),
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="bg-amber-50 min-h-screen">
        <Suspense fallback={<PdfViewerSkeleton/>}>
          <PdfViewerClient 
            url={pdfUrl} 
            slug={slug} 
            pageCount={edition.page_count} 
            isSpecial={true} 
          />
        </Suspense>
      </div>
    </>
  );
}
