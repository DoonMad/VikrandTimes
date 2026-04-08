import { Newspaper, PenTool, BookOpen, Quote, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us | Vikrand Times",
  description: "Learn about Vikrand Times, a Marathi weekly newspaper, and its founder Arunkumar Mundada.",
};

export default function About() {
  return (
    <div className="bg-surface min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-surface-container-highest border-b border-surface-container-low pt-16 pb-20 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-fixed/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-fixed/30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 opacity-30"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-lowest rounded-full border border-surface-container-high text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-6 shadow-sm">
            <Newspaper size={14} className="text-primary" /> Established 2015
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-on-surface mb-6 leading-tight">
            The voice of the <br className="hidden md:block"/>
            <span className="text-primary relative inline-block">
              Marathwada region
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary-fixed/80 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            A Marathi weekly newspaper dedicated to fearless reporting, social issues, and community advocacy.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        
        {/* The Paper Detail Card */}
        <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-8 md:p-10 shadow-lg text-center md:text-left md:flex items-start gap-10 mb-16">
          <div className="w-16 h-16 bg-primary-fixed text-primary rounded-2xl flex items-center justify-center shrink-0 mb-6 md:mb-0 mx-auto">
            <BookOpen size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-4">
              About Vikrand Times
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              <strong className="text-on-surface font-semibold">Vikrand Times (विकास क्रांती दल)</strong> is a Marathi weekly newspaper that has been serving readers for over a decade. The newspaper focuses heavily on local news, social issues, public interest stories, and community-related reporting.
            </p>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              Published once a week, we aim to present news in a clear, responsible, and accessible manner for Marathi readers. Over the years, the newspaper has built a loyal readership by staying rooted in ground-level reporting and covering issues that matter to everyday citizens.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              With the launch of this digital platform, Vikrand Times takes a definitive step towards making its content instantly accessible, while maintaining an unwavering commitment to honest and independent journalism.
            </p>
          </div>
        </div>

        {/* The Founder Card */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-2xl p-8 md:p-10 mb-16 relative overflow-hidden">
          <Quote size={120} className="absolute -top-6 -right-6 text-surface-container-high/40 -rotate-12" />
          
          <div className="relative z-10 md:flex items-center gap-8">
            <div className="mb-8 md:mb-0 shrink-0 text-center">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-surface-container-highest border-4 border-surface-container-lowest rounded-full mx-auto shadow-md flex items-center justify-center overflow-hidden">
                <span className="text-6xl font-headline font-bold text-primary opacity-60">
                  AM
                </span>
                {/* When you have an image: <Image src="/founder.jpg" alt="Arunkumar Mundada" fill className="object-cover" /> */}
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface mt-4">Arunkumar Mundada</h3>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary mt-1">Founder & Editor</p>
            </div>
            
            <div className="h-px w-full md:w-px md:h-40 bg-surface-container-high my-6 md:my-0"></div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-primary" size={24} />
                <h4 className="text-lg font-bold text-on-surface">45+ Years of Trust</h4>
              </div>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                Vikrand Times is founded and edited by Arunkumar Mundada, a senior journalist with over 45 years of distinguished experience in the field of journalism.
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                Throughout his career, he has worked with some of the most prestigious newspaper groups in Maharashtra, including <strong className="text-on-surface">Maharashtra Times</strong>, <strong className="text-on-surface">The Times of India</strong>, and <strong className="text-on-surface">Tarun Bharat</strong>. He continues to guide Vikrand Times with a strong focus on journalistic integrity and public accountability.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Mini */}
        <div className="text-center py-8">
          <p className="text-on-surface-variant mb-4">Have a story to share or want to advertise with us?</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-on-surface text-surface rounded-full font-medium hover:bg-primary transition-colors shadow-md">
            <PenTool size={18} /> Contact the Editor
          </Link>
        </div>

      </div>
    </div>
  );
}
