import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Star, ChevronRight, Newspaper, Calendar } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Special Editions",
  description: "Browse the exclusive curated special editions of Vikrand Times Marathi newspaper.",
};

export default async function SpecialEditionsArchive() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("special_editions")
    .select("*")
    .order("publish_date", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="p-6 bg-error-container text-on-error-container rounded-xl max-w-md text-center">
          Error loading special editions. Please try again.
        </div>
      </div>
    );
  }

  // Format dates for display
  const formattedEditions = data?.map(edition => {
    const date = new Date(edition.publish_date);
    return {
      ...edition,
      formattedDate: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      shortMonth: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      dayNum: date.getDate(),
      yearNum: date.getFullYear()
    };
  }) || [];

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-12">
      {/* Hero Section */}
      <div className="bg-secondary-container/20 border-b border-secondary-container/50 py-10 px-4 mb-4 md:mb-10 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-fixed/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
        
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="w-16 h-16 bg-secondary-fixed text-secondary rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Star size={32} strokeWidth={1.5} className="fill-secondary/20" />
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-on-surface mb-2">
            Special Editions
          </h1>
          <p className="text-on-surface-variant max-w-lg">
            Special collections, festival issues, and exclusive deep-dive journalism.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {!data?.length ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-20 h-20 bg-secondary-fixed/50 rounded-full flex items-center justify-center mb-6 text-secondary">
              <Star size={32} className="fill-secondary/10" />
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
              No Special Editions Yet
            </h3>
            <p className="text-on-surface-variant max-w-sm">
              Check back soon for exclusive publications and festival specials.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6 space-y-4 md:space-y-0">
            {formattedEditions.map((edition) => (
              <Link
                key={edition.id}
                href={`/special-edition/${edition.slug}`}
                className="group flex flex-col bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden hover:border-secondary/50 hover:shadow-lg transition-all duration-300"
              >
                {/* Thumbnail Area */}
                {edition.thumbnail_url ? (
                  <div className="aspect-3/2 w-full relative bg-surface-container-low border-b border-outline-variant/30 overflow-hidden">
                    <Image 
                      src={edition.thumbnail_url} 
                      alt={edition.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="aspect-3/2 w-full bg-secondary-fixed/20 border-b border-outline-variant/30 flex items-center justify-center shrink-0">
                    <Newspaper className="w-16 h-16 text-secondary/40" />
                  </div>
                )}
                
                {/* Content Area */}
                <div className="p-5 flex-1 flex flex-col relative">
                  {/* Decorative Date Badge overlaying the image edge */}
                  <div className="absolute -top-12 right-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm px-3 py-1.5 flex flex-col items-center justify-center min-w-[56px] group-hover:border-secondary transition-colors">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{edition.shortMonth}</span>
                    <span className="text-lg font-bold text-on-surface leading-none">{edition.dayNum}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-secondary-fixed/50 text-secondary">
                      <Star size={10} className="fill-secondary/40" /> Special
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {edition.yearNum}
                    </span>
                  </div>

                  <h3 className="font-headline font-bold text-xl text-on-surface group-hover:text-secondary transition-colors line-clamp-2 leading-tight">
                    {edition.title}
                  </h3>
                  
                  <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                    <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      Read Edition
                    </span>
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
