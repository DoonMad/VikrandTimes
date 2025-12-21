// this file is a wrapper to use pdfviewer because it acnnot be directly imported into page.tsx as it is a server component and
// react-pdf is used in pdfviewer and it runs only in client components.
// even if i just import viewer from pdfviewer, we will get an error. so we are using this wrapper and using dynamic import here with ssr: false and then using this in page.tsx

"use client";

import dynamic from "next/dynamic";
import PdfViewerSkeleton from "./PdfViewerSkeleton";

const PdfViewer = dynamic(
  () => import("./pdfviewer"),
  {
    ssr: false,
    loading: () => <PdfViewerSkeleton />,
  }
);

export default function PdfViewerClient({ url }: { url: string }) {
  return (
      <PdfViewer url={url} />
  );
}
