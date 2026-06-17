"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Menu, Share2, ZoomIn, ZoomOut, Maximize, Keyboard, ChevronLeft, ChevronRight, X, Grid, Star, Expand, Shrink } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

// Automatically match the worker version to the pdfjs package version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const ZOOM_STEP = 0.25;

export interface ViewerProps {
  url: string;
  publishDate?: string;
  slug?: string;
  pageCount?: number;
  isSpecial?: boolean;
}

export default function Viewer({ url, publishDate, slug, pageCount, isSpecial = false }: ViewerProps) {
  const user = useAuth();
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [mobileScale, setMobileScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pdfWidth, setPdfWidth] = useState(800);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // UI States
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [isFit, setIsFit] = useState(true);
  const [pillPos, setPillPos] = useState({ x: 0, y: 0 });
  const [isPillDragging, setIsPillDragging] = useState(false);
  const pillDragRef = useRef({ isDragging: false, start: { x: 0, y: 0 } });

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // WebP Mode determination
  const isWebPMode = pageCount !== undefined && pageCount > 1;

  // Telemetry references
  const mountTimeRef = useRef(typeof performance !== "undefined" ? performance.now() : 0);
  const hasLoggedTelemetryRef = useRef(false);

  const recordTelemetryTiming = async () => {
    if (hasLoggedTelemetryRef.current || !isWebPMode) return;
    hasLoggedTelemetryRef.current = true;

    const loadTimeMs = Math.round(performance.now() - mountTimeRef.current);
    console.log(`⏱️ Client render loaded in ${loadTimeMs}ms`);

    try {
      const targetId = isSpecial ? slug : publishDate;
      if (!targetId) return;

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const { createClient } = await import("@supabase/supabase-js");
      const client = createClient(supabaseUrl, supabaseKey);

      const { data } = await client
        .from("metrics")
        .select("id")
        .eq("target_id", targetId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        await client
          .from("metrics")
          .update({ client_load_time_ms: loadTimeMs })
          .eq("id", data[0].id);
      }
    } catch (err) {
      console.warn("Failed to log telemetry:", err);
    }
  };

  // Bind numPages to pageCount in WebP mode
  useEffect(() => {
    if (isWebPMode && pageCount) {
      setNumPages(pageCount);
      pageRefs.current = new Array(pageCount).fill(null);
    }
  }, [isWebPMode, pageCount]);

  // 1. Mount & Mobile Detection
  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    
    return () => {
      mql.removeEventListener("change", handler);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  // 2. Auto-hide mobile toolbar logic
  useEffect(() => {
    if (!isMobile) return;
    let timeout: NodeJS.Timeout;
    
    const resetTimer = () => {
      setIsToolbarVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsToolbarVisible(false);
      }, 3000); // hide after 3s of inactivity
    };

    const handleInteraction = () => resetTimer();
    
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("scroll", handleInteraction);
    
    resetTimer(); // initial Start
    
    return () => {
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
      clearTimeout(timeout);
    };
  }, [isMobile]);

  // 3. Desktop Fit-to-Width Calculation
  const calculateFitScale = useCallback(() => {
    if (!containerRef.current) return 1;
    // 48px padding (24 on each side)
    const containerWidth = containerRef.current.clientWidth - 48; 
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, containerWidth / pdfWidth));
  }, [pdfWidth]);

  useEffect(() => {
    if (!isMobile && isFit) {
      const handleResize = () => setScale(calculateFitScale());
      window.addEventListener("resize", handleResize);
      setScale(calculateFitScale());
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isMobile, isFit, calculateFitScale]);

  // 4. Mobile: Intersection Observer for current page
  useEffect(() => {
    if (!isMobile || !numPages) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = Number(entry.target.getAttribute("data-page-index"));
            if (pageIndex) setCurrentPage(pageIndex);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px" } // trigger when page crosses the middle of screen
    );

    pageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [isMobile, numPages]);

  // 5. Desktop Keyboard Shortcuts
  useEffect(() => {
    if (isMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevPage();
      if (e.key === "ArrowRight") goToNextPage();
      if (e.key === "+" || e.key === "=") handleZoom(1);
      if (e.key === "-") handleZoom(-1);
      if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
      if (e.key.toLowerCase() === "w") {
        setIsFit(true);
        setScale(calculateFitScale());
      }
      if (e.key.toLowerCase() === "s") handleShare();
      
      // Vertical Scroll
      const scrollAmount = 50;
      const scrollTarget = containerRef.current?.querySelector('.overflow-auto') as HTMLDivElement;
      if (scrollTarget) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          scrollTarget.scrollBy({ top: scrollAmount, behavior: "smooth" });
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          scrollTarget.scrollBy({ top: -scrollAmount, behavior: "smooth" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, currentPage, numPages, calculateFitScale]);

  const onPageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPdfWidth(viewport.width);
  };

  const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(numPages || p, p + 1));
  
  const handleZoom = (direction: number) => {
    setIsFit(false);
    setScale((s) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s + direction * ZOOM_STEP)));
  };

  const handleMobileZoom = (direction: number) => {
    setMobileScale((s) => Math.max(1, Math.min(3, s + direction * 0.5)));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vikrand Times Edition`,
          text: `Read this edition of Vikrand Times`,
          url: window.location.href,
        });
      } catch (err) {}
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (e) {
        alert("Unable to copy link.");
      }
    } else {
      alert("Sharing is not fully supported in this browser context.");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error("Error attempting to enable fullscreen:", err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const jumpToPage = (targetPage: number) => {
    setCurrentPage(targetPage);
    if (isMobile && pageRefs.current[targetPage - 1]) {
      pageRefs.current[targetPage - 1]?.scrollIntoView({ behavior: "smooth" });
    }
    setDrawerOpen(false);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary-fixed border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const progressPercentage = numPages ? (currentPage / numPages) * 100 : 0;

  return (
    <div className="relative min-h-screen bg-surface" ref={containerRef}>
      
      {/* READING PROGRESS BAR */}
      <div 
        className="fixed top-0 left-0 h-[3px] bg-primary z-100 transition-all duration-300 ease-out"
        style={{ width: `${progressPercentage}%` }}
      />

      {/* =============================================
          MOBILE CONTINUOUS SCROLL VIEW
          ============================================= */}
      {isMobile ? (
        <div className="w-full pb-24">
          {isWebPMode ? (
            // Render WebP images directly on mobile
            Array.from({ length: numPages || 0 }, (_, i) => i + 1).map((pageNum) => {
              const imageUrl = isSpecial
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/special-editions-pdf/webp/${slug}/page-${pageNum}.webp`
                : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/editions-pdf/webp/${publishDate}/page-${pageNum}.webp`;

              return (
                <div 
                  key={pageNum}
                  data-page-index={pageNum}
                  ref={(el) => { pageRefs.current[pageNum - 1] = el; }}
                  className="w-full relative shadow-sm border-b border-surface-container-high"
                >
                  <div className="w-full py-3 flex flex-col items-center justify-center bg-surface-container-low">
                    <div className="h-px w-1/4 bg-outline-variant/30 mb-1"></div>
                    <span className="text-[10px] text-on-surface-variant font-label tracking-wide">
                      Page {pageNum}
                    </span>
                  </div>
                  
                  <div className={`paper-grain w-full overflow-x-auto ${mobileScale > 1 ? 'block' : 'flex justify-center'} [scrollbar-width:none]`}>
                    <div className={`w-max ${mobileScale > 1 ? '' : 'mx-auto'}`}>
                      <img
                        src={imageUrl}
                        alt={`Page ${pageNum}`}
                        loading={pageNum <= 2 ? "eager" : "lazy"}
                        onLoad={() => {
                          if (pageNum === 1) recordTelemetryTiming();
                        }}
                        style={{
                          width: typeof window !== "undefined" ? `${window.innerWidth * mobileScale}px` : "100%",
                          height: "auto"
                        }}
                        className="block shadow-sm border border-surface-container-high"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Fallback: render original PDF
            <Document
              file={url}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                pageRefs.current = new Array(numPages).fill(null);
              }}
              loading={
                <div className="flex flex-col items-center justify-center p-20">
                  <div className="w-10 h-10 border-4 border-primary-fixed border-t-primary rounded-full animate-spin"></div>
                </div>
              }
            >
              {Array.from({ length: numPages || 0 }, (_, i) => i + 1).map((pageNum) => (
                <div 
                  key={pageNum}
                  data-page-index={pageNum}
                  ref={(el) => { pageRefs.current[pageNum - 1] = el; }}
                  className="w-full relative shadow-sm border-b border-surface-container-high"
                >
                  <div className="w-full py-3 flex flex-col items-center justify-center bg-surface-container-low">
                    <div className="h-px w-1/4 bg-outline-variant/30 mb-1"></div>
                    <span className="text-[10px] text-on-surface-variant font-label tracking-wide">
                      Page {pageNum}
                    </span>
                  </div>
                  
                  <div className={`paper-grain w-full overflow-x-auto ${mobileScale > 1 ? 'block' : 'flex justify-center'} [scrollbar-width:none]`}>
                    <div className={`w-max ${mobileScale > 1 ? '' : 'mx-auto'}`}>
                      <Page
                        pageNumber={pageNum}
                        width={typeof window !== "undefined" ? window.innerWidth * mobileScale : 400}
                        devicePixelRatio={typeof window !== "undefined" ? Math.max(window.devicePixelRatio || 1, 2) : 2}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading={
                          <div className="flex items-center justify-center aspect-[1/1.4] w-full text-on-surface-variant">
                            Loading page {pageNum}...
                          </div>
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Document>
          )}

          {/* Mobile Floating Toolbar Pill (Draggable) */}
          <div 
            className={`fixed bottom-24 left-1/2 z-110 w-[260px] floating-toolbar cursor-grab active:cursor-grabbing ${!isToolbarVisible && !drawerOpen ? 'hidden-toolbar' : ''}`}
            style={{ 
              transform: `translate(calc(-50% + ${pillPos.x}px), ${pillPos.y}px)`, 
              touchAction: "none",
              transition: isPillDragging ? "none" : "opacity 300ms ease, transform 300ms ease"
            }}
            onPointerDown={(e) => {
              pillDragRef.current.isDragging = true;
              setIsPillDragging(true);
              pillDragRef.current.start = { x: e.clientX - pillPos.x, y: e.clientY - pillPos.y };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!pillDragRef.current.isDragging) return;
              setPillPos({
                x: e.clientX - pillDragRef.current.start.x,
                y: e.clientY - pillDragRef.current.start.y,
              });
            }}
            onPointerUp={(e) => {
              pillDragRef.current.isDragging = false;
              setIsPillDragging(false);
              e.currentTarget.releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={(e) => {
              pillDragRef.current.isDragging = false;
              setIsPillDragging(false);
              e.currentTarget.releasePointerCapture(e.pointerId);
            }}
          >
            <nav className="bg-inverse-surface/90 backdrop-blur-md rounded-full px-5 py-3 flex items-center justify-between shadow-2xl">
              <button 
                onClick={(e) => { e.stopPropagation(); setDrawerOpen(true); }}
                className="text-inverse-on-surface p-1 active:scale-95 transition-transform cursor-pointer"
              >
                <Menu size={22} className="text-white" />
              </button>
              
              <div className="w-px h-5 bg-white/20 mx-1"></div>
              
              <div className="flex items-center gap-1 text-white select-none">
                <span className="font-semibold text-sm">{currentPage}</span>
                <span className="text-white/60 text-xs mt-0.5">/ {numPages || '-'}</span>
              </div>
              
              <div className="w-px h-5 bg-white/20 mx-1"></div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); handleShare(); }}
                className="text-inverse-on-surface p-1 active:scale-95 transition-transform cursor-pointer"
              >
                <Share2 size={20} className="text-white" />
              </button>
            </nav>
          </div>

          {/* Zoom Controls for mobile */}
          <div 
            className={`fixed bottom-[160px] right-5 z-100 flex flex-col bg-surface-container-lowest border border-surface-container-high rounded-full shadow-lg floating-toolbar overflow-hidden ${!isToolbarVisible && !drawerOpen ? 'hidden-toolbar' : ''}`}
            style={{ transition: "opacity 300ms ease, transform 300ms ease" }}
          >
            <button 
              onClick={() => handleMobileZoom(1)}
              disabled={mobileScale >= 3}
              className="cursor-pointer w-11 h-11 flex items-center justify-center text-on-surface hover:bg-surface-container-low disabled:opacity-30 transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            
            {mobileScale > 1 ? (
              <div className="w-full text-center text-[11px] py-1 font-bold text-primary border-y border-surface-container-high bg-primary-fixed/30 select-none">
                {mobileScale}x
              </div>
            ) : (
              <div className="w-8 h-px bg-surface-container-high mx-auto"></div>
            )}

            <button 
              onClick={() => handleMobileZoom(-1)}
              disabled={mobileScale <= 1}
              className="cursor-pointer w-11 h-11 flex items-center justify-center text-on-surface hover:bg-surface-container-low disabled:opacity-30 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
          </div>

          {/* Slide-in Drawer Overlay */}
          <div 
            className={`drawer-overlay ${drawerOpen ? 'open' : ''}`}
            onClick={() => setDrawerOpen(false)}
          ></div>

          {/* Slide-in Drawer Panel */}
          <div className={`drawer-panel ${drawerOpen ? 'open' : ''} flex flex-col`}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-container-high">
              <span className="font-headline font-bold text-lg text-primary">विक्रांद टाइम्स</span>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-on-surface hover:bg-surface-container-low rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Jump to Page */}
              {numPages && (
                <div>
                  <h3 className="text-sm font-semibold text-on-surface-variant mb-3 uppercase tracking-wider">
                    Jump to Page
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => jumpToPage(p)}
                        className={`h-10 rounded-lg text-sm font-medium transition-colors ${
                          p === currentPage 
                            ? 'bg-primary-container text-on-primary' 
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <hr className="border-surface-container-high" />

              {/* Navigation */}
              <div>
                <h3 className="text-sm font-semibold text-on-surface-variant mb-3 uppercase tracking-wider">
                  Menu
                </h3>
                <div className="space-y-1">
                  <Link href="/archive" className="flex items-center gap-3 w-full p-3 rounded-lg text-on-surface hover:bg-surface-container-low">
                    <Grid size={18} /> Archive
                  </Link>
                  <Link href="/special-editions" className="flex items-center gap-3 w-full p-3 rounded-lg text-secondary bg-secondary-fixed/30">
                    <Star size={18} /> Special Editions
                  </Link>
                  <button onClick={handleShare} className="flex items-center gap-3 w-full p-3 rounded-lg text-on-surface hover:bg-surface-container-low">
                    <Share2 size={18} /> Share Edition
                  </button>
                  <button onClick={() => { toggleFullscreen(); setDrawerOpen(false); }} className="flex items-center gap-3 w-full p-3 rounded-lg text-on-surface hover:bg-surface-container-low">
                    {isFullscreen ? <Shrink size={18} /> : <Expand size={18} />} 
                    {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer Auth */}
            <div className="p-4 border-t border-surface-container-high">
              {!user ? (
                <Link href="/auth" className="flex items-center justify-center w-full py-3 bg-primary-container text-on-primary font-medium rounded-lg">
                  Sign In
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-on-surface truncate w-32">{user.email}</div>
                    <div className="text-xs text-on-surface-variant">My Account</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* =============================================
           DESKTOP SINGLE PAGE VIEW
           ============================================= */
        <div className="w-full flex flex-col h-[calc(100vh-56px)]">
          {/* Top Toolbar */}
          <div className="h-[52px] bg-surface-container-lowest border-b border-surface-container-high px-4 flex items-center justify-between shrink-0 shadow-sm z-10">
            {/* Left: Pagination */}
            <div className="flex items-center gap-4 w-1/3">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-outline-variant/60 rounded justify-center hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> <span className="text-sm hidden lg:inline">Previous</span>
              </button>
              
              <div className="text-sm font-medium text-on-surface">
                Page {currentPage} {numPages && <span className="text-on-surface-variant font-normal">of {numPages}</span>}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={numPages !== null && currentPage === numPages}
                className="flex items-center gap-1 px-3 py-1.5 border border-outline-variant/60 rounded hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-sm hidden lg:inline">Next</span> <ChevronRight size={16} />
              </button>
            </div>

            {/* Center: Title info (optional, keeping it clean) */}
            <div className="w-1/3 text-center hidden md:block">
              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                Reader Mode
              </span>
            </div>

            {/* Right: Tools & Zoom */}
            <div className="flex items-center justify-end gap-3 w-1/3">
              {/* Zoom Controls */}
              <div className="flex items-center bg-surface-container-low rounded border border-outline-variant/60">
                <button
                  onClick={() => handleZoom(-1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-l text-on-surface-variant"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <div className="w-12 text-center text-xs font-semibold text-on-surface border-x border-outline-variant/60 py-2">
                  {Math.round(scale * 100)}%
                </div>
                <button
                  onClick={() => handleZoom(1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-r text-on-surface-variant"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              <button
                onClick={() => {
                  setIsFit(true);
                  setScale(calculateFitScale());
                }}
                className={`flex items-center justify-center px-3 py-1.5 border rounded text-sm font-medium ${
                  isFit 
                    ? "bg-primary-fixed text-primary border-primary/30" 
                    : "border-outline-variant/60 hover:bg-surface-container-low"
                }`}
                title="Fit to Width (F)"
              >
                <Maximize size={16} className="hidden lg:block lg:mr-1.5" /> Fit
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="flex items-center justify-center px-3 py-1.5 border border-outline-variant/60 hover:bg-surface-container-low rounded text-sm font-medium text-on-surface"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Shrink size={16} /> : <Expand size={16} />}
              </button>
              
              <div className="w-px h-6 bg-outline-variant/50 mx-1"></div>

              <button
                onClick={handleShare}
                className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                title="Share (S)"
              >
                <Share2 size={18} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShortcutsOpen(!shortcutsOpen)}
                  className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                  title="Keyboard Shortcuts"
                >
                  <Keyboard size={18} />
                </button>
                
                {/* Keyboard Shortcuts Popover */}
                {shortcutsOpen && (
                  <>
                    <div className="fixed inset-0 z-190" onClick={() => setShortcutsOpen(false)} />
                    <div className="absolute right-0 top-12 w-64 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container-high p-4 z-200 animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-semibold text-sm mb-3">Keyboard Shortcuts</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-on-surface-variant">Previous / Next</span>
                          <span className="bg-surface-container-high px-2 py-1 rounded font-mono">← / →</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-on-surface-variant">Zoom In / Out</span>
                          <span className="bg-surface-container-high px-2 py-1 rounded font-mono">+ / -</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-on-surface-variant">Scroll Up / Down</span>
                          <span className="bg-surface-container-high px-2 py-1 rounded font-mono">↑ / ↓</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-on-surface-variant">Fullscreen</span>
                          <span className="bg-surface-container-high px-2 py-1 rounded font-mono">F</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-on-surface-variant">Fit to Width</span>
                          <span className="bg-surface-container-high px-2 py-1 rounded font-mono">W</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-on-surface-variant">Share</span>
                          <span className="bg-surface-container-high px-2 py-1 rounded font-mono">S</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Subdued Background Canvas */}
          <div className="flex-1 overflow-auto bg-surface py-6 px-4 flex justify-center [scrollbar-width:thin]">
            <div className="relative shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-sm">
              {isWebPMode ? (
                // Render WebP page directly on desktop
                <div className="paper-grain bg-white">
                  <img
                    src={
                      isSpecial
                        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/special-editions-pdf/webp/${slug}/page-${currentPage}.webp`
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/editions-pdf/webp/${publishDate}/page-${currentPage}.webp`
                    }
                    alt={`Page ${currentPage}`}
                    onLoad={recordTelemetryTiming}
                    style={{
                      width: `${pdfWidth * scale}px`,
                      height: "auto",
                      maxWidth: "none"
                    }}
                    className="block shadow-sm"
                  />
                </div>
              ) : (
                // Fallback: render original PDF page
                <Document
                  file={url}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={
                    <div className="flex items-center justify-center w-[800px] h-[1000px] bg-white text-on-surface-variant">
                      <div className="w-10 h-10 border-4 border-primary-fixed border-t-primary rounded-full animate-spin"></div>
                    </div>
                  }
                >
                  <div className="paper-grain bg-white">
                    <Page
                      pageNumber={currentPage}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      onLoadSuccess={onPageLoadSuccess}
                      loading={
                        <div className="flex items-center justify-center w-[800px] h-[1000px] bg-white text-on-surface-variant">
                          Rendering page...
                        </div>
                      }
                    />
                  </div>
                </Document>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}