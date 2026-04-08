// app/loading.tsx
export default function GlobalLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-6">
        {/* Newspaper icon pulse */}
        <div className="relative">
          <div className="w-20 h-20 bg-primary-fixed/30 rounded-full flex items-center justify-center shadow-inner">
            <div className="w-10 h-10 text-primary animate-pulse">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
          {/* Outer ring animation */}
          <div className="absolute inset-0 border-4 border-surface-container-high border-t-primary rounded-full animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <p className="text-xl font-headline font-bold text-on-surface">Loading Vikrand Times</p>
          <p className="text-sm font-medium text-on-surface-variant mt-1">Preparing the latest edition...</p>
        </div>
        
        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-[pulse_1.5s_ease-in-out_infinite] w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}