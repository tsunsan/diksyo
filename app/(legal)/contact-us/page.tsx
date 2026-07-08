"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";

const DiksyoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="24" height="24" rx="6" fill="black" />
    <rect x="2" y="2" width="24" height="24" rx="6" fill="#FACC15" stroke="black" strokeWidth="2"/>
    <path d="M8 7V21M8 7H14C17.866 7 21 10.134 21 14C21 17.866 17.866 21 14 21H8" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="8" y1="10" x2="10" y2="10" stroke="black" strokeWidth="1.5"/>
    <line x1="8" y1="14" x2="10" y2="14" stroke="black" strokeWidth="1.5"/>
    <line x1="8" y1="18" x2="10" y2="18" stroke="black" strokeWidth="1.5"/>
  </svg>
);

export default function ContactUsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFFBF0] font-sans relative">
      {/* Decorative background dots */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top bar */}
      <div className="sticky top-0 z-50 w-full border-b-4 border-black bg-white/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-black hover:bg-yellow-400 px-3 py-1.5 border-2 border-transparent hover:border-black transition-all uppercase tracking-widest text-xs font-black group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            BACK
          </button>
          
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <DiksyoIcon />
            <span className="text-black uppercase tracking-[0.2em] font-black text-sm italic">
              DIKSYO
            </span>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 relative z-10">
        {/* Header Section */}
        <div className="mb-16 relative">
          <div className="absolute -left-4 md:-left-8 top-12 w-20 h-20 bg-yellow-400 rounded-full border-4 border-black -z-10 blur-[2px]" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-black text-white p-2.5 shadow-[4px_4px_0_0_#FACC15]">
              <Send className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic text-black leading-[0.9]">
              CONTACT<br />US
            </h1>
          </div>
          
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000] relative transform rotate-1 hover:rotate-0 transition-transform">
            <div className="absolute -top-3 left-6 bg-yellow-400 border-2 border-black px-4 py-1 text-xs font-black uppercase tracking-widest">
              Let's Talk
            </div>
            <p className="text-black font-semibold uppercase tracking-tight leading-relaxed">
              HAVE A QUESTION, FEEDBACK, OR WANT TO REPORT A BUG? 
              <br className="hidden md:block"/>
              WE'RE HERE TO HELP YOU WITH YOUR VOCABULARY JOURNEY.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
            <div className="group bg-white border-4 border-black p-6 shadow-[6px_6px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-4">
                <span className="text-2xl">📬</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-black">
                  EMAIL US
                </h2>
              </div>
              <p className="text-black font-medium leading-relaxed">
                For general inquiries, account issues, or just to say hi, reach out to us at:
              </p>
              <div className="mt-4 bg-yellow-100 border-2 border-black p-4 font-mono font-bold text-center">
                <a href="mailto:support@diksyo.app" className="hover:underline text-black">
                 support@diksyo.app 
                </a>
              </div>
            </div>

            <div className="group bg-white border-4 border-black p-6 shadow-[6px_6px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-4">
                <span className="text-2xl">🐛</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-black">
                  BUG REPORTS
                </h2>
              </div>
              <p className="text-black font-medium leading-relaxed">
                Found a typo in a word definition? Is a quiz bugging out? Please include a screenshot if possible and exactly what steps caused the issue!
              </p>
            </div>

            <div className="group bg-white border-4 border-black p-6 shadow-[6px_6px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-4">
                <span className="text-2xl">💡</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-black">
                  FEATURE REQUESTS
                </h2>
              </div>
              <p className="text-black font-medium leading-relaxed">
                Have a great idea to make Diksyo even better? We love hearing suggestions from our learners. Send them our way!
              </p>
            </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-black/60 font-black uppercase tracking-widest text-xs">
            © {new Date().getFullYear()} Diksyo. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
