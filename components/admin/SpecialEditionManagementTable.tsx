"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, AlertCircle, FileImage, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SpecialEditionManagementTable() {
  const supabase = createClient();
  const router = useRouter();
  
  const [editions, setEditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchSpecialEditions();
  }, []);

  const fetchSpecialEditions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("special_editions")
      .select("*")
      .order("publish_date", { ascending: false });

    if (error) {
      setError("Failed to load special editions");
    } else {
      setEditions(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number, slug: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${slug}"? This cannot be undone.`)) {
      return;
    }

    setDeleteLoading(id);
    setError(null);

    try {
      // 1. Delete associated files from storage (thumbnail might be jpg or png, try removing common extensions or exact files)
      // We know standard upload creates slug.pdf and potentially slug.jpg/png.
      // Trying .pdf
      await supabase.storage.from("special-editions-pdf").remove([`${slug}.pdf`]);
      // Attempting to remove potential thumbnails
      await supabase.storage.from("special-editions-thumbnails").remove([`${slug}.jpg`, `${slug}.jpeg`, `${slug}.png`, `${slug}.webp`]);

      // 2. Delete the record from the database
      const { error: dbError } = await supabase
        .from("special_editions")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // Update UI
      setEditions((prev) => prev.filter((ed) => ed.id !== id));
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete special edition.");
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
          <FileImage className="w-12 h-12 mx-auto mb-3 opacity-50 text-secondary" />
          <p className="font-medium text-lg">No special editions</p>
          <p className="text-sm mt-1">Publish a special edition to see it here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container-high text-sm font-bold text-on-surface uppercase tracking-wider">
                <th className="px-6 py-4">Title & Slug</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {editions.map((edition) => (
                <tr key={edition.id} className="hover:bg-surface transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {edition.thumbnail_url ? (
                        <img 
                          src={edition.thumbnail_url} 
                          alt="Cover" 
                          className="w-12 h-16 object-cover rounded shadow-sm border border-outline-variant"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-surface-container-high rounded border border-outline-variant flex items-center justify-center">
                          <FileImage size={18} className="text-on-surface-variant opacity-50" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-on-surface text-base">{edition.title}</p>
                        <p className="text-sm font-medium text-secondary mt-0.5 font-mono">/{edition.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-on-surface">
                    {new Date(edition.publish_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link 
                        href={`/special-editions/${edition.slug}`}
                        target="_blank"
                        className="p-2 text-on-surface-variant hover:text-secondary hover:bg-secondary-fixed/30 rounded-lg transition-colors tooltip-trigger"
                        title="View Edition"
                      >
                        <ExternalLink size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(edition.id, edition.slug)}
                        disabled={deleteLoading === edition.id}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/50 rounded-lg transition-colors"
                        title="Delete Edition"
                      >
                        {deleteLoading === edition.id ? (
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
