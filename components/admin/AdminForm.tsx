"use client";

import { useState, useRef } from "react";
import { Upload, AlertCircle, CheckCircle, FileText, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
// import Error

export default function AdminForm() {
  const supabase = createClient();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split("T")[0];

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File size must be under 50MB.");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearForm = () => {
    setDate("");
    clearFile();
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !file) {
      setError("Date and PDF are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filePath = `editions/${date}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("editions-pdf")
        .upload(filePath, file, {
          upsert: true,
          contentType: "application/pdf",
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('editions-pdf').getPublicUrl(filePath);

      if(!data?.publicUrl){
        throw new Error("Failed to get public URL");
      }

      const { error: dbError } = await supabase.from("editions").upsert({
        publish_date: date,
      });

      if (dbError) {
        throw dbError;
      }

      setSuccess(true);
      clearForm();
    } catch(err: any) {
      console.error(err);
      setError(err.message ?? "Upload failed. Please try again.");
    } finally {
      setLoading(false);
      router.refresh()
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="place-items-center">
      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-6 bg-surface-container-lowest border border-surface-container-high rounded-2xl p-8 w-full shadow-sm"
      >
        <h2 className="text-xl font-headline font-bold text-on-surface">
          Publish new edition
        </h2>

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 text-sm text-(--color-tertiary) bg-tertiary/10 border border-tertiary/20 px-4 py-3 rounded-xl font-medium">
            <CheckCircle size={18} />
            Edition published successfully
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-error bg-error-container border border-error/20 px-4 py-3 rounded-xl font-medium">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface uppercase tracking-wider">
            Publication date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-xl border border-outline-variant px-4 py-3 text-sm text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* File Upload - Custom Styled */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface uppercase tracking-wider">PDF file</label>

          <div className="space-y-3">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Custom file upload area */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleFileSelect}
                className="inline-flex items-center gap-2 rounded-xl border border-surface-container-high bg-surface-container-low px-5 py-3 text-sm font-medium text-on-surface hover:bg-surface-container-high cursor-pointer transition-colors"
              >
                <Upload size={18} />
                Choose PDF
              </button>

              {file ? (
                <div className="flex-1 flex items-center justify-between gap-3 p-3 border border-primary/20 bg-primary-fixed/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-on-surface truncate max-w-[150px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors cursor-pointer"
                    aria-label="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex-1 text-sm text-on-surface-variant font-medium px-4 py-3 border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest flex items-center justify-center">
                  No file chosen
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-surface-container-high mt-2">
          <button
            type="submit"
            disabled={loading || !date || !file}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm active:scale-95"
          >
            <Upload size={18} />
            {loading ? "Publishing…" : "Publish"}
          </button>

          <button
            type="button"
            onClick={clearForm}
            className="rounded-xl border border-surface-container-high bg-surface-container-lowest px-5 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low cursor-pointer transition-colors"
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
