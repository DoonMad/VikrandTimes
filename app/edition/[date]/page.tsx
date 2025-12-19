import PdfViewerClient from "@/components/pdfviewerclient";

type PageProps = {
  params: Promise<{
    date: string;
  }>;
};

export default async function Edition({params}: PageProps) {
  const {date} = await params;
  const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/editions-pdf/editions/${date}.pdf`;
  return <PdfViewerClient url={pdfUrl} />
}
