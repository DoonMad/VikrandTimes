"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, AlertCircle, FileText, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminEditionsTable() {
  const supabase = createClient();
  const router = useRouter();
  
  const [editions, setEditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchEditions();
  }, []);

  const fetchEditions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("editions")
      .select("*")
      .order("publish_date", { ascending: false });

    if (error) {
      setError("Failed to load editions");
    } else {
      setEditions(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (date: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the edition for ${date}? This cannot be undone.`)) {
      return;
    }

    setDeleteLoading(date);
    setError(null);

    try {
      // 1. Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from("editions-pdf")
        .remove([`editions/${date}.pdf`]);
      
      if (storageError) {
        console.error("Storage delete error:", storageError);
        // We continue anyway, because we definitely want to drop the DB row so it disappears from the site.
      }

      // 2. Delete the record from the database
      const { error: dbError } = await supabase
        .from("editions")
        .delete()
        .eq("publish_date", date);

      if (dbError) throw dbError;

      // Update UI
      setEditions((prev) => prev.filter((ed) => ed.publish_date !== date));
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete edition.");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-on-surface-variant">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl overflow-hidden shadow-sm">
      {error && (
        <div className="p-4 mx-4 mt-4 text-sm font-medium text-error bg-error-container border border-error/20 rounded-xl flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {editions.length === 0 ? (
        <div className="p-8 text-center text-on-surface-variant">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium text-lg">No editions found</p>
          <p className="text-sm mt-1">Publish an edition and it will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container-high text-sm font-bold text-on-surface uppercase tracking-wider">
                <th className="px-6 py-4">Publish Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {editions.map((edition) => (
                <tr key={edition.publish_date} className="hover:bg-surface transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-fixed/30 rounded-lg text-primary">
                        <FileText size={18} />
                      </div>
                      <span className="font-semibold text-on-surface text-base">
                        {new Date(edition.publish_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#14b8a6]/10 text-[#14b8a6]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]"></span>
                      Published
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link 
                        href={`/edition/${edition.publish_date}`}
                        target="_blank"
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed/30 rounded-lg transition-colors tooltip-trigger"
                        title="View Edition"
                      >
                        <ExternalLink size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(edition.publish_date)}
                        disabled={deleteLoading === edition.publish_date}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/50 rounded-lg transition-colors"
                        title="Delete Edition"
                      >
                        {deleteLoading === edition.publish_date ? (
                          <Loader2 size={18} className="animate-spin text-error" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
