import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Vikrand Times
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              विकास क्रांती दल
            </p>
            <p className="text-sm text-gray-600 mt-3">
              A Marathi weekly newspaper<br />
              Publishing since 2015
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-red-700">
                  Read Latest Edition
                </Link>
              </li>
              <li>
                <Link href="/archive" className="hover:text-red-700">
                  Archive
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-red-700">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-red-700">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Contact
            </h4>
            <p className="text-sm text-gray-600">
              Phone:{" "}
              <a
                href="tel:9370705140"
                className="hover:text-red-700"
              >
                9370705140
              </a>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Email:{" "}
              <a
                href="mailto:vikrandtimes@gmail.com"
                className="hover:text-red-700"
              >
                vikrandtimes@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Vikrand Times. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
