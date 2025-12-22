"use client";

import { useState, useEffect, useRef } from "react";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountMenu() {
  const user = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh(); // Force refresh to update UI
  };

  if (!user) return null;

  const displayName = user.user_metadata?.name || user.email?.split('@')[0] || "Account";

  return (
    <div className="relative z-100" ref={dropdownRef}>
      {/* User Profile Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors cursor-pointer"
        aria-label="Account menu"
      >
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <User size={16} className="text-red-700" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
            {displayName}
          </p>
          <p className="text-xs text-gray-500">My Account</p>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.user_metadata?.name || displayName}
            </p>
            <p className="text-xs text-gray-500 truncate mt-1">
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          {/* <div className="py-1">
            <Link
              href="/account"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Settings size={16} className="text-gray-400" />
              Account Settings
            </Link>

            <Link
              href="/account/subscription"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Subscription
            </Link>

            <Link
              href="/account/history"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Reading History
            </Link>
          </div> */}

          {/* Logout Button */}
          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleLogout}
              className="cursor-pointer flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}