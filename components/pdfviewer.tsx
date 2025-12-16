"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.mjs";

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const ZOOM_STEP = 0.2;

export default function Viewer({ url }: { url: string }) {
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [isFitToWidth, setIsFitToWidth] = useState(true);
  const [pdfWidth, setPdfWidth] = useState(612); // Default US Letter width
  const containerRef = useRef<HTMLDivElement>(null);

  // Storing the fit scale in a ref to avoid state updates. if we use useState then changing it will trigger a re-render
  const fitScaleRef = useRef(1);

  // Get the page width once when PDF loads. type of page is currently set to any.
  const onPageLoadSuccess = (page) => {
    setPdfWidth(page.getViewport({ scale: 1 }).width); // scale 1 means original size of pdf. viewport also has more objects other than width. we only need width.
  };

  // Calculate fit-to-width scale without causing re-renders, therefore using useCallback
  const calculateFitScale = useCallback(() => {
    if (!containerRef.current) return 1;
    
    const containerWidth = containerRef.current.clientWidth - 32; // Account for padding (16 left + 16 right)
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, containerWidth / pdfWidth));
  }, [pdfWidth]);

  // Update fit scale when container resizes
  useEffect(() => {
    const updateFitScale = () => {
      if (isFitToWidth && containerRef.current) {
        fitScaleRef.current = calculateFitScale();
        setScale(fitScaleRef.current);
      }
    };

    // Debounce the resize to prevent flickering
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateFitScale, 100);
    };

    window.addEventListener("resize", handleResize);
    updateFitScale(); // Initial calculation

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isFitToWidth, calculateFitScale]);

  // Handle fit-to-width button click
  const handleFitToWidth = useCallback(() => {
    setIsFitToWidth(true);
    const newScale = calculateFitScale();
    fitScaleRef.current = newScale;
    setScale(newScale);
  }, [calculateFitScale]);

  // Handle manual zoom
  const handleZoom = (delta: number) => {
    setIsFitToWidth(false);
    setScale(s => {
      const newScale = s + delta;
      return Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    });
  };

  // Page navigation
  const goToPrevPage = () => setPage(p => Math.max(1, p - 1));
  const goToNextPage = () => setPage(p => numPages ? Math.min(numPages, p + 1) : p + 1);

  return (
    <div className="min-h-screen bg-white">
      {/* Toolbar - Simple and clean */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left: Page navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={goToPrevPage}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              ← Prev
            </button>
            
            <div className="text-sm">
              <span className="text-gray-700">Page {page}</span>
              {numPages && (
                <span className="text-gray-500"> / {numPages}</span>
              )}
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={numPages !== null && page === numPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              Next →
            </button>
          </div>

          {/* Right: Zoom controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleZoom(-ZOOM_STEP)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              title="Zoom Out"
            >
              -
            </button>
            
            <div className="text-sm text-gray-700 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </div>
            
            <button
              onClick={() => handleZoom(ZOOM_STEP)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              title="Zoom In"
            >
              +
            </button>
            
            <button
              onClick={handleFitToWidth}
              className={`px-3 py-1.5 text-sm border rounded ${
                isFitToWidth 
                  ? 'bg-red-50 text-red-700 border-red-300' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              title="Fit to Width"
            >
              Fit Width
            </button>
          </div>
        </div>
      </div>

      {/* PDF Container - Scrollable area */}
      <div 
        ref={containerRef}
        className="max-w-6xl mx-auto px-4 py-6"
      >
        {/* Scrollable wrapper for when PDF is zoomed in */}
        <div className="overflow-auto border border-gray-200 rounded-lg bg-gray-50">
          <div className="min-h-[600px] p-4">
            <Document
              file={url}
              loading={
                <div className="flex items-center justify-center h-[600px]">
                  <div className="text-gray-600">Loading newspaper...</div>
                </div>
              }
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              <div className="w-fit mx-auto">
                <Page
                  key={`page-${page}`} // Force re-render on page change
                  pageNumber={page}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onLoadSuccess={onPageLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center h-[600px]">
                      <div className="text-gray-500">Loading page...</div>
                    </div>
                  }
                />
              </div>
            </Document>
          </div>
        </div>

        {/* Simple bottom navigation */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              Previous Page
            </button>
            
            <button
              onClick={goToNextPage}
              disabled={numPages !== null && page === numPages}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              Next Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}