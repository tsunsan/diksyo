import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  BookMarked, ArrowRight, Zap, BookOpen, Target, Flame, Star, Award,
  ChevronRight, CheckCircle2, Users, TrendingUp, Volume2, RotateCcw,
  Menu, X, Sparkles, Sun, Moon, Plus, Minus, Check,
} from "lucide-react";
import {
  ReaderIllustration,
  TrophyIllustration,
  QuestionIllustration,
} from "../components/illustrations/ReaderIllustration";
import { useTheme } from "../context/ThemeContext";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "📖 SALITA · WORD", "⚡ QUIZ YOURSELF", "🏆 EARN XP", "🔥 DAILY STREAKS",
  "📚 1,200+ WORDS", "🇵🇭 LEARN FILIPINO", "🎯 ACTIVE RECALL", "✨ LEVEL UP",
];

const WORD_OF_THE_DAY = {
  word: "Lakambini",
  phonetic: "/la·kam·bi·ni/",
  pos: "PANGNGALAN",
  posColor: "#7C3AED",
  definition: "A noble woman; a princess; a refined lady of high standing.",
};

const SAMPLE_WORDS = [
  { word: "Bayani", phonetic: "/ba·ya·ni/", pos: "PANGNGALAN", posColor: "#7C3AED", definition: "A hero or patriot who shows great courage for a cause.", example: "Si Rizal ay isang tunay na bayani ng bansa." },
  { word: "Maganda", phonetic: "/ma·gan·da/", pos: "PANG-URI", posColor: "#0057FF", definition: "Beautiful; possessing qualities that delight the senses.", example: "Maganda ang tanawin ng Pilipinas." },
  { word: "Lumipad", phonetic: "/lu·mi·pad/", pos: "PANDIWA", posColor: "#00C853", definition: "To fly; to soar through the air.", example: "Lumipad ang agila sa kalangitan." },
];

const FEATURES = [
  { icon: BookOpen, color: "#FFE500", bg: "#000", title: "DICTIONARY ENGINE", desc: "1,200+ Filipino words with rich definitions, phonetics, usage examples, and part-of-speech tagging — built for deep understanding.", badge: "1,200+ ENTRIES", badgeBg: "#FFE500", badgeText: "#000" },
  { icon: Zap, color: "#000", bg: "#FFE500", title: "ACTIVE RECALL QUIZ", desc: "Type-in answers, instant green/red feedback, and a smart scoring engine that rewards accuracy and speed. No multiple choice — real learning.", badge: "INSTANT FEEDBACK", badgeBg: "#000", badgeText: "#FFE500" },
  { icon: TrendingUp, color: "#FFE500", bg: "#7C3AED", title: "XP & LEVELING", desc: "Climb from Baguhan to Lakan. Earn XP on every correct answer, maintain daily streaks, and watch your rank evolve.", badge: "5 RANKS", badgeBg: "#7C3AED", badgeText: "#fff" },
];

const STEPS = [
  { num: "01", title: "DISCOVER WORDS", desc: "Browse the dictionary and explore Filipino words with full definitions, examples, and pronunciation guides.", color: "#FFE500", icon: BookOpen },
  { num: "02", title: "TAKE THE QUIZ", desc: "Test yourself with active recall challenges. Type the word, get instant feedback, and earn XP for every correct answer.", color: "#0057FF", icon: Target },
  { num: "03", title: "LEVEL UP", desc: "Watch your streak grow, climb the rank ladder, and unlock your Vocabulary Vault as you master Filipino.", color: "#7C3AED", icon: Award },
];

const LEVELS = [
  { name: "BAGUHAN", label: "BEGINNER", xp: "0 XP", color: "#aaa", bg: "#f5f5f5" },
  { name: "MAG-AARAL", label: "STUDENT", xp: "100 XP", color: "#00C853", bg: "#e8fdf0" },
  { name: "BATIKAN", label: "EXPERT", xp: "300 XP", color: "#0057FF", bg: "#e8eeff" },
  { name: "GURO", label: "MASTER", xp: "600 XP", color: "#7C3AED", bg: "#f3eeff" },
  { name: "LAKAN", label: "LEGEND", xp: "1000 XP", color: "#FFE500", bg: "#000" },
];

const STATS = [
  { value: "12,400+", label: "ACTIVE LEARNERS", icon: Users },
  { value: "1,200+", label: "FILIPINO WORDS", icon: BookOpen },
  { value: "98%", label: "QUIZ ACCURACY AVG", icon: Target },
  { value: "42 DAYS", label: "LONGEST STREAK", icon: Flame },
];

const TESTIMONIALS = [
  { name: "MARIA S.", rank: "BATIKAN", rankColor: "#0057FF", text: "Diksyo completely changed how I learn Filipino. The quiz engine makes me actually retain words instead of just reading them.", streak: 28 },
  { name: "JUAN P.", rank: "GURO", rankColor: "#7C3AED", text: "I've tried every app out there. Nothing comes close to the depth of Diksyo's dictionary. The etymology notes are incredible.", streak: 45 },
  { name: "ANA R.", rank: "MAG-AARAL", rankColor: "#00C853", text: "The XP system is addictive! I'm on a 14-day streak and I've already learned 200+ words. Salamat, Diksyo!", streak: 14 },
];

