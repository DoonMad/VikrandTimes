import { Mail, Phone, Megaphone } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-linear-to-r from-red-800 to-red-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-5">
              <Megaphone className="w-5 h-5" />
              <span className=" font-medium">
                Advertising & Contact
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Advertise with Vikrand Times
            </h1>

            <p className="text-lg text-red-100 mb-6">
              Reach thousands of Marathi readers through a trusted weekly
              newspaper with over a decade of local presence.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="tel:+919370705140"
                className="inline-flex items-center gap-2 bg-white text-red-800 font-semibold px-5 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call: +91 9370705140
              </a>

              <a
                href="mailto:vikrandtimes@gmail.com"
                className="inline-flex items-center gap-2 border-2 border-white text-white font-semibold px-5 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Info */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Why Advertise With Us?
              </h2>

              <ul className="space-y-2 text-gray-700 ">
                <li>• Strong local readership and community trust</li>
                <li>• Marathi weekly newspaper with consistent circulation</li>
                <li>• Affordable and flexible advertising options</li>
                <li>• Print + digital visibility</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Contact Details
              </h2>

              <div className="space-y-3  text-gray-700">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-red-700" />
                  <span>+91 9370705140 (WhatsApp)</span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-red-700" />
                  <span>vikrandtimes@gmail.com</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                We usually respond within 1–2 working days.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Send us a message
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
