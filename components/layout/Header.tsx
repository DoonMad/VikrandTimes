"use client";

import Image from "next/image";
import Link from "next/link";
import { Moon, Sun, Globe, User, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import AccountMenu from "../AccountMenu";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  // const [dark, setDark] = useState(false);
  // const [lang, setLang] = useState<"mr" | "en">("mr");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useAuth();
  const pathname = usePathname();
  // const router = useRouter();
  // const prevPathnameRef = useRef(pathname);

  const isReadActive = pathname === "/" || pathname.startsWith('/edition/');

  const linkClass = (active: boolean) =>
    active
      ? "text-red-700 font-semibold"
      : "text-gray-700 hover:text-red-700";

  // Close mobile menu when route changes
  // useEffect(() => {
  //   if (prevPathnameRef.current !== pathname) {
  //     setIsMobileMenuOpen(false);
  //     prevPathnameRef.current = pathname;
  //   }
  // }, [pathname]);

  useEffect(() => {
    return () => {
      setIsMobileMenuOpen(false);
    };
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Top Row: Logo + Mobile Menu Button */}
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex flex-col items-center cursor-pointer">
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
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 font-medium">
            <Link href="/" className={linkClass(isReadActive)}>
              Read
            </Link>
            <Link href="/archive" className={linkClass(pathname === "/archive")}>
              Archive
            </Link>
            <Link href="/about" className={linkClass(pathname === "/about")}>
              About
            </Link>
            <Link href="/contact" className={linkClass(pathname === "/contact")}>
              Contact
            </Link>
          </nav>

          {/* Right Section: Utilities + Mobile Menu Button */}
          <div className="flex items-center gap-3">
            {/* Language Toggle (Desktop) */}
            {/* <div className="hidden sm:flex items-center">
              <button
                onClick={() => setLang(l => (l === "mr" ? "en" : "mr"))}
                className="p-2 rounded hover:bg-gray-100 text-gray-700 cursor-pointer"
                title="Toggle Language"
              >
                <Globe size={18} />
              </button>
              <span className="text-sm text-gray-700 ml-1 hidden lg:inline">
                {lang.toUpperCase()}
              </span>
            </div> */}

            {/* Theme Toggle (Desktop) */}
            {/* <button
              onClick={() => setDark(d => !d)}
              className="hidden sm:block p-2 rounded hover:bg-gray-100 text-gray-700 cursor-pointer"
              title="Toggle Theme"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button> */}

            {/* Sign In / Account */}
            <div className="hidden sm:block">
              {user === null ? (
                <Link
                  href="/auth"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  <User size={16} className="text-gray-600" />
                  <span className="hidden lg:inline text-sm font-medium">Sign In</span>
                </Link>
              ) : (
                <AccountMenu />
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 border-t border-gray-200 pt-4 animate-in fade-in slide-in-from-top-2">
            {/* Navigation Links */}
            <nav className="flex flex-col space-y-3 mb-6">
              <Link 
                href="/" 
                className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${isReadActive ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <span className="font-medium">Read Latest</span>
                {isReadActive && (
                  <div className="w-2 h-2 bg-red-700 rounded-full"></div>
                )}
              </Link>
              
              <Link 
                href="/archive" 
                className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${pathname === "/archive" ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <span className="font-medium">Archive</span>
                {pathname === "/archive" && (
                  <div className="w-2 h-2 bg-red-700 rounded-full"></div>
                )}
              </Link>
              
              <Link 
                href="/about" 
                className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${pathname === "/about" ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <span className="font-medium">About Us</span>
                {pathname === "/about" && (
                  <div className="w-2 h-2 bg-red-700 rounded-full"></div>
                )}
              </Link>
              
              <Link 
                href="/contact" 
                className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${pathname === "/contact" ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <span className="font-medium">Contact</span>
                {pathname === "/contact" && (
                  <div className="w-2 h-2 bg-red-700 rounded-full"></div>
                )}
              </Link>
            </nav>

            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-200">
              {user === null ? (
                <Link
                  href="/auth"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 transition-colors"
                >
                  <User size={18} />
                  <span>Sign In to Your Account</span>
                </Link>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <User size={18} className="text-red-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {user.user_metadata?.name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-600">My Account</p>
                    </div>
                  </div>
                  <AccountMenu />
                </div>
              )}
            </div>

            {/* Optional: Theme/Language toggles for mobile */}
            {/* <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setLang(l => (l === "mr" ? "en" : "mr"))}
                className="flex items-center gap-2 text-gray-700"
              >
                <Globe size={18} />
                <span className="text-sm">{lang === "mr" ? "मराठी" : "English"}</span>
              </button>
              
              <button
                onClick={() => setDark(d => !d)}
                className="flex items-center gap-2 text-gray-700"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
                <span className="text-sm">{dark ? "Light" : "Dark"}</span>
              </button>
            </div> */}
          </div>
        )}
      </div>
    </header>
  );
}