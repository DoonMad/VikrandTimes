import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Calendar, ChevronLeft, ChevronRight, Newspaper } from "lucide-react";

const PAGE_SIZE = 12; // Changed to 12 for better grid layout

type PageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function Archive({ searchParams }: PageProps) {
  const { page } = await searchParams;
  const currentPage = Math.max(Number(page) || 1, 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  // Get total count for pagination
  const { count } = await supabase
    .from("editions")
    .select("*", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("editions")
    .select("publish_date")
    .order("publish_date", { ascending: false })
    .range(from, to);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">Error loading archive. Please try again.</p>
        </div>
      </div>
    );
  }

  // Format dates for better display
  const formattedEditions = data?.map(edition => {
    const date = new Date(edition.publish_date);
    return {
      ...edition,
      formattedDate: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      shortDate: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      day: date.getDate(),
      year: date.getFullYear()
    };
  }) || [];

  // Group by year for better organization
  const groupedByYear = formattedEditions.reduce((acc, edition) => {
    const year = edition.year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(edition);
    return acc;
  }, {} as Record<number, typeof formattedEditions>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Newspaper className="w-6 h-6 text-red-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Vikrand Times Archive</h1>
          </div>
          <p className="text-gray-600">
            Browse through {count || 0} editions published since 2015
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {from + 1}-{Math.min(to + 1, count || 0)} of {count || 0} editions
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-red-700 flex items-center gap-1"
            >
              ← Back to Latest Edition
            </Link>
          </div>
        </div>

        {/* Archive Grid */}
        <div className="space-y-12">
          {Object.entries(groupedByYear)
            .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
            .map(([year, editions]) => (
              <div key={year} className="bg-white rounded-lg border border-gray-200 p-6">
                {/* Year Header */}
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    {year}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({editions.length} {editions.length === 1 ? 'edition' : 'editions'})
                    </span>
                  </h2>
                </div>

                {/* Editions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {editions.map((edition) => (
                    <Link
                      key={edition.publish_date}
                      href={`/edition/${edition.publish_date}`}
                      className="group block p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {edition.day}
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {edition.month}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 group-hover:text-red-700">
                            Vikrand Times
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {edition.formattedDate}
                          </p>
                        </div>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-5 h-5 text-red-500" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Pagination */}
        {count && count > PAGE_SIZE && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {Math.ceil(count / PAGE_SIZE)}
              </div>
              
              <div className="flex items-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/archive?page=${currentPage - 1}`}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Link>
                )}
                
                {currentPage < Math.ceil(count / PAGE_SIZE) && (
                  <Link
                    href={`/archive?page=${currentPage + 1}`}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Page Numbers */}
            <div className="flex justify-center gap-1 mt-6">
              {Array.from({ length: Math.min(5, Math.ceil(count / PAGE_SIZE)) }, (_, i) => {
                let pageNum;
                const totalPages = Math.ceil(count / PAGE_SIZE);
                
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Link
                    key={pageNum}
                    href={`/archive?page=${pageNum}`}
                    className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-red-700 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
              
              {count > PAGE_SIZE * 5 && currentPage < Math.ceil(count / PAGE_SIZE) - 2 && (
                <>
                  <span className="flex items-center px-2 text-gray-500">...</span>
                  <Link
                    href={`/archive?page=${Math.ceil(count / PAGE_SIZE)}`}
                    className="min-w-[40px] h-10 flex items-center justify-center border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {Math.ceil(count / PAGE_SIZE)}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!data?.length && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Newspaper className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No editions found
            </h3>
            <p className="text-gray-600">
              Check back later for new publications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}