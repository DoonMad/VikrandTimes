// components/admin/AdminSidebar.tsx - SIMPLIFIED
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, Mail, LogOut } from "lucide-react";
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
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900">Admin</h2>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded ${
                isActive
                  ? "bg-red-100 text-red-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 text-gray-700 hover:text-red-700 w-full px-3 py-2"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}