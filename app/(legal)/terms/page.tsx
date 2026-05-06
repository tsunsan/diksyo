import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

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

const SECTIONS = [
  {
    title: "1. ACCEPTANCE OF TERMS",
    content:
      "By accessing or using the Diksyo platform, you confirm that you are at least 13 years of age and agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the platform. Diksyo reserves the right to update these terms at any time, and continued use of the platform following any such updates constitutes acceptance of the new terms.",
  },
  {
    title: "2. USE OF THE PLATFORM",
    content:
      "Diksyo grants you a limited, non-exclusive, non-transferable license to access and use the platform for personal, non-commercial educational purposes. You agree not to copy, modify, distribute, sell, or lease any part of the platform. You shall not attempt to reverse engineer, decompile, or extract the source code of any portion of the platform.",
  },
  {
    title: "3. USER ACCOUNTS",
    content:
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify Diksyo of any unauthorized use of your account. Diksyo will not be liable for any loss or damage arising from your failure to protect your account credentials.",
  },
  {
    title: "4. CONTENT & INTELLECTUAL PROPERTY",
    content:
      "All content on the Diksyo platform, including but not limited to text, graphics, logos, icons, images, and software, is the property of Diksyo or its content suppliers and is protected by applicable intellectual property laws. Filipino language content is curated from public domain sources and documented linguistic resources.",
  },
  {
    title: "5. GAMIFICATION & REWARDS",
    content:
      "XP (Experience Points), levels, streaks, and other gamification elements within Diksyo have no monetary value and cannot be transferred, redeemed, or exchanged for real-world currency or goods. Diksyo reserves the right to modify, suspend, or discontinue any gamification feature at any time without prior notice.",
  },
  {
    title: "6. PRIVACY",
    content:
      "Your use of Diksyo is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices regarding the collection, use, and disclosure of your personal information.",
  },
  {
    title: "7. DISCLAIMER OF WARRANTIES",
    content:
      'The Diksyo platform is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. Diksyo does not warrant that the platform will be uninterrupted, error-free, or free of viruses or other harmful components.',
  },
  {
    title: "8. LIMITATION OF LIABILITY",
    content:
      "To the maximum extent permitted by applicable law, Diksyo shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your access to or use of or inability to access or use the platform.",
  },
  {
    title: "9. GOVERNING LAW",
    content:
      "These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Metro Manila, Philippines.",
  },
  {
    title: "10. CONTACT",
    content:
      "If you have any questions about these Terms of Service, please contact us at miltonjunsel@gmail.com. We aim to respond to all legitimate requests within 30 days.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF0] font-sans relative overflow-x-hidden">
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
          <Link
            href="/signup"
            className="flex items-center gap-2 text-black hover:bg-yellow-400 px-3 py-1.5 border-2 border-transparent hover:border-black transition-all uppercase tracking-widest text-xs font-black group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <DiksyoIcon />
            <span className="text-black uppercase tracking-[0.2em] font-black text-sm italic">
              DIKSYO
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="bg-white border-[4px] border-black shadow-[8px_8px_0_#000] p-6 md:p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-yellow-400 border-[2px] border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_#000]">
              <FileText className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-black">
                LEGAL DOCUMENT
              </p>
              <h1 className="text-black uppercase tracking-tight font-black text-3xl md:text-4xl leading-none italic">
                TERMS OF SERVICE
              </h1>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-zinc-100 border-2 border-black px-3 py-1.5">
              <span className="text-black text-[10px] uppercase tracking-widest font-black">
                EFFECTIVE DATE: MAY 06, 2025
              </span>
            </div>
            <div className="bg-zinc-100 border-2 border-black px-3 py-1.5">
              <span className="text-black text-[10px] uppercase tracking-widest font-black">
                VERSION 1.0
              </span>
            </div>
          </div>
        </div>

        {/* Intro banner */}
        <div className="bg-yellow-400 border-[3px] border-black shadow-[5px_5px_0_#000] p-6 mb-10">
          <p className="text-black text-sm leading-relaxed uppercase tracking-wide font-black">
            PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE USING DIKSYO. THESE TERMS GOVERN YOUR USE OF THE DIKSYO PLATFORM, INCLUDING ALL RELATED MOBILE AND WEB APPLICATIONS, FEATURES, AND SERVICES.
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6">
          {SECTIONS.map((section, i) => (
            <div
              key={i}
              className="bg-white border-[2.5px] border-black shadow-[6px_6px_0_#000] p-6 md:p-8"
            >
              <div className="flex items-start gap-5">
                <div className="w-8 h-8 bg-yellow-400 border-2 border-black flex items-center justify-center shrink-0 mt-0.5 shadow-[2px_2px_0_#000]">
                  <span className="text-black font-black text-[10px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <h2 className="text-black uppercase tracking-tight mb-4 font-black text-base md:text-lg italic">
                    {section.title}
                  </h2>
                  <p className="text-zinc-600 text-sm leading-relaxed font-bold">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 bg-white border-[4px] border-black shadow-[6px_6px_0_#000] p-6 flex items-center justify-between flex-wrap gap-6">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black">
            © 2025 DIKSYO
          </p>
          <Link
            href="/privacy"
            className="text-yellow-400 text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 font-black"
          >
            VIEW PRIVACY POLICY →
          </Link>
        </div>
      </div>
    </div>
  );
}
