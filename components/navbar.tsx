// this navbar is not used now. I integrated the navbar with the brand bar in header.tsx to make UI cleaner.
// will still be keeping this code for future reference


// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { Menu, X } from "lucide-react";

// const navItems = [
//   { label: "नवीनतम", href: "/", en: "Latest" },
//   { label: "जुने अंक", href: "/archive", en: "Archive" },
//   { label: "आमच्याविषयी", href: "/about", en: "About" },
//   { label: "संपर्क", href: "/contact", en: "Contact" },
// ];

// export default function Navbar() {
//   const [open, setOpen] = useState(false);

//   return (
//     <nav className="border-t border-gray-200 bg-white">
//       <div className="max-w-6xl mx-auto px-4">
        
//         {/* Mobile */}
//         <div className="flex md:hidden items-center justify-between py-2">
//           <span className="text-sm font-medium text-gray-700">Menu</span>
//           <button
//             onClick={() => setOpen(!open)}
//             className="p-2 text-gray-700 hover:text-red-700"
//             aria-label="Toggle menu"
//           >
//             {open ? <X size={18} /> : <Menu size={18} />}
//           </button>
//         </div>

//         {/* Desktop */}
//         <ul className="hidden md:flex justify-center gap-8 py-2 text-sm font-medium">
//           {navItems.map(item => (
//             <li key={item.href}>
//               <Link
//                 href={item.href}
//                 className="text-gray-700 hover:text-red-700 transition"
//               >
//                 {item.en}
//               </Link>
//             </li>
//           ))}
//         </ul>

//         {/* Mobile dropdown */}
//         {open && (
//           <ul className="md:hidden border-t border-gray-200 py-2">
//             {navItems.map(item => (
//               <li key={item.href}>
//                 <Link
//                   href={item.href}
//                   onClick={() => setOpen(false)}
//                   className="block px-2 py-3 text-gray-700 hover:bg-gray-50 hover:text-red-700"
//                 >
//                   <span className="font-marathi">{item.label}</span>
//                   <span className="ml-2 text-sm text-gray-500">
//                     {item.en}
//                   </span>
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </nav>
//   );
// }
