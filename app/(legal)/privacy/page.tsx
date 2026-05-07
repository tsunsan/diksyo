"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";

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
    title: "1. INFORMATION WE COLLECT",
    icon: "📥",
    content:
      "We collect information you provide directly, including your name and email address upon registration, your vocabulary learning progress and quiz results, words saved to your Personal Vocabulary Vault, and daily activity data for streak tracking. We do not collect sensitive personal information such as government IDs, financial data, or precise geolocation.",
  },
  {
    title: "2. HOW WE USE YOUR INFORMATION",
    icon: "⚙️",
    content:
      "Your information is used to provide and improve the Diksyo learning experience, including personalizing your vocabulary recommendations, calculating your XP and level progression, maintaining your daily streak, and generating aggregate insights about learning patterns. We do not sell your personal data to third parties.",
  },
  {
    title: "3. DATA STORAGE & SECURITY",
    icon: "🔒",
    content:
      "All user data is stored on secure servers with industry-standard encryption. We employ security measures including SSL/TLS encryption for data in transit, regular security audits, and strict access controls. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password for your Diksyo account.",
  },
  {
    title: "4. COOKIES & TRACKING",
    icon: "🍪",
    content:
      "Diksyo uses cookies and similar tracking technologies to maintain your session, remember your preferences, and analyze how you use the platform. Essential cookies are required for the platform to function. You may disable non-essential cookies through your browser settings, though this may affect some features.",
  },
  {
    title: "5. THIRD-PARTY SERVICES",
    icon: "🔗",
    content:
      "We may use third-party service providers for analytics, hosting, and communication services. These providers are bound by data processing agreements and are not permitted to use your data for their own purposes. We do not integrate with social media platforms without your explicit consent.",
  },
  {
    title: "6. YOUR RIGHTS",
    icon: "✊",
    content:
      "Under applicable law, you have the right to access the personal data we hold about you, request correction of inaccurate data, request deletion of your account and associated data, and opt out of non-essential communications. To exercise these rights, contact us at miltonjunsel@gmail.com.",
  },
  {
    title: "7. CHILDREN'S PRIVACY",
    icon: "👧",
    content:
      "Diksyo is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such data without parental consent, we will take immediate steps to delete it. Parents or guardians who believe their child has provided us with personal data should contact us immediately.",
  },
  {
    title: "8. DATA RETENTION",
    icon: "📂",
    content:
      "We retain your account data for as long as your account is active or as needed to provide services. You may request deletion of your account at any time. Following deletion, we may retain anonymized, aggregated data for research and platform improvement purposes.",
  },
  {
    title: "9. CHANGES TO THIS POLICY",
    icon: "📝",
    content:
      "We may update this Privacy Policy from time to time. We will notify you of any significant changes via email or a prominent notice on the platform. Your continued use of Diksyo after such changes constitutes acceptance of the updated policy.",
  },
  {
    title: "10. CONTACT US",
    icon: "📬",
    content:
      "For privacy-related concerns, requests, or inquiries, please contact our Data Protection Officer at miltonjunsel@gmail.com. We aim to respond to all legitimate requests within 30 days. For urgent matters, please include 'URGENT' in your subject line.",
  },
];

export default function PrivacyPage() {
  const router = useRouter();

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
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-black hover:bg-yellow-400 px-3 py-1.5 border-2 border-transparent hover:border-black transition-all uppercase tracking-widest text-xs font-black group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
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
            <div className="w-12 h-12 bg-purple-600 border-[2px] border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_#000]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-black">
                LEGAL DOCUMENT
              </p>
              <h1 className="text-black uppercase tracking-tight font-black text-3xl md:text-4xl leading-none italic">
                PRIVACY POLICY
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
        <div className="bg-white border-[3px] border-black shadow-[5px_5px_0_#7C3AED] p-6 mb-10">
          <div className="flex items-start gap-4">
            <Shield className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
            <p className="text-black text-sm leading-relaxed uppercase tracking-wide font-black">
              YOUR PRIVACY MATTERS TO US. DIKSYO IS COMMITTED TO PROTECTING YOUR PERSONAL INFORMATION AND BEING TRANSPARENT ABOUT HOW WE COLLECT, USE, AND SHARE YOUR DATA.
            </p>
          </div>
        </div>

        {/* Quick summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { emoji: "🚫", title: "WE DON'T SELL", desc: "YOUR DATA TO THIRD PARTIES" },
            { emoji: "🔐", title: "ENCRYPTED", desc: "ALL DATA IS SECURED" },
            { emoji: "✋", title: "YOUR CHOICE", desc: "DELETE ANYTIME" },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white border-[2.5px] border-black shadow-[4px_4px_0_#7C3AED] p-5 text-center transition-transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-3">{item.emoji}</div>
              <div className="text-black text-[10px] uppercase tracking-widest mb-1 font-black">
                {item.title}
              </div>
              <div className="text-zinc-400 text-[8px] uppercase tracking-widest font-black leading-tight">
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6">
          {SECTIONS.map((section, i) => (
            <div
              key={i}
              className="bg-white border-[2.5px] border-black shadow-[6px_6px_0_#000] p-6 md:p-8"
            >
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 bg-yellow-50 border-[2px] border-black flex items-center justify-center text-xl shrink-0 shadow-[2px_2px_0_#000]">
                  {section.icon}
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
            href="/terms"
            className="text-purple-600 text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 font-black"
          >
            VIEW TERMS OF SERVICE →
          </Link>
        </div>
      </div>
    </div>
  );
}
