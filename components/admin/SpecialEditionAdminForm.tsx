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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !date || !file) {
      setError("Title, slug, date, and PDF are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMsg("Uploading PDF...");

    try {
      // 1. Upload PDF
      const pdfPath = `${slug}.pdf`;
      const { error: pdfUploadError } = await supabase.storage
        .from("special-editions-pdf")
        .upload(pdfPath, file, { upsert: true, contentType: "application/pdf" });

      if (pdfUploadError) throw pdfUploadError;

      // 2. Handle Thumbnail
      let thumbnailUrl = null;
      let thumbBlob: Blob | File | null = thumbnail;

      if (!thumbBlob) {
        // Auto-generate thumbnail from page 1 of PDF
        setStatusMsg("Generating thumbnail from PDF...");
        try {
          thumbBlob = await generateThumbnailFromPdf(file);
        } catch (thumbGenErr) {
          console.warn("Auto-thumbnail generation failed, continuing without thumbnail:", thumbGenErr);
          thumbBlob = null;
        }
      }

      if (thumbBlob) {
        setStatusMsg("Uploading thumbnail...");
        const isManual = thumbnail !== null;
        const thumbExtension = isManual ? thumbnail!.name.split(".").pop() : "jpg";
        const thumbPath = `${slug}.${thumbExtension}`;
        const thumbContentType = isManual ? thumbnail!.type : "image/jpeg";

        const { error: thumbUploadError } = await supabase.storage
          .from("special-editions-thumbnails")
          .upload(thumbPath, thumbBlob, { upsert: true, contentType: thumbContentType });

        if (thumbUploadError) throw thumbUploadError;

        const { data: thumbData } = supabase.storage
          .from("special-editions-thumbnails")
          .getPublicUrl(thumbPath);
        thumbnailUrl = thumbData.publicUrl;
      }

      // 3. Insert into Database
      setStatusMsg("Saving to database...");
      const { error: dbError } = await supabase.from("special_editions").insert({
        title,
        slug,
        publish_date: date,
        thumbnail_url: thumbnailUrl,
      });

      if (dbError) {
        if (dbError.code === "23505") {
          throw new Error("A special edition with this slug already exists.");
        }
        throw dbError;
      }

      setSuccess(true);
      clearForm();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Upload failed. Please try again.");
    } finally {
      setLoading(false);
      setStatusMsg("");
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="place-items-center">
      <form onSubmit={handleSubmit} className="max-w-xl space-y-5 bg-white border border-gray-200 rounded-lg p-6 w-full shadow-sm">
        <h2 className="text-xl font-bold bg-linear-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent inline-block">
          Publish Special Edition
        </h2>

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
            <CheckCircle size={16} /> Special edition published successfully
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {loading && statusMsg && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
            <Loader2 size={16} className="animate-spin" /> {statusMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 col-span-2">
            <label className="text-sm font-medium text-gray-700">Edition Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Diwali Special 2026"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                isSlugEdited.current = true;
              }}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Chronological Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* File Uploads */}
        <div className="space-y-4 pt-2">
          {/* PDF */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">PDF Document (Required)</label>
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, "pdf")} className="hidden" />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors">
                <Upload size={16} /> Choose PDF
              </button>
              {file ? (
                <div className="flex-1 flex items-center justify-between p-2 border border-green-200 bg-green-50 rounded">
                  <div className="flex items-center gap-2"><FileText size={16} className="text-green-600"/><span className="text-sm font-medium max-w-[200px] truncate">{file.name}</span></div>
                  <button type="button" onClick={() => clearFile("pdf")}><X size={16} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
              ) : <div className="flex-1 text-sm text-gray-500 px-3 py-2 border border-dashed border-gray-300 rounded bg-gray-50">No PDF selected</div>}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Cover Thumbnail Image (Optional)</label>
            <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, "image")} className="hidden" />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => thumbnailInputRef.current?.click()} className="inline-flex items-center gap-2 rounded border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                <ImageIcon size={16} /> Choose Image
              </button>
              {thumbnail ? (
                <div className="flex-1 flex items-center justify-between p-2 border border-blue-200 bg-blue-50 rounded">
                  <div className="flex items-center gap-2"><ImageIcon size={16} className="text-blue-600"/><span className="text-sm font-medium max-w-[200px] truncate">{thumbnail.name}</span></div>
                  <button type="button" onClick={() => clearFile("image")}><X size={16} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
              ) : <div className="flex-1 text-sm text-gray-500 px-3 py-2 border border-dashed border-gray-300 rounded bg-gray-50">No image selected</div>}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading || !title || !slug || !date || !file}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            <Upload size={16} /> {loading ? "Publishing Special..." : "Publish Special Edition"}
          </button>
          <button type="button" onClick={clearForm} disabled={loading} className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
