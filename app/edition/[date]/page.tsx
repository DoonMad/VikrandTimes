import PdfViewerClient from "@/components/PdfViewer/pdfviewerclient";
import PdfViewerSkeleton from "@/components/PdfViewer/PdfViewerSkeleton";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  return {
    title: `Edition - ${date}`,
    description: `Read Vikrand Times Marathi newspaper edition published on ${date}.`,
    openGraph: {
      title: `Vikrand Times - ${date}`,
      description: `Marathi weekly newspaper edition published on ${date}.`,
      url: `/edition/${date}`,
      type: "article",
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
  return (
    <Suspense fallback={<PdfViewerSkeleton/>}>
      <PdfViewerClient url={pdfUrl} />
    </Suspense>
  );
}
