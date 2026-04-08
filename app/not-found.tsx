import Link from "next/link";
import { Home, Archive } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-surface">
      <div className="max-w-lg w-full text-center">
        {/* 404 Indicator */}
        <div className="text-8xl font-headline font-bold text-outline-variant mb-6 inline-flex items-center justify-center">
          <span className="text-error">4</span>0<span className="text-primary opacity-60">4</span>
        </div>
        
        {/* Error message */}
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-on-surface mb-4">
          Page Not Found
        </h1>
        <p className="text-on-surface-variant mb-10 text-lg">
          The edition or page you&apos;re looking for couldn&apos;t be found. 
          It might have been archived or the link may be incorrect.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 transition-all shadow-md active:scale-95"
          >
            <Home className="w-5 h-5" />
            Latest Edition
          </Link>
          
          <Link
            href="/archive"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-surface-container-low border border-surface-container-high text-on-surface font-semibold rounded-xl hover:bg-surface-container transition-all active:scale-95"
          >
            <Archive className="w-5 h-5" />
            Browse Archive
          </Link>
        </div>
      </div>
    </div>
  );
}