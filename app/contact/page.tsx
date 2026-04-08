import { Mail, Phone, Megaphone, CheckCircle2, MessageCircle } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact & Advertise | Vikrand Times",
  description: "Contact Vikrand Times for advertising inquiries, feedback, or general communication.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface pb-24 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-fixed/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-30 pointer-events-none"></div>

      {/* Hero Section */}
      <div className="bg-primary text-on-primary pt-16 pb-14 px-4 relative z-10 shadow-md">
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center md:text-left relative z-20">
          <div className="inline-flex items-center gap-2 bg-on-primary/20 text-on-primary rounded-full px-4 py-1.5 mb-6 text-sm font-bold uppercase tracking-widest shadow-sm backdrop-blur-sm">
            <Megaphone size={16} /> Advertising & Contact
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-on-primary mb-6 leading-tight">
            Connect with <br className="hidden md:block"/> Vikrand Times
          </h1>
          
          <p className="text-lg md:text-xl text-primary-fixed max-w-2xl leading-relaxed mb-10 mx-auto md:mx-0">
            Reach thousands of dedicated Marathi readers through a trusted weekly newspaper with over a decade of continuous publication.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <a
              href="https://wa.me/919370705140"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-[#20BE5C] hover:shadow-lg transition-all active:scale-95"
            >
              <MessageCircle size={20} /> Chat on WhatsApp
            </a>

            <a
              href="mailto:vikrandtimes@gmail.com"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-on-primary/40 text-on-primary font-semibold px-6 py-3.5 rounded-xl hover:bg-on-primary/10 transition-all active:scale-95"
            >
              <Mail size={20} /> Email Editor
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Left Column: Info */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">
                Why Advertise?
              </h2>
              <ul className="space-y-4">
                {[
                  "Strong local readership and deep community trust",
                  "Consistent weekly circulation across the region",
                  "Highly affordable and flexible advertising packages",
                  "Unmatched print and emerging digital visibility"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
                    <span className="text-on-surface-variant leading-relaxed font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface-container-low border border-surface-container-high rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-headline font-bold text-on-surface mb-6">
                Direct Contact
              </h2>
              
              <div className="space-y-6">
                <a href="tel:+919370705140" className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-primary-fixed text-primary rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Phone / WhatsApp</p>
                    <p className="text-on-surface font-medium text-lg">+91 9370705140</p>
                  </div>
                </a>

                <a href="mailto:vikrandtimes@gmail.com" className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-secondary-fixed text-secondary rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Email</p>
                    <p className="text-on-surface font-medium text-lg">vikrandtimes@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-3">
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-3xl p-8 md:p-10 shadow-lg">
              <div className="mb-8">
                <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">
                  Send a Message
                </h2>
                <p className="text-on-surface-variant">
                  Whether you have a tip, feedback, or want to place an ad, we want to hear from you. We typically respond within 1–2 business days.
                </p>
              </div>
              
              {/* Note: ContactForm currently uses generic tailwind classes. It should inherit styles well if it relies on standard inputs, but might need a class wrapper later depending on its implementation. */}
              <div className="contact-form-wrapper">
                <ContactForm />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating WhatsApp FAB (Global Page specific) */}
      <a 
        href="https://wa.me/919370705140"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 md:bottom-8 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all duration-300"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle size={28} />
      </a>

    </div>
  );
}
