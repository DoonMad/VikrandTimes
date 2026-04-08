"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Star, X, Menu } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import AccountMenu from "@/components/AccountMenu";
import { useState } from "react";

const navLinks = [
  { name: "Read", href: "/" },
  { name: "Archive", href: "/archive" },
  { name: "Specials", href: "/special-editions", icon: Star, isSpecial: true },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const user = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname.startsWith("/edition/");
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ===== DESKTOP HEADER ===== */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md border-b border-surface-container-high h-14">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="विक्रांद टाइम्स"
              width={140}
              height={32}
              className="h-8 w-auto"
              priority
            />
            <span className="hidden sm:block text-[11px] text-on-surface-variant leading-tight">
              विकास क्रांती दल
            </span>
          </Link>

          {/* Desktop Navigation — hidden on mobile */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors flex items-center gap-1 py-1 ${
                    active
                      ? link.isSpecial
                        ? "text-secondary specials-glow"
                        : "text-primary-container font-semibold"
                      : link.isSpecial
                      ? "text-secondary specials-glow hover:text-secondary-container"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {link.icon && (
                    <link.icon
                      size={14}
                      className={active ? "text-secondary fill-secondary" : "text-secondary"}
                    />
                  )}
                  {link.name}
                  {active && (
                    <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary-container rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search + Auth */}
          <div className="hidden md:flex items-center gap-3 my-3">
            {user ? (
              <AccountMenu />
            ) : (
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-primary bg-primary-container rounded-xl hover:bg-primary transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile: Hamburger + Search + Sign In */}
          <div className="flex md:hidden items-center gap-2">
            {!user && (
              <Link
                href="/auth"
                className="px-3 py-1.5 text-xs font-medium text-on-primary bg-primary-container rounded-lg"
              >
                Sign In
              </Link>
            )}
            {user && <AccountMenu />}
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* ===== MOBILE DRAWER ===== */}
      {/* Overlay */}
      <div
        className={`drawer-overlay ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div className={`drawer-panel ${drawerOpen ? "open" : ""}`}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-surface-container-high">
          <Image
            src="/logo.png"
            alt="विक्रांद टाइम्स"
            width={100}
            height={24}
            className="h-6 w-auto"
          />
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 text-on-surface-variant hover:text-on-surface"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Navigation */}
        <nav className="py-2" aria-label="Mobile navigation drawer">
          {navLinks.map((link) => {
            const active = isActiveLink(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-5 h-[52px] text-sm font-medium transition-colors ${
                  active
                    ? link.isSpecial
                      ? "text-secondary bg-secondary-fixed/30 specials-glow"
                      : "text-primary-container bg-primary-fixed/30"
                    : link.isSpecial
                    ? "text-secondary hover:bg-secondary-fixed/10 specials-glow"
                    : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                {link.icon && <link.icon size={18} />}
                {!link.icon && <span className="w-[18px]" />}
                {link.name}
                {active && !link.isSpecial && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-primary-container" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-surface-container-high">
          <p className="text-[11px] text-on-surface-variant text-center">
            © {new Date().getFullYear()} Vikrand Times
          </p>
        </div>
      </div>
    </>
  );
}