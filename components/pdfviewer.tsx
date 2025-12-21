"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.mjs";

const MIN_SCALE = 0.3;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.1;

export default function Viewer({ url }: { url: string }) {
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [isFitToWidth, setIsFitToWidth] = useState(true);
  const [pdfWidth, setPdfWidth] = useState(612);
  const [pdfHeight, setPdfHeight] = useState(792);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const [fitScale, setFitScale] = useState(1);
  
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const fitScaleRef = useRef(1);

  // Get PDF page dimensions
  const onPageLoadSuccess = useCallback((page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPdfWidth(viewport.width);
    setPdfHeight(viewport.height);
  }, []);

  // Calculate fit-to-width scale
  const calculateFitScale = useCallback(() => {
    if (!containerRef.current) return 1;
    
    const containerWidth = containerRef.current.clientWidth * 0.95;
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, containerWidth / pdfWidth));
  }, [pdfWidth]);

  // Initialize and handle resize
  useEffect(() => {
    const updateFitScale = () => {
      if (isFitToWidth && containerRef.current) {
        const newFitScale = calculateFitScale();
        fitScaleRef.current = newFitScale;
        setFitScale(newFitScale);
        setScale(newFitScale);
      }
    };

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateFitScale, 150);
    };

    window.addEventListener("resize", handleResize);
    updateFitScale();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isFitToWidth, calculateFitScale, pdfWidth]);

  // Handle fit-to-width
  const handleFitToWidth = useCallback(() => {
    setIsFitToWidth(true);
    const newScale = calculateFitScale();
    fitScaleRef.current = newScale;
    setFitScale(newScale);
    setScale(newScale);
    
    // Reset scroll to top-left
    if (scrollableRef.current) {
      scrollableRef.current.scrollLeft = 0;
      scrollableRef.current.scrollTop = 0;
    }
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
  const goToPrevPage = () => {
    setPage(p => Math.max(1, p - 1));
    if (scrollableRef.current) {
      scrollableRef.current.scrollLeft = 0;
      scrollableRef.current.scrollTop = 0;
    }
  };
  
  const goToNextPage = () => {
    setPage(p => numPages ? Math.min(numPages, p + 1) : p + 1);
    if (scrollableRef.current) {
      scrollableRef.current.scrollLeft = 0;
      scrollableRef.current.scrollTop = 0;
    }
  };

  // Drag to scroll functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when zoomed in
    if (scale <= fitScaleRef.current) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
    
    // Store current scroll position
    if (scrollableRef.current) {
      setScrollStart({
        x: scrollableRef.current.scrollLeft,
        y: scrollableRef.current.scrollTop,
      });
    }
    
    // Change cursor
    if (scrollableRef.current) {
      scrollableRef.current.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= fitScaleRef.current || !scrollableRef.current) return;

    // Calculate drag distance
    const deltaX = dragStart.x - e.clientX;
    const deltaY = dragStart.y - e.clientY;
    
    // Apply to scroll position (inverse because dragging moves content opposite direction)
    scrollableRef.current.scrollLeft = scrollStart.x + deltaX;
    scrollableRef.current.scrollTop = scrollStart.y + deltaY;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollableRef.current) {
      scrollableRef.current.style.cursor = scale > fitScaleRef.current ? "grab" : "default";
    }
  };

  // Update cursor based on zoom state
  useEffect(() => {
    if (scrollableRef.current) {
      scrollableRef.current.style.cursor = scale > fitScaleRef.current ? "grab" : "default";
    }
  }, [scale]);

  return (
    <div className="min-h-screen bg-white">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 ">
        <div className="max-w-7xl mx-auto">
          {/* Mobile layout */}
          <div className="md:hidden flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <button
                onClick={goToPrevPage}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300  cursor-pointer rounded hover:bg-gray-50 disabled:opacity-40"
              >
                ← Prev
              </button>
              
              <div className="text-sm font-medium">
                Page {page}{numPages && `/${numPages}`}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={numPages !== null && page === numPages}
                className="px-3 py-1.5 text-sm border border-gray-300  cursor-pointer rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleZoom(-ZOOM_STEP)}
                  className="w-8 h-8 flex items-center justify-center border  cursor-pointer border-gray-300 rounded hover:bg-gray-50"
                  title="Zoom Out"
                >
                  −
                </button>
                
                <div className="text-sm min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </div>
                
                <button
                  onClick={() => handleZoom(ZOOM_STEP)}
                  className="w-8 h-8 flex items-center justify-center border  cursor-pointer border-gray-300 rounded hover:bg-gray-50"
                  title="Zoom In"
                >
                  +
                </button>
              </div>
              
              <button
                onClick={handleFitToWidth}
                className={ `cursor-pointer px-3 py-1.5 text-sm border rounded ${
                  isFitToWidth 
                    ? 'bg-red-50 text-red-700 border-red-300' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Fit
              </button>
            </div>
          </div>
          
          {/* Desktop layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPrevPage}
                disabled={page === 1}
                className="cursor-pointer disabled:cursor-not-allowed px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                ← Previous
              </button>
              
              <div className="text-sm">
                <span className="font-medium">Page {page}</span>
                {numPages && <span className="text-gray-500"> of {numPages}</span>}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={numPages !== null && page === numPages}
                className="cursor-pointer disabled:cursor-not-allowed px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleZoom(-ZOOM_STEP)}
                  className="cursor-pointer disabled:cursor-not-allowed w-9 h-9 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                  title="Zoom Out"
                >
                  −
                </button>
                
                <div className="text-sm min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </div>
                
                <button
                  onClick={() => handleZoom(ZOOM_STEP)}
                  className="cursor-pointer disabled:cursor-not-allowed w-9 h-9 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                  title="Zoom In"
                >
                  +
                </button>
              </div>
              
              <button
                onClick={handleFitToWidth}
                className={`cursor-pointer disabled:cursor-not-allowed px-4 py-1.5 text-sm border rounded ${
                  isFitToWidth 
                    ? 'bg-red-50 text-red-700 border-red-300' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Fit to Width
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Container */}
      <div 
        ref={containerRef}
        className="w-full px-2 sm:px-4 bg-gray-200"
      >
        {/* Scrollable wrapper - BOTH scroll and drag control this */}
        <div 
          ref={scrollableRef}
          className="overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] "
          style={{ 
            maxHeight: "calc(100vh - 160px)",
            width: "100%",
            cursor: scale > fitScale ? "grab" : "default",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Page container - NO transforms now */}
          <div className="p-2 sm:p-4 w-fit mx-auto">
            <Document
              file={url}
              loading={
                <div className="flex items-center justify-center h-[600px] w-full">
                  <div className="text-gray-600">Loading newspaper...</div>
                </div>
              }
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              <Page
                key={`page-${page}-${scale}`}
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
            </Document>
            
            {/* Drag instruction overlay */}
            {scale > fitScale && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
                Drag or scroll to navigate
              </div>
            )}
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="text-sm text-gray-800">
            {scale > fitScale ? "Drag or scroll to navigate" : "Scroll to navigate"}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={page === 1}
              className="cursor-pointer disabled:cursor-not-allowed px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              Previous Page
            </button>
            
            <button
              onClick={goToNextPage}
              disabled={numPages !== null && page === numPages}
              className="cursor-pointer disabled:cursor-not-allowed px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              Next Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}