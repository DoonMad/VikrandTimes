import PdfViewerClient from "@/components/pdfviewerclient";

export default function Edition() {
  const pdfUrl = "../test.pdf";

  return <PdfViewerClient url={pdfUrl} />
}
