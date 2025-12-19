"use client";

import Image from "next/image";
import Link from "next/link";
import { Moon, Sun, Globe, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import AccountMenu from "./AccountMenu";

export default function Header() {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<"mr" | "en">("mr");
  const user = useAuth();
  // console.log(user);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        
        {/* LEFT: Brand */}
        <div className="flex flex-col items-center">
          <div className="relative h-10 w-40">
            <Image
              src="/logo.png"
              alt="Vikrand Times"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="hidden sm:block leading-tight">
            <p className="text-xs text-gray-500">
              विकास क्रांती दल
            </p>
          </div>
        </div>

        {/* CENTER: Navigation */}
        <nav className="hidden md:flex gap-8 font-medium">
          <Link href="/" className="text-gray-700 hover:text-red-700">
            Latest
          </Link>
          <Link href="/edition" className="text-gray-700 hover:text-red-700">
            Archive
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-red-700">
            About
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-red-700">
            Contact
          </Link>
        </nav>

        {/* RIGHT: Utilities */}
        <div className="flex items-center gap-3">
          
          {/* Language toggle */}
          <button
            onClick={() => setLang(l => (l === "mr" ? "en" : "mr"))}
            className="p-2 rounded hover:bg-gray-100 text-gray-700 cursor-pointer"
            title="Toggle Language"
          >
            <Globe size={18} />
          </button>
          <span className="text-sm text-gray-700 ml-1">
            {lang.toUpperCase()}
          </span>
          {/* Theme toggle */}
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 rounded hover:bg-gray-100 text-gray-700 cursor-pointer"
            title="Toggle Theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Sign in */}
          {user === null ? (
            <Link
              href="/auth"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
            >
              <User size={16} className="text-gray-600" />
              <span className="hidden sm:inline text-sm font-medium">Sign In</span>
            </Link>
          ) : (
            <AccountMenu />
          )}
        </div>
      </div>
    </header>
  );
}
