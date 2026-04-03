import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Star, ChevronRight, Newspaper } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Special Editions - Vikrand Times",
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">Error loading special editions. Please try again.</p>
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
      })
    };
  }) || [];

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="bg-amber-100 border-b border-amber-200 relative overflow-hidden">
        {/* Subtle decorative gold pattern here if needed */}
        <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-200 rounded-full shadow-inner border border-amber-300 text-amber-700">
              <Star className="w-6 h-6 fill-amber-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Special Editions</h1>
          </div>
          <p className="text-gray-700 max-w-xl text-lg mt-2">
            Dive into our exclusive, specifically curated editions covering major festivals, deep-dive journalism, and local events.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {!data?.length ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
              <Star className="w-10 h-10 text-amber-500 fill-amber-200" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Special Editions Yet
            </h3>
            <p className="text-gray-600">
              Check back soon for exclusive publications and festival specials.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formattedEditions.map((edition) => (
              <Link
                key={edition.id}
                href={`/special-edition/${edition.slug}`}
                className="group flex flex-col bg-white border border-amber-200 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300"
              >
                {edition.thumbnail_url ? (
                  <div className="aspect-3/4 w-full relative bg-gray-100 border-b border-amber-100">
                    <Image 
                      src={edition.thumbnail_url} 
                      alt={edition.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-3/4 w-full bg-amber-50 border-b border-amber-100 flex items-center justify-center">
                    <Newspaper className="w-16 h-16 text-amber-300" />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                    {edition.title}
                  </h3>
                  <div className="mt-auto pt-4 flex items-center justify-between text-gray-500">
                    <span className="text-sm font-medium">{edition.formattedDate}</span>
                    <ChevronRight className="w-5 h-5 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
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
