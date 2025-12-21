// components/PdfViewerSkeleton.tsx
export default function PdfViewerSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Toolbar skeleton */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
              <div className="w-20 h-8 bg-gray-200 rounded"></div>
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 h-8 bg-gray-200 rounded"></div>
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF area skeleton */}
      <div className="w-full px-2 sm:px-4 py-4">
        <div className="border border-gray-200 rounded-lg bg-gray-50">
          <div 
            className="overflow-auto"
            style={{ maxHeight: "calc(100vh - 160px)" }}
          >
            <div className="p-8 flex justify-center">
              <div className="w-full max-w-4xl">
                {/* Simulated newspaper page */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  {/* Header skeleton */}
                  <div className="h-12 bg-gray-300"></div>
                  
                  {/* Content skeleton */}
                  <div className="p-8 space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Footer skeleton */}
                  <div className="h-8 bg-gray-300 mt-8"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom navigation skeleton */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-4">
            <div className="w-32 h-10 bg-gray-200 rounded"></div>
            <div className="w-32 h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}