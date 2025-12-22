import Link from "next/link";
import { Home, Archive } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Indicator */}
        <div className="text-7xl font-extrabold text-red-700 tracking-tight mb-6">
            404
        </div>

        
        {/* Error message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The edition or page you&apos;re looking for couldn&apos;t be found. 
          It might have been archived or the link may be incorrect.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 transition-colors"
          >
            <Home className="w-5 h-5" />
            Latest Edition
          </Link>
          
          <Link
            href="/archive"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Archive className="w-5 h-5" />
            Browse Archive
          </Link>
        </div>
      </div>
    </div>
  );
}