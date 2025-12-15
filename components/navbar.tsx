import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-t border-b border-gray-200 bg-white">
      <ul className="flex justify-center gap-6 py-2 text-sm font-medium">
        <li>
          <Link
            href="/"
            className="text-gray-700 hover:text-red-700 transition"
          >
            Latest
          </Link>
        </li>
        <li>
          <Link
            href="/archive"
            className="text-gray-700 hover:text-red-700 transition"
          >
            Archive
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className="text-gray-700 hover:text-red-700 transition"
          >
            About
          </Link>
        </li>
        <li>
          <Link
            href="/contact"
            className="text-gray-700 hover:text-red-700 transition"
          >
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
}
