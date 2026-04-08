"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, Archive, Star, Info, Mail } from "lucide-react";

const tabs = [
  { name: "Read", href: "/", icon: Newspaper },
  { name: "Archive", href: "/archive", icon: Archive },
  { name: "Specials", href: "/special-editions", icon: Star },
  { name: "About", href: "/about", icon: Info },
  { name: "Contact", href: "/contact", icon: Mail },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="bottom-tab-bar" aria-label="Mobile navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          tab.href === "/"
            ? pathname === "/" || pathname.startsWith("/edition/")
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 transition-colors ${
              isActive
                ? tab.name === "Specials" ? "text-secondary" : "text-primary-container"
                : tab.name === "Specials" ? "text-secondary hover:text-secondary-container" : "text-on-surface-variant hover:text-on-surface"
            } ${tab.name === "Specials" ? "specials-glow" : ""}`}
          >
            <Icon
              size={20}
              strokeWidth={isActive ? 2.5 : 1.5}
              className={tab.name === "Specials" ? "specials-icon-glow" : ""}
            />
            <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
