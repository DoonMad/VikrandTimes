// app/loading.tsx
export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Newspaper icon pulse */}
        <div className="relative">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 text-red-700 animate-pulse">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
          {/* Outer ring animation */}
          <div className="absolute inset-0 border-4 border-red-200 border-t-red-700 rounded-full animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Loading Vikrand Times</p>
          <p className="text-sm text-gray-600 mt-1">Bringing you the latest news...</p>
        </div>
        
        {/* Progress bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-red-700 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
}