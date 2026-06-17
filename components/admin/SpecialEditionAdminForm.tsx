"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, AlertCircle, CheckCircle, FileText, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * Renders page 1 of a PDF file onto an off-screen canvas
 * and returns it as a JPEG Blob for use as a thumbnail.
 */
async function generateThumbnailFromPdf(pdfFile: File): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  // Render at 2x scale for a crisp thumbnail image
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/jpeg",
      0.85
    );
  });
}

export default function SpecialEditionAdminForm() {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Conversion progress states
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const isSlugEdited = useRef(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (!isSlugEdited.current) {
      setSlug(generateSlug(title));
    }
  }, [title]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "pdf" | "image") => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (type === "pdf") {
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are allowed for the edition.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setFile(selectedFile);
    } else {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Only image files are allowed for the thumbnail.");
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
        return;
      }
      setThumbnail(selectedFile);
    }
    setError(null);
  };

  const clearFile = (type: "pdf" | "image") => {
    if (type === "pdf") {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      setThumbnail(null);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }
  };

  const clearForm = () => {
    setTitle("");
    setSlug("");
    setDate("");
    clearFile("pdf");
    clearFile("image");
    setError(null);
  };

  const pollJobStatus = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/jobs/status/${jobId}`);
        if (!res.ok) throw new Error("Failed to check status");

        const data = await res.json();
        
        if (data.status === "processing") {
          setStatus("processing");
          setStatusMsg(`Processing page ${data.progress} of ${data.total}...`);
          setProgress(data.progress);
          setTotalPages(data.total);
        } else if (data.status === "completed") {
          clearInterval(interval);
          setSuccess(true);
          setStatus(null);
          setStatusMsg("");
          setLoading(false);
          clearForm();
          router.refresh();
          setTimeout(() => setSuccess(false), 3000);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setError(data.error || "Conversion failed");
          setStatus(null);
          setStatusMsg("");
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Polling error:", err);
      }
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !date || !file) {
      setError("Title, slug, date, and PDF are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("uploading");
    setStatusMsg("Uploading PDF and assets...");
    setProgress(0);
    setTotalPages(0);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("date", date);
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("isSpecial", "true");

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      const response = await fetch("http://localhost:4000/api/editions/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Upload to conversion service failed");
      }

      const { jobId } = await response.json();
      pollJobStatus(jobId);
    } catch(err: any) {
      console.error(err);
      setError(err.message ?? "Upload failed. Please try again.");
      setStatus(null);
      setStatusMsg("");
      setLoading(false);
    }
  };

  return (
    <div className="place-items-center">
      <form onSubmit={handleSubmit} className="max-w-xl space-y-6 bg-surface-container-lowest border border-surface-container-high rounded-2xl p-8 w-full shadow-sm">
        <h2 className="text-xl font-headline font-bold text-secondary inline-flex items-center gap-2">
          Publish Special Edition
        </h2>

        {success && (
          <div className="flex items-center gap-2 text-sm text-(--color-tertiary) bg-tertiary/10 border border-tertiary/20 px-4 py-3 rounded-xl font-medium">
            <CheckCircle size={18} /> Special edition published successfully
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-sm text-error bg-error-container border border-error/20 px-4 py-3 rounded-xl font-medium">
            <AlertCircle size={18} /> {error}
          </div>
        )}
        {loading && statusMsg && (
          <div className="flex flex-col gap-2 p-4 bg-secondary-fixed/30 border border-secondary/20 rounded-xl font-medium select-none">
            <div className="flex items-center gap-2 text-secondary text-sm">
              <Loader2 size={18} className="animate-spin" />
              {statusMsg}
            </div>
            {status === "processing" && totalPages > 0 && (
              <div className="w-full bg-secondary-fixed/20 rounded-full h-1.5 overflow-hidden mt-1">
                <div
                  className="bg-secondary h-full transition-all duration-300"
                  style={{ width: `${(progress / totalPages) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-semibold text-on-surface uppercase tracking-wider">Edition Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Diwali Special 2026"
              required
              className="w-full rounded-xl border border-outline-variant px-4 py-3 text-sm text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface uppercase tracking-wider">URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                isSlugEdited.current = true;
              }}
              required
              className="w-full rounded-xl border border-outline-variant px-4 py-3 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface uppercase tracking-wider">Chronological Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-outline-variant px-4 py-3 text-sm text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* File Uploads */}
        <div className="space-y-5 pt-2">
          {/* PDF */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface uppercase tracking-wider">PDF Document (Required)</label>
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, "pdf")} className="hidden" />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-secondary/20 bg-secondary-fixed/30 px-5 py-3 text-sm font-bold text-secondary hover:bg-secondary-fixed/50 transition-colors cursor-pointer">
                <Upload size={18} /> Choose PDF
              </button>
              {file ? (
                <div className="flex-1 flex items-center justify-between p-3 border border-secondary/20 bg-secondary-fixed/30 rounded-xl">
                  <div className="flex items-center gap-3"><FileText size={18} className="text-secondary"/><span className="text-sm font-semibold text-on-surface max-w-[150px] truncate">{file.name}</span></div>
                  <button type="button" onClick={() => clearFile("pdf")} className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors cursor-pointer"><X size={16} /></button>
                </div>
              ) : <div className="flex-1 text-sm font-medium text-on-surface-variant px-4 py-3 border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest flex items-center justify-center">No PDF selected</div>}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface uppercase tracking-wider">Cover Thumbnail Image (Optional)</label>
            <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, "image")} className="hidden" />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => thumbnailInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-surface-container-high bg-surface-container-low px-5 py-3 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer">
                <ImageIcon size={18} /> Choose Image
              </button>
              {thumbnail ? (
                <div className="flex-1 flex items-center justify-between p-3 border border-primary/20 bg-primary-fixed/30 rounded-xl">
                  <div className="flex items-center gap-3"><ImageIcon size={18} className="text-primary"/><span className="text-sm font-semibold text-on-surface max-w-[150px] truncate">{thumbnail.name}</span></div>
                  <button type="button" onClick={() => clearFile("image")} className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors cursor-pointer"><X size={16} /></button>
                </div>
              ) : <div className="flex-1 text-sm font-medium text-on-surface-variant px-4 py-3 border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest flex items-center justify-center">No image selected</div>}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-surface-container-high mt-4">
          <button
            type="submit"
            disabled={loading || !title || !slug || !date || !file}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-on-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm active:scale-95"
          >
            <Upload size={18} /> {loading ? "Publishing Special..." : "Publish Special Edition"}
          </button>
          <button type="button" onClick={clearForm} disabled={loading} className="rounded-xl border border-surface-container-high bg-surface-container-lowest px-5 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low cursor-pointer transition-colors">
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
