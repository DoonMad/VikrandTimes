import Image from "next/image";
import Navbar from "./navbar";

export default function Header() {
  return (
    <header className="border-b border-gray-200">
      
      {/* Top utility bar */}
      <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-600">
        <span>गुरुवार, 14 डिसेंबर 2025</span>

        <button className="text-red-700 hover:underline font-medium">
          Sign In
        </button>
      </div>

      {/* Brand bar */}
      <div className="flex flex-col items-center py-3">
        <Image
          src="/logo.png"
          alt="Vikrand Times Logo"
          height={48}
          width={240}
          priority
        />
        <p className="text-sm text-gray-500 mt-1">
          साप्ताहिक मराठी वृत्तपत्र
        </p>
      </div>

      <Navbar />
    </header>
  );
}
