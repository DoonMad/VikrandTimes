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
        className="max-w-md space-y-5 bg-white border border-gray-200 rounded-lg p-6 w-full"
      >
        <h2 className="text-lg font-semibold text-gray-900">
          Publish new edition
        </h2>

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
            <CheckCircle size={16} />
            Edition published successfully
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Date */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Publication date
          </label>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* File Upload - Custom Styled */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">PDF file</label>

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
                className="inline-flex items-center gap-2 rounded border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <Upload size={16} />
                Choose PDF
              </button>

              {file ? (
                <div className="flex-1 flex items-center justify-between gap-3 p-3 border border-green-200 bg-green-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    aria-label="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex-1 text-sm text-gray-500 px-3 py-2 border border-dashed border-gray-300 rounded bg-gray-50">
                  No file chosen
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !date || !file}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <Upload size={16} />
            {loading ? "Publishing…" : "Publish"}
          </button>

          <button
            type="button"
            onClick={clearForm}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
