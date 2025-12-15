"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.mjs";

export default function Viewer({ url }: { url: string }) {
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(2.2);

  return (
    <div className="flex flex-col items-center bg-gray-100 py-4">

      {/* Toolbar */}
      <div className="mb-3 flex items-center gap-4 rounded border bg-white px-4 py-2 text-sm">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="text-gray-700 hover:text-red-700 disabled:opacity-40"
        >
          ← Prev
        </button>

        <span className="text-gray-600">
          Page {page}{numPages ? ` / ${numPages}` : ""}
        </span>

        <button
          onClick={() => setPage(p => (numPages ? Math.min(numPages, p + 1) : p + 1))}
          className="text-gray-700 hover:text-red-700"
        >
          Next →
        </button>

        <div className="h-4 w-px bg-gray-300" />

        <button
          onClick={() => setScale(s => s + 0.2)}
          className="text-gray-700 hover:text-red-700"
        >
          Zoom +
        </button>
        <button
          onClick={() => setScale(s => Math.max(1.5, s - 0.2))}
          className="text-gray-700 hover:text-red-700"
        >
          Zoom −
        </button>
      </div>

      {/* PDF */}
      <Document
        file={url}
        loading="Loading newspaper..."
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        <Page
          pageNumber={page}
          scale={scale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          devicePixelRatio={window.devicePixelRatio || 2}
        />
      </Document>
    </div>
  );
}
