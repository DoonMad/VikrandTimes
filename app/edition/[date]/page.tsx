import PdfViewerClient from "@/components/pdfviewerclient";

export default function Edition() {
  const pdfUrl = "../test.pdf";

  return (
    <div>
      <h1>PDF Edition Viewer</h1>
      <PdfViewerClient url={pdfUrl} />
    </div>
  );
}