const FAQS = [
  { q: "IS DIKSYO FREE TO USE?", a: "Yes! Diksyo has a free plan that gives you full access to the dictionary, daily quizzes, XP leveling, and streak tracking. A Pro plan unlocks advanced features like spaced repetition scheduling, audio playback, and offline mode." },
  { q: "WHAT FILIPINO WORDS ARE INCLUDED?", a: "Diksyo currently covers 1,200+ Filipino (Tagalog) words spanning everyday vocabulary, emotions, nature, history, culture, and philosophy. New words are added weekly." },
  { q: "HOW DOES THE XP SYSTEM WORK?", a: "You earn XP by answering quiz questions correctly. Easy questions give 10 XP, medium 20 XP, and hard 30 XP. Streak bonuses multiply your XP the longer your consecutive daily practice." },
  { q: "WHAT ARE THE RANK LEVELS?", a: "There are 5 ranks: Baguhan (0 XP), Mag-aaral (100 XP), Batikan (300 XP), Guro (600 XP), and the legendary Lakan (1000+ XP). Each rank unlocks new content and features." },
  { q: "DOES DIKSYO USE SPACED REPETITION?", a: "Spaced repetition scheduling is a Pro feature currently in development. The free plan uses active recall quizzing with a focus on words you've gotten wrong recently." },
  { q: "CAN I USE DIKSYO ON MOBILE?", a: "Diksyo is fully responsive and works great on mobile browsers. Native iOS and Android apps are on our roadmap." },
];

const COMPARISON = [
  { feature: "Full dictionary access", free: true, pro: true },
  { feature: "Daily quiz (5 words)", free: true, pro: true },
  { feature: "XP & leveling", free: true, pro: true },
  { feature: "Flame streak tracker", free: true, pro: true },
  { feature: "Vocabulary Vault", free: true, pro: true },
  { feature: "Unlimited daily quiz", free: false, pro: true },
  { feature: "Audio pronunciation", free: false, pro: true },
  { feature: "Spaced repetition", free: false, pro: true },
  { feature: "Offline mode", free: false, pro: true },
  { feature: "Download word lists", free: false, pro: true },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-y-[3px] border-black bg-[#FFE500] py-3">
      <div className="flex gap-12 whitespace-nowrap" style={{ animation: "ticker 28s linear infinite" }}>
        {doubled.map((item, i) => (
          <span key={i} className="text-black uppercase tracking-[0.25em] flex-shrink-0" style={{ fontWeight: 900, fontSize: "0.85rem" }}>
            {item}
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }`}</style>
    </div>
  );
}

function WordCardDemo() {
  const [active, setActive] = useState(0);
  const word = SAMPLE_WORDS[active];
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % SAMPLE_WORDS.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative">
      <div className="absolute top-3 left-3 w-full h-full bg-black" />
      <div className="relative bg-white border-[3px] border-black p-6 min-h-[260px] flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-black" style={{ fontWeight: 900, fontSize: "2.2rem", lineHeight: 1 }}>{word.word}</h2>
            <p className="text-[#888] mt-1 text-sm" style={{ fontWeight: 600 }}>{word.phonetic}</p>
          </div>
          <span className="px-2 py-1 text-white border-[2px] border-black text-xs uppercase tracking-widest flex-shrink-0" style={{ background: word.posColor, fontWeight: 800 }}>{word.pos}</span>
        </div>
        <p className="text-[#333] text-sm leading-relaxed" style={{ fontWeight: 500 }}>{word.definition}</p>
        <div className="bg-[#FFFBF0] border-[2px] border-black px-3 py-2 mt-auto">
          <p className="text-xs uppercase tracking-widest text-[#888] mb-1" style={{ fontWeight: 700 }}>EXAMPLE</p>
          <p className="text-black text-sm italic" style={{ fontWeight: 600 }}>"{word.example}"</p>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t-[2px] border-black">
          <button className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#555] hover:text-black transition-colors" style={{ fontWeight: 700 }}>
            <Volume2 className="w-4 h-4" /> PLAY
          </button>
          <button className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#555] hover:text-black transition-colors ml-auto" style={{ fontWeight: 700 }} onClick={() => setActive((a) => (a + 1) % SAMPLE_WORDS.length)}>
            <RotateCcw className="w-4 h-4" /> NEXT WORD
          </button>
        </div>
        <div className="flex gap-2 justify-center">
          {SAMPLE_WORDS.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} className="w-2.5 h-2.5 border-[2px] border-black transition-all" style={{ background: i === active ? "#FFE500" : "transparent" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuizPreview() {
  const [typed, setTyped] = useState("");
  const [state, setState] = useState<"idle" | "correct" | "wrong">("idle");
  const check = () => {
    if (!typed.trim()) return;
    setState(typed.toLowerCase().trim() === "bayani" ? "correct" : "wrong");
    setTimeout(() => { setState("idle"); setTyped(""); }, 1800);
  };
  return (
    <div className="relative">
      <div className="absolute top-3 left-3 w-full h-full bg-[#FFE500]" />
      <div className="relative border-[3px] border-black p-6 transition-colors duration-200" style={{ background: state === "correct" ? "#00C853" : state === "wrong" ? "#FF3B3B" : "white" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-black flex items-center justify-center"><Zap className="w-4 h-4 text-[#FFE500]" /></div>
          <span className="uppercase tracking-widest text-xs" style={{ fontWeight: 800 }}>QUICK QUIZ</span>
          <span className="ml-auto bg-[#FFE500] border-[2px] border-black px-2 py-0.5 text-xs uppercase tracking-widest" style={{ fontWeight: 800 }}>+20 XP</span>
        </div>
        <p className="text-[#888] text-xs uppercase tracking-widest mb-1" style={{ fontWeight: 700 }}>TRANSLATE TO FILIPINO:</p>
        <p className="text-black mb-5" style={{ fontWeight: 900, fontSize: "1.6rem" }}>HERO / PATRIOT</p>
        {state === "idle" ? (
          <>
            <input type="text" value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()} placeholder="TYPE YOUR ANSWER..." className="w-full px-4 py-3 border-[2.5px] border-black outline-none text-sm uppercase tracking-wide bg-[#FFFBF0] placeholder:text-[#bbb]" style={{ fontWeight: 700 }} />
            <button onClick={check} className="mt-3 w-full py-3 bg-black text-[#FFE500] border-[2.5px] border-black uppercase tracking-widest text-sm hover:bg-[#111] transition-colors" style={{ fontWeight: 900 }}>CHECK ANSWER →</button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            {state === "correct" ? (
              <>
                <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={3} />
                <p className="text-white" style={{ fontWeight: 900, fontSize: "1.4rem" }}>TAMA! CORRECT!</p>
                <p className="text-white/80 text-xs uppercase tracking-widest" style={{ fontWeight: 700 }}>+20 XP EARNED</p>
              </>
            ) : (
              <>
                <X className="w-10 h-10 text-white" strokeWidth={3} />
                <p className="text-white" style={{ fontWeight: 900, fontSize: "1.4rem" }}>MALI! ANSWER: BAYANI</p>
                <p className="text-white/80 text-xs uppercase tracking-widest" style={{ fontWeight: 700 }}>KEEP PRACTICING!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-0">
      {FAQS.map((faq, i) => (
        <div key={i} className="border-[3px] border-black" style={{ marginTop: i > 0 ? "-3px" : "0", position: "relative", zIndex: open === i ? 10 : i }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors"
            style={{ background: open === i ? "#FFE500" : "#fff", fontWeight: 900 }}
          >
            <span className="uppercase tracking-widest text-black text-sm pr-4" style={{ fontWeight: 900 }}>{faq.q}</span>
            <div className="w-8 h-8 border-[2.5px] border-black flex items-center justify-center flex-shrink-0" style={{ background: open === i ? "#000" : "#FFE500" }}>
              {open === i ? <Minus className="w-4 h-4 text-[#FFE500]" /> : <Plus className="w-4 h-4 text-black" />}
            </div>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <div className="px-6 py-4 border-t-[2px] border-black bg-white">
                  <p className="text-[#444] text-sm leading-relaxed" style={{ fontWeight: 500 }}>{faq.a}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export function LandingPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wotdDismissed, setWotdDismissed] = useState(false);
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Geist', 'Inter', sans-serif", background: isDark ? "#0a0a0a" : "#FFFBF0" }}>
      {/* Dot background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: `radial-gradient(circle, ${isDark ? "#ffffff10" : "#00000010"} 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />

      {/* ── Word of the Day Banner ── */}
      <AnimatePresence>
        {!wotdDismissed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-50 bg-[#7C3AED] border-b-[3px] border-black overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[#FFE500] text-[10px] uppercase tracking-[0.3em] flex-shrink-0" style={{ fontWeight: 900 }}>📖 SALITA NG ARAW</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm uppercase" style={{ fontWeight: 900 }}>{WORD_OF_THE_DAY.word}</span>
                  <span className="text-white/50 text-xs">{WORD_OF_THE_DAY.phonetic}</span>
                  <span className="px-2 py-0.5 text-white text-[9px] uppercase tracking-widest border border-white/30" style={{ fontWeight: 800, background: WORD_OF_THE_DAY.posColor }}>{WORD_OF_THE_DAY.pos}</span>
                  <span className="text-white/70 text-xs hidden sm:inline" style={{ fontWeight: 500 }}>— {WORD_OF_THE_DAY.definition}</span>
                </div>
              </div>
              <button onClick={() => setWotdDismissed(true)} className="text-white/50 hover:text-white transition-colors flex-shrink-0 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 transition-all duration-200" style={{ background: scrolled ? "#000" : (isDark ? "#0a0a0a" : "#FFFBF0"), borderBottom: scrolled ? "3px solid #FFE500" : "3px solid #000" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 flex items-center justify-center border-[2px]" style={{ background: scrolled ? "#FFE500" : "#000", borderColor: scrolled ? "#FFE500" : "#000" }}>
              <BookMarked className="w-5 h-5" style={{ color: scrolled ? "#000" : "#FFE500" }} />
            </div>
            <span className="uppercase tracking-[0.25em]" style={{ fontWeight: 900, fontSize: "1.25rem", color: scrolled ? "#FFE500" : (isDark ? "#fff" : "#000") }}>DIKSYO</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {[["#features", "FEATURES"], ["#how-it-works", "HOW IT WORKS"], ["#ranks", "RANKS"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} className="px-4 py-2 text-xs uppercase tracking-widest transition-all hover:bg-[#FFE500] hover:text-black" style={{ fontWeight: 800, color: scrolled ? "#aaa" : (isDark ? "#888" : "#555") }}>{label}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggle} className="w-9 h-9 border-[2px] flex items-center justify-center transition-all hover:bg-[#FFE500]" style={{ borderColor: scrolled ? "#FFE500" : "#000", color: scrolled ? "#FFE500" : (isDark ? "#fff" : "#000") }}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/login" className="px-4 py-2 text-xs uppercase tracking-widest border-[2px] transition-all hover:bg-[#FFE500] hover:text-black" style={{ fontWeight: 800, borderColor: scrolled ? "#FFE500" : "#000", color: scrolled ? "#FFE500" : (isDark ? "#fff" : "#000") }}>LOG IN</Link>
            <Link to="/signup" className="px-4 py-2 text-xs uppercase tracking-widest border-[2px] transition-all" style={{ fontWeight: 900, background: scrolled ? "#FFE500" : "#000", borderColor: scrolled ? "#FFE500" : "#000", color: scrolled ? "#000" : "#FFE500", boxShadow: "3px 3px 0 #FFE500" }}>START FREE</Link>
          </div>

          <button className="md:hidden p-1" style={{ color: scrolled ? "#FFE500" : (isDark ? "#fff" : "#000") }} onClick={() => setNavOpen(!navOpen)}>
            {navOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {navOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="md:hidden border-t-[3px] border-[#FFE500] px-4 py-4 flex flex-col gap-3 overflow-hidden" style={{ background: "#000" }}>
              {[["#features", "FEATURES"], ["#how-it-works", "HOW IT WORKS"], ["#ranks", "RANKS"], ["#faq", "FAQ"]].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setNavOpen(false)} className="text-[#aaa] uppercase tracking-widest text-sm hover:text-[#FFE500] transition-colors" style={{ fontWeight: 800 }}>{label}</a>
              ))}
              <div className="flex gap-3 pt-2 border-t-[2px] border-[#222]">
                <Link to="/login" className="flex-1 py-3 text-center text-xs uppercase tracking-widest border-[2px] border-[#FFE500] text-[#FFE500]" style={{ fontWeight: 800 }}>LOG IN</Link>
                <Link to="/signup" className="flex-1 py-3 text-center text-xs uppercase tracking-widest bg-[#FFE500] text-black border-[2px] border-[#FFE500]" style={{ fontWeight: 900 }}>START FREE</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8 lg:pt-20 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-[#7C3AED] border-[2.5px] border-black px-3 py-1.5 mb-6 shadow-[3px_3px_0_#000]">
              <Sparkles className="w-3.5 h-3.5 text-[#FFE500]" />
              <span className="text-white text-xs uppercase tracking-[0.2em]" style={{ fontWeight: 800 }}>SMART FILIPINO VOCAB ENGINE</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-black mb-4" style={{ fontWeight: 900, fontSize: "clamp(2.8rem, 6vw, 5rem)", lineHeight: 0.95, letterSpacing: "-0.02em", textTransform: "uppercase", color: isDark ? "#fff" : "#000" }}>
              MASTER<br />FILIPINO.<br />
              <span style={{ WebkitTextStroke: "3px #000", color: "#FFE500" }}>ONE WORD</span><br />
              AT A TIME.
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8 max-w-lg leading-relaxed" style={{ fontWeight: 500, fontSize: "1.05rem", color: isDark ? "#aaa" : "#444" }}>
              Diksyo is an addictive Filipino vocabulary engine — powered by active recall quizzes, XP leveling, flame streaks, and a growing dictionary of 1,200+ words.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link to="/signup" className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-black text-[#FFE500] border-[3px] border-black uppercase tracking-widest transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none" style={{ fontWeight: 900, fontSize: "1rem", boxShadow: "5px 5px 0 #FFE500" }}>
                START FOR FREE <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/app/dictionary" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black border-[3px] border-black uppercase tracking-widest transition-all hover:bg-[#FFFBF0] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none" style={{ fontWeight: 800, fontSize: "0.95rem", boxShadow: "5px 5px 0 #000" }}>
                <BookOpen className="w-5 h-5" /> EXPLORE WORDS
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.55 }}
              className="flex flex-wrap gap-4">
              {[{ icon: Users, text: "12,400+ LEARNERS" }, { icon: Flame, text: "42-DAY MAX STREAK" }, { icon: Star, text: "FREE TO START" }].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 border-[2px] border-black bg-white px-3 py-1.5">
                  <Icon className="w-4 h-4 text-black" />
                  <span className="text-black text-xs uppercase tracking-widest" style={{ fontWeight: 800 }}>{text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — cards */}
          <div className="flex flex-col gap-6 lg:pl-4">
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
              <div className="absolute -top-4 -right-4 w-48 h-48 bg-[#FFE500] border-[3px] border-black" />
              <div className="relative bg-[#FFE500] border-[3px] border-black p-6 flex items-center justify-center shadow-[8px_8px_0_#000]">
                <div className="w-48 h-48"><ReaderIllustration /></div>
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.7, type: "spring", stiffness: 260 }}
                  className="absolute -top-4 -left-4 bg-[#7C3AED] border-[3px] border-black px-3 py-2 shadow-[4px_4px_0_#000]">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#FFE500]" fill="#FFE500" />
                    <span className="text-white text-sm uppercase tracking-widest" style={{ fontWeight: 900 }}>+50 XP</span>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.9, type: "spring", stiffness: 260 }}
                  className="absolute -bottom-4 -right-2 bg-[#FF6D00] border-[3px] border-black px-3 py-2 shadow-[4px_4px_0_#000]">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#FFE500]" fill="#FFE500" />
                    <span className="text-white text-sm uppercase tracking-widest" style={{ fontWeight: 900 }}>12 DAY STREAK</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <WordCardDemo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <Ticker />

      {/* ── Stats Bar ── */}
      <section className="relative z-10 bg-black border-b-[3px] border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }} viewport={{ once: true }}
                className="flex flex-col items-center justify-center py-6 px-4 text-center"
                style={{ borderRight: i < STATS.length - 1 ? "2px solid #222" : "none" }}>
                <Icon className="w-6 h-6 text-[#FFE500] mb-2" />
                <p className="text-white" style={{ fontWeight: 900, fontSize: "1.8rem", lineHeight: 1 }}>{value}</p>
                <p className="text-[#666] mt-1 text-xs uppercase tracking-widest" style={{ fontWeight: 700 }}>{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
            <span className="text-[#7C3AED] text-xs uppercase tracking-[0.3em]" style={{ fontWeight: 800 }}>WHAT YOU GET</span>
            <h2 className="mt-1" style={{ fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1, color: isDark ? "#fff" : "#000" }}>BUILT FOR REAL<br />LANGUAGE MASTERY.</h2>
          </motion.div>
          <Link to="/signup" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest hover:text-[#7C3AED] transition-colors self-start sm:self-auto" style={{ fontWeight: 800, color: isDark ? "#aaa" : "#555" }}>
            GET STARTED <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {FEATURES.map(({ icon: Icon, color, bg, title, desc, badge, badgeBg, badgeText }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.12 }} viewport={{ once: true }}
              className="relative border-[3px] border-black p-8 transition-all hover:-translate-y-1"
              style={{ background: "#fff", marginLeft: i > 0 ? "-3px" : "0", boxShadow: "6px 6px 0 #000", marginBottom: "6px" }}>
              <div className="w-14 h-14 border-[3px] border-black flex items-center justify-center mb-6" style={{ background: bg }}>
                <Icon className="w-7 h-7" style={{ color }} />
              </div>
              <span className="inline-block px-2 py-1 text-[10px] uppercase tracking-widest border-[2px] border-black mb-3" style={{ background: badgeBg, color: badgeText, fontWeight: 800 }}>{badge}</span>
              <h3 className="text-black mb-3" style={{ fontWeight: 900, fontSize: "1.2rem", lineHeight: 1.2 }}>{title}</h3>
              <p className="text-[#555] text-sm leading-relaxed" style={{ fontWeight: 500 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          FREE VS PRO COMPARISON
      ══════════════════════════════════════ */}
      <section className="relative z-10 border-y-[3px] border-black" style={{ background: isDark ? "#111" : "#fff" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-[#0057FF] text-xs uppercase tracking-[0.3em]" style={{ fontWeight: 800 }}>PRICING</span>
            <h2 className="mt-1" style={{ fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1, color: isDark ? "#fff" : "#000" }}>FREE VS PRO.</h2>
          </motion.div>

          <div className="relative">
            <div className="absolute top-3 left-3 w-full h-full bg-[#FFE500]" />
            <div className="relative border-[3px] border-black overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 border-b-[3px] border-black">
                <div className="p-5 border-r-[3px] border-black bg-black" />
                <div className="p-5 text-center border-r-[3px] border-black bg-white">
                  <p className="text-black text-xs uppercase tracking-widest mb-1" style={{ fontWeight: 700 }}>FREE</p>
                  <p style={{ fontWeight: 900, fontSize: "1.8rem", color: "#000", lineHeight: 1 }}>$0</p>
                  <p className="text-[#888] text-xs uppercase mt-1" style={{ fontWeight: 600 }}>FOREVER</p>
                </div>
                <div className="p-5 text-center bg-[#7C3AED]">
                  <p className="text-[#FFE500] text-xs uppercase tracking-widest mb-1" style={{ fontWeight: 700 }}>PRO</p>
                  <p style={{ fontWeight: 900, fontSize: "1.8rem", color: "#fff", lineHeight: 1 }}>$4</p>
                  <p className="text-white/60 text-xs uppercase mt-1" style={{ fontWeight: 600 }}>PER MONTH</p>
                </div>
              </div>

              {/* Rows */}
              {COMPARISON.map((row, i) => (
                <div key={i} className="grid grid-cols-3" style={{ borderBottom: i < COMPARISON.length - 1 ? "2px solid #000" : "none" }}>
                  <div className="p-4 border-r-[3px] border-black" style={{ background: i % 2 === 0 ? "#FFFBF0" : "#fff" }}>
                    <span className="text-black text-sm uppercase tracking-wider" style={{ fontWeight: 700 }}>{row.feature}</span>
                  </div>
                  <div className="p-4 flex items-center justify-center border-r-[3px] border-black" style={{ background: i % 2 === 0 ? "#FFFBF0" : "#fff" }}>
                    {row.free ? <Check className="w-5 h-5 text-[#00C853]" strokeWidth={3} /> : <X className="w-5 h-5 text-[#ddd]" strokeWidth={2} />}
                  </div>
                  <div className="p-4 flex items-center justify-center" style={{ background: i % 2 === 0 ? "#f3eeff" : "#ede7ff" }}>
                    {row.pro ? <Check className="w-5 h-5 text-[#7C3AED]" strokeWidth={3} /> : <X className="w-5 h-5 text-[#ddd]" strokeWidth={2} />}
                  </div>
                </div>
              ))}

              {/* CTA row */}
              <div className="grid grid-cols-3 border-t-[3px] border-black">
                <div className="p-5 bg-black" />
                <div className="p-5 text-center border-r-[3px] border-black bg-white">
                  <Link to="/signup" className="inline-block w-full py-2.5 bg-white border-[2.5px] border-black text-black text-xs uppercase tracking-widest hover:bg-[#f5f5f5] transition-colors" style={{ fontWeight: 900 }}>GET STARTED</Link>
                </div>
                <div className="p-5 text-center bg-[#7C3AED]">
                  <Link to="/signup" className="inline-block w-full py-2.5 bg-[#FFE500] border-[2.5px] border-black text-black text-xs uppercase tracking-widest hover:bg-[#fff01a] transition-colors" style={{ fontWeight: 900 }}>GO PRO</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 border-y-[3px] border-black" style={{ background: "#000" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-14">
            <span className="text-[#FFE500] text-xs uppercase tracking-[0.3em]" style={{ fontWeight: 800 }}>SIMPLE PROCESS</span>
            <h2 className="text-white mt-1" style={{ fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1 }}>HOW DIKSYO WORKS.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ num, title, desc, color, icon: Icon }, i) => (
              <motion.div key={num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.15 }} viewport={{ once: true }}
                className="relative border-[3px] border-[#333] p-8 hover:border-[#FFE500] transition-colors" style={{ background: "#0a0a0a" }}>
                <p className="mb-4" style={{ fontWeight: 900, fontSize: "3.5rem", lineHeight: 1, color }}>{num}</p>
                <div className="w-10 h-10 border-[2px] flex items-center justify-center mb-4" style={{ background: color, borderColor: color }}>
                  <Icon className="w-5 h-5 text-black" />
                </div>
                <h3 className="mb-2" style={{ fontWeight: 900, fontSize: "1.1rem", color: "#fff", textTransform: "uppercase" }}>{title}</h3>
                <p className="text-[#666] text-sm leading-relaxed" style={{ fontWeight: 500 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          QUIZ DEMO
      ══════════════════════════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
            <span className="text-[#0057FF] text-xs uppercase tracking-[0.3em]" style={{ fontWeight: 800 }}>TRY IT NOW</span>
            <h2 className="mt-1 mb-5" style={{ fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1, color: isDark ? "#fff" : "#000" }}>ACTIVE RECALL,<br />NOT PASSIVE<br />READING.</h2>
            <p className="mb-6 leading-relaxed" style={{ fontWeight: 500, color: isDark ? "#aaa" : "#444" }}>Science-backed active recall forces your brain to retrieve words rather than just recognize them — dramatically increasing retention.</p>
            <div className="flex flex-col gap-3">
              {["Type-in answers (no multiple choice shortcuts)", "Instant green/red visual feedback", "XP rewards scale with answer speed", "Wrong answers flagged for spaced review"].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00C853] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-sm" style={{ fontWeight: 600, color: isDark ? "#ccc" : "#333" }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
            <QuizPreview />
            <p className="text-center text-xs text-[#888] mt-4 uppercase tracking-widest" style={{ fontWeight: 600 }}>LIVE DEMO — TYPE "BAYANI" TO GET IT RIGHT</p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          RANKS
      ══════════════════════════════════════ */}
      <section id="ranks" className="relative z-10 border-y-[3px] border-black" style={{ background: isDark ? "#0a0a0a" : "#FFFBF0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
              <span className="text-[#FF6D00] text-xs uppercase tracking-[0.3em]" style={{ fontWeight: 800 }}>THE HIERARCHY</span>
              <h2 className="mt-1" style={{ fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1, color: isDark ? "#fff" : "#000" }}>EARN YOUR RANK.<br />PROVE YOUR MASTERY.</h2>
            </motion.div>
            <div className="flex items-center gap-2 border-[3px] border-black bg-[#FF6D00] px-4 py-2 self-start">
              <Flame className="w-5 h-5 text-[#FFE500]" fill="#FFE500" />
              <span className="text-white text-sm uppercase tracking-widest" style={{ fontWeight: 900 }}>STREAK MULTIPLIER</span>
            </div>
          </div>

          <div className="flex flex-col gap-0">
            {LEVELS.map(({ name, label, xp, color, bg }, i) => (
              <motion.div key={name} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }} viewport={{ once: true }}
                className="group flex items-center gap-6 border-[3px] border-black p-5 transition-all hover:-translate-x-1 hover:shadow-[6px_6px_0_#000] cursor-default"
                style={{ background: i === LEVELS.length - 1 ? "#000" : bg, marginTop: i > 0 ? "-3px" : "0", zIndex: i, position: "relative" }}>
                <div className="w-10 h-10 border-[2px] border-black flex items-center justify-center flex-shrink-0" style={{ background: color }}>
                  <span className="text-black text-sm" style={{ fontWeight: 900 }}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="flex-1">
                  <p style={{ fontWeight: 900, fontSize: "1.3rem", color: i === LEVELS.length - 1 ? "#FFE500" : "#000", textTransform: "uppercase" }}>{name}</p>
                  <p className="text-xs uppercase tracking-widest" style={{ fontWeight: 700, color: "#888" }}>{label}</p>
                </div>
                <div className="flex-shrink-0 px-3 py-1.5 border-[2px] border-black" style={{ background: color }}>
                  <span className="text-xs uppercase tracking-widest" style={{ fontWeight: 900, color: "#000" }}>{xp}</span>
                </div>
                <ChevronRight className="w-5 h-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: i === LEVELS.length - 1 ? "#FFE500" : "#000" }} />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <div className="absolute top-3 left-3 w-full h-full bg-[#7C3AED]" />
              <div className="relative bg-white border-[3px] border-black p-6"><div className="w-40 mx-auto"><TrophyIllustration /></div></div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ fontWeight: 700, color: "#888" }}>YOUR JOURNEY</p>
              <h3 className="mb-4" style={{ fontWeight: 900, fontSize: "1.8rem", lineHeight: 1.1, color: isDark ? "#fff" : "#000" }}>FROM BAGUHAN<br />TO LAKAN.</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ fontWeight: 500, color: isDark ? "#aaa" : "#555" }}>Every word learned, every quiz passed, every streak maintained earns you XP. Accumulate enough and your rank evolves — from Baguhan all the way to legendary Lakan status.</p>
              <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-[#7C3AED] text-white border-[3px] border-black uppercase tracking-widest text-sm hover:bg-[#6d28d9] transition-colors" style={{ fontWeight: 900, boxShadow: "4px 4px 0 #000" }}>
                BEGIN YOUR QUEST <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section className="relative z-10 border-b-[3px] border-black" style={{ background: "#000" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <span className="text-[#FFE500] text-xs uppercase tracking-[0.3em]" style={{ fontWeight: 800 }}>SOCIAL PROOF</span>
            <h2 className="text-white mt-1" style={{ fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1 }}>WHAT LEARNERS SAY.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {TESTIMONIALS.map(({ name, rank, rankColor, text, streak }, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.12 }} viewport={{ once: true }}
                className="border-[3px] border-[#222] p-8 hover:border-[#FFE500] transition-colors"
                style={{ marginLeft: i > 0 ? "-3px" : "0", background: "#0a0a0a" }}>
                <p className="text-[#ccc] text-sm leading-relaxed mb-6" style={{ fontWeight: 500 }}>"{text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t-[2px] border-[#222]">
                  <div className="w-10 h-10 border-[2px] border-[#333] flex items-center justify-center" style={{ background: rankColor }}>
                    <span className="text-white text-xs" style={{ fontWeight: 900 }}>{name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm" style={{ fontWeight: 800 }}>{name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5" style={{ background: rankColor, color: "#fff", fontWeight: 800 }}>{rank}</span>
                      <div className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-[#FF6D00]" fill="#FF6D00" />
                        <span className="text-[#666] text-[10px] uppercase" style={{ fontWeight: 700 }}>{streak} DAYS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
      ══════════════════════════════════════ */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-[#FF6D00] text-xs uppercase tracking-[0.3em]" style={{ fontWeight: 800 }}>GOT QUESTIONS?</span>
          <h2 className="mt-1" style={{ fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1, color: isDark ? "#fff" : "#000" }}>FREQUENTLY ASKED.</h2>
        </motion.div>
        <FAQAccordion />
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="relative">
          <div className="absolute top-4 left-4 w-full h-full bg-[#FFE500]" />
          <div className="relative border-[4px] border-black p-10 sm:p-16 text-center" style={{ background: "#000" }}>
            <div className="w-32 mx-auto mb-6"><QuestionIllustration /></div>
            <span className="text-[#FFE500] text-xs uppercase tracking-[0.3em] block mb-3" style={{ fontWeight: 800 }}>WHAT ARE YOU WAITING FOR?</span>
            <h2 className="text-white mb-5" style={{ fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.95, textTransform: "uppercase" }}>
              START YOUR<br /><span style={{ color: "#FFE500" }}>FILIPINO</span><br />QUEST TODAY.
            </h2>
            <p className="text-[#888] mb-10 max-w-md mx-auto" style={{ fontWeight: 500, fontSize: "1rem" }}>Join 12,400+ learners mastering Filipino vocabulary with Diksyo. Free to start. No credit card required.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#FFE500] text-black border-[3px] border-[#FFE500] uppercase tracking-widest transition-all hover:bg-[#fff01a]" style={{ fontWeight: 900, fontSize: "1rem", boxShadow: "5px 5px 0 #FFE500" }}>
                CREATE FREE ACCOUNT <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/app/dictionary" className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-transparent text-[#FFE500] border-[3px] border-[#333] uppercase tracking-widest transition-all hover:border-[#FFE500]" style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                <BookOpen className="w-5 h-5" /> BROWSE DICTIONARY
              </Link>
            </div>
            <p className="text-[#555] text-xs mt-8 uppercase tracking-widest" style={{ fontWeight: 600 }}>FREE FOREVER PLAN AVAILABLE · NO CREDIT CARD · CANCEL ANYTIME</p>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t-[3px] border-black" style={{ background: "#000" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b-[2px] border-[#222]">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-[#FFE500] border-[2px] border-[#FFE500] flex items-center justify-center"><BookMarked className="w-5 h-5 text-black" /></div>
                <span className="text-white tracking-[0.25em] uppercase" style={{ fontWeight: 900, fontSize: "1.3rem" }}>DIKSYO</span>
              </div>
              <p className="text-[#666] text-sm leading-relaxed max-w-xs" style={{ fontWeight: 500 }}>A smart Filipino vocabulary learning engine with an addictive quest feel. Built for serious learners.</p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-2.5 h-2.5 bg-[#00C853]" />
                <span className="text-[#00C853] text-xs uppercase tracking-widest" style={{ fontWeight: 700 }}>ALL SYSTEMS OPERATIONAL</span>
              </div>
            </div>
            <div>
              <p className="text-[#FFE500] text-xs uppercase tracking-widest mb-4" style={{ fontWeight: 800 }}>APP</p>
              <div className="flex flex-col gap-2">
                {[["/login", "LOG IN"], ["/signup", "SIGN UP"], ["/app/dashboard", "DASHBOARD"], ["/app/dictionary", "DICTIONARY"], ["/app/quiz", "QUIZ"], ["/app/leaderboard", "LEADERBOARD"]].map(([to, label]) => (
                  <Link key={to} to={to} className="text-[#666] text-sm uppercase tracking-widest hover:text-[#FFE500] transition-colors" style={{ fontWeight: 600 }}>{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[#FFE500] text-xs uppercase tracking-widest mb-4" style={{ fontWeight: 800 }}>LEGAL</p>
              <div className="flex flex-col gap-2">
                {[["/terms", "TERMS OF SERVICE"], ["/privacy", "PRIVACY POLICY"]].map(([to, label]) => (
                  <Link key={to} to={to} className="text-[#666] text-sm uppercase tracking-widest hover:text-[#FFE500] transition-colors" style={{ fontWeight: 600 }}>{label}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
            <p className="text-[#555] text-xs uppercase tracking-widest" style={{ fontWeight: 600 }}>© 2026 DIKSYO. MAHAL NAMING PILIPINO.</p>
            <div className="flex items-center gap-2">
              <span className="text-[#333] text-xs uppercase tracking-widest" style={{ fontWeight: 600 }}>MADE WITH</span>
              <span className="text-[#FF6D00]">♥</span>
              <span className="text-[#333] text-xs uppercase tracking-widest" style={{ fontWeight: 600 }}>FOR THE FILIPINO LANGUAGE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
