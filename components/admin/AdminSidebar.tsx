// components/admin/AdminSidebar.tsx - SIMPLIFIED
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, Mail, LogOut, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminSidebar() {
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navItems = [
    {
      name: "Upload Edition",
      href: "/admin",
      icon: Upload,
    },
    {
      name: "Messages",
      href: "/admin/messages",
      icon: Mail,
    },
    {
      name: "Metrics",
      href: "/admin/metrics",
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-64 bg-surface-container-lowest border-r border-surface-container-high min-h-screen p-4 flex flex-col">
      <div className="mb-8 px-2">
        <h2 className="text-2xl font-headline font-bold text-primary">Admin Portal</h2>
      </div>
      
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-container text-on-primary-container shadow-sm"
                  : "text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-4 border-t border-surface-container-high">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 text-on-surface-variant hover:text-error hover:bg-error-container/30 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}