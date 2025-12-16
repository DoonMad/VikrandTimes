import PdfViewerClient from "@/components/pdfviewerclient";

export default function Edition() {
  const pdfUrl = "../vikrand.pdf";

  return <PdfViewerClient url={pdfUrl} />
}
