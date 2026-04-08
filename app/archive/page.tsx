import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Archive as ArchiveIcon, ChevronRight, Newspaper, Calendar, ChevronLeft } from "lucide-react";

const PAGE_SIZE = 12;

export const metadata = {
  title: "Archive",
  description: "Browse previous editions of Vikrand Times Marathi newspaper.",
};

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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="p-6 bg-error-container text-on-error-container rounded-xl max-w-md text-center">
          Error loading archive. Please try again later.
        </div>
      </div>
    );
  }

  const isFirstPage = currentPage === 1;

  const formattedEditions = data?.map((edition, index) => {
    const date = new Date(edition.publish_date);
    return {
      ...edition,
      isLatest: isFirstPage && index === 0,
      formattedDate: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      shortDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      monthStr: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      dayNum: date.getDate(),
      yearNum: date.getFullYear()
    };
  }) || [];

  const groupedByYear = formattedEditions.reduce((acc, edition) => {
    const year = edition.yearNum;
    if (!acc[year]) acc[year] = [];
    acc[year].push(edition);
    return acc;
  }, {} as Record<number, typeof formattedEditions>);

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-12">
      {/* Hero Section */}
      <div className="bg-surface-container-lowest border-b border-surface-container-high py-10 px-4 mb-4 md:mb-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-surface-container-low text-primary rounded-full flex items-center justify-center mb-4">
            <ArchiveIcon size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-on-surface mb-2">
            Archive
          </h1>
          <p className="text-on-surface-variant max-w-lg">
            Browse through {count || 0} past editions of Vikrand Times published since 2015.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Mobile-first compact list / Desktop grid */}
        <div className="space-y-10">
          {Object.entries(groupedByYear)
            .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
            .map(([year, editions]) => (
              <section key={year} className="relative">
                {/* Sticky Year Header */}
                <div className="sticky top-14 z-40 bg-surface/95 backdrop-blur-md py-3 flex items-center gap-4 mb-2 md:mb-6">
                  <h2 className="text-xl font-headline font-bold text-on-surface">
                    {year}
                  </h2>
                  <div className="h-px bg-surface-container-high flex-1"></div>
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    {editions.length} {editions.length === 1 ? 'Edition' : 'Editions'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                  {editions.map((edition) => (
                    <Link
                      key={edition.publish_date}
                      href={`/edition/${edition.publish_date}`}
                      className={`group block transition-colors ${
                        // Mobile uses a flat list with ghost borders between rows
                        // Desktop uses elegant cards with tonal layering
                        "md:bg-surface-container-lowest md:border md:border-outline-variant/30 md:rounded-xl md:p-5 md:hover:border-primary/50 md:hover:shadow-md border-b border-surface-container-high py-4 md:border-b-auto last:border-b-0 md:last:border-b-auto"
                      }`}
                    >
                      <div className="flex items-center md:items-start gap-4">
                        
                        {/* Date Square */}
                        <div className="flex flex-col items-center justify-center min-w-[56px] h-14 bg-surface-container-low rounded-lg md:rounded-xl shrink-0 group-hover:bg-primary-fixed/50 transition-colors">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant group-hover:text-primary">
                            {edition.monthStr}
                          </span>
                          <span className="text-lg font-bold text-on-surface leading-none mt-0.5 group-hover:text-primary">
                            {edition.dayNum}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-headline font-bold text-base md:text-lg text-on-surface truncate group-hover:text-primary">
                              विक्रांद टाइम्स
                            </h3>
                            {edition.isLatest && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary text-on-primary">
                                Latest
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-on-surface-variant truncate">
                            {edition.formattedDate}
                          </p>
                        </div>

                        {/* Action Area */}
                        <div className="shrink-0 flex flex-col md:flex-row items-end md:items-center gap-1 md:gap-0">
                          {edition.isLatest && (
                            <span className="md:hidden w-2 h-2 rounded-full bg-primary mb-1"></span>
                          )}
                          <div className="text-primary opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center text-xs font-semibold">
                            <span className="hidden md:inline mr-1">Read</span>
                            <ChevronRight size={18} />
                          </div>
                          <div className="md:hidden text-outline">
                            <ChevronRight size={20} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
        </div>

        {/* Pagination Block */}
        {count && count > PAGE_SIZE && (
          <div className="mt-16 border-t border-surface-container-high pt-8 pb-12 flex flex-col items-center">
            
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-widest mb-6">
              Page {currentPage} of {Math.ceil(count / PAGE_SIZE)}
            </span>

            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/archive?page=${currentPage - 1}`}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-surface-container-high text-on-surface hover:bg-surface-container-low transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </Link>
              )}
              
              <div className="flex items-center gap-1 px-4">
                {Array.from({ length: Math.min(5, Math.ceil(count / PAGE_SIZE)) }, (_, i) => {
                  const totalPages = Math.ceil(count / PAGE_SIZE);
                  let pageNum = i + 1;
                  
                  if (totalPages > 5) {
                    if (currentPage > 3 && currentPage < totalPages - 1) {
                      pageNum = currentPage - 2 + i;
                    } else if (currentPage >= totalPages - 1) {
                      pageNum = totalPages - 4 + i;
                    }
                  }
                  
                  const isCurrent = currentPage === pageNum;
                  
                  return (
                    <Link
                      key={pageNum}
                      href={`/archive?page=${pageNum}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        isCurrent 
                          ? "bg-primary-container text-on-primary shadow-sm" 
                          : "text-on-surface hover:bg-surface-container-low"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>

              {currentPage < Math.ceil(count / PAGE_SIZE) && (
                <Link
                  href={`/archive?page=${currentPage + 1}`}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-surface-container-high text-on-surface hover:bg-surface-container-low transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!data?.length && (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6 text-on-surface-variant">
              <Calendar size={32} />
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
              No editions found
            </h3>
            <p className="text-on-surface-variant max-w-sm">
              We couldn't find any past editions. Check back later for new publications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}