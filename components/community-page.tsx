"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Flag,
  Share2,
  Plus,
  Flame,
  Clock,
  Star,
  Trophy,
  BadgeCheck,
  Shield,
  ChevronUp,
  ChevronDown,
  Crown,
  MapPin,
  BookOpen,
  Info,
  X,
  Hourglass,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════ */
/*  DUMMY DATA                                     */
/* ═══════════════════════════════════════════════ */

type FeedItem = {
  id: string;
  word: string;
  partOfSpeech: string;
  posEnglish: string;
  definition: string;
  exampleSentence: string;
  exampleTranslation: string;
  submittedBy: string;
  submittedAt: string;
  createdAt: number; // epoch ms for sorting
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isVerified: boolean;
  isPending: boolean;
  isAdmin: boolean;
  region: string | null;
  tags: string[];
  comments: { user: string; text: string; upvotes: number }[];
};

const DUMMY_FEED: FeedItem[] = [
  {
    id: "1",
    word: "LODI",
    partOfSpeech: "PANGNGALAN",
    posEnglish: "NOUN",
    definition: "An idol, or someone you look up to. Derived from spelling 'idol' backwards.",
    exampleSentence: "Lodi talaga kita! Ang galing mo kumanta!",
    exampleTranslation: "You're my idol! You're such an amazing singer!",
    submittedBy: "maria_santos",
    submittedAt: "2 hours ago",
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    upvotes: 847,
    downvotes: 12,
    commentCount: 34,
    isVerified: true,
    isPending: false,
    isAdmin: false,
    region: "Metro Manila",
    tags: ["slang", "modern"],
    comments: [
      { user: "juan_delcruz", text: "This is very common among millennials and Gen Z!", upvotes: 45 },
      { user: "ana_reyes", text: "We also use this in Cebu now haha", upvotes: 23 },
    ],
  },
  {
    id: "2",
    word: "ARAL",
    partOfSpeech: "PANGNGALAN",
    posEnglish: "NOUN",
    definition: "A lesson or a moral teaching. Also used as a verb root meaning 'to study'.",
    exampleSentence: "Mag-aral ka nang mabuti para sa pagsusulit.",
    exampleTranslation: "Study well for the exam.",
    submittedBy: "admin",
    submittedAt: "Official Entry",
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    upvotes: 1203,
    downvotes: 5,
    commentCount: 67,
    isVerified: true,
    isPending: false,
    isAdmin: true,
    region: null,
    tags: ["formal", "education"],
    comments: [
      { user: "teacher_carlo", text: "Root word for mag-aral, pag-aaral, mag-aaralan. Very productive root!", upvotes: 89 },
      { user: "linggo_learner", text: "One of the first words I learned. Essential!", upvotes: 34 },
    ],
  },
  {
    id: "3",
    word: "PETMALU",
    partOfSpeech: "PANG-URI",
    posEnglish: "ADJ",
    definition: "Something extreme, exceptional, or extraordinary. Comes from reversing 'malupet'.",
    exampleSentence: "Petmalu ang performance nila kagabi!",
    exampleTranslation: "Their performance last night was extraordinary!",
    submittedBy: "slang_master99",
    submittedAt: "5 hours ago",
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
    upvotes: 432,
    downvotes: 28,
    commentCount: 19,
    isVerified: false,
    isPending: true,
    isAdmin: false,
    region: "Metro Manila",
    tags: ["slang", "millennial"],
    comments: [
      { user: "word_nerd", text: "Classic example of Filipino backwards slang (baliktad)", upvotes: 31 },
    ],
  },
  {
    id: "4",
    word: "KILIG",
    partOfSpeech: "PANGNGALAN",
    posEnglish: "NOUN",
    definition: "The feeling of excitement, butterflies, or giddiness usually caused by romantic interactions.",
    exampleSentence: "Sobrang kilig ako sa sinabi niya!",
    exampleTranslation: "I felt so giddy with what he/she said!",
    submittedBy: "admin",
    submittedAt: "Official Entry",
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    upvotes: 2450,
    downvotes: 3,
    commentCount: 112,
    isVerified: true,
    isPending: false,
    isAdmin: true,
    region: null,
    tags: ["emotion", "untranslatable"],
    comments: [
      { user: "culture_ph", text: "One of the most famous untranslatable Filipino words! BBC even featured it.", upvotes: 156 },
      { user: "rom_com_fan", text: "No English word captures this feeling perfectly 🥰", upvotes: 78 },
    ],
  },
  {
    id: "5",
    word: "WERPA",
    partOfSpeech: "PANDAMDAM",
    posEnglish: "INTJ",
    definition: "An expression of encouragement meaning 'power!'. Derived from reversing 'power'.",
    exampleSentence: "Werpa sa lahat ng nagta-trabaho ngayong holiday!",
    exampleTranslation: "Power to everyone working this holiday!",
    submittedBy: "gen_z_pinoy",
    submittedAt: "1 day ago",
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    upvotes: 298,
    downvotes: 41,
    commentCount: 8,
    isVerified: false,
    isPending: true,
    isAdmin: false,
    region: "Nationwide",
    tags: ["slang", "modern", "Gen Z"],
    comments: [
      { user: "tita_mae", text: "I hear my students say this all the time! Finally I know what it means 😂", upvotes: 67 },
    ],
  },
  {
    id: "6",
    word: "GIGIL",
    partOfSpeech: "PANGNGALAN",
    posEnglish: "NOUN",
    definition: "The irresistible urge to squeeze or pinch something cute. Can also mean trembling with frustration.",
    exampleSentence: "Ang cute ng baby! Nakaka-gigil!",
    exampleTranslation: "The baby is so cute! I just want to squeeze!",
    submittedBy: "admin",
    submittedAt: "Official Entry",
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
    upvotes: 1876,
    downvotes: 7,
    commentCount: 89,
    isVerified: true,
    isPending: false,
    isAdmin: true,
    region: null,
    tags: ["emotion", "untranslatable"],
    comments: [
      { user: "psych_major", text: "There's actually a psychological term for this: 'cute aggression'! Same concept.", upvotes: 201 },
      { user: "lola_caring", text: "Every Filipino lola knows this feeling 😊", upvotes: 45 },
    ],
  },
  {
    id: "7",
    word: "CHAROT",
    partOfSpeech: "PANDAMDAM",
    posEnglish: "INTJ",
    definition: "A playful expression meaning 'just kidding' or 'I'm not serious'. Used to soften statements.",
    exampleSentence: "Pangit mo! Charot! Maganda ka naman!",
    exampleTranslation: "You're ugly! Just kidding! You're beautiful!",
    submittedBy: "manila_slangqueen",
    submittedAt: "30 minutes ago",
    createdAt: Date.now() - 30 * 60 * 1000,
    upvotes: 56,
    downvotes: 3,
    commentCount: 4,
    isVerified: false,
    isPending: true,
    isAdmin: false,
    region: "Metro Manila",
    tags: ["slang", "Gen Z", "humor"],
    comments: [
      { user: "comedy_fan", text: "Essential vocab for any Filipino conversation 😂", upvotes: 12 },
    ],
  },
  {
    id: "8",
    word: "BASTA",
    partOfSpeech: "PANGATNIG",
    posEnglish: "CONJ",
    definition: "A versatile filler word meaning 'just because', 'as long as', or 'anyway'. Often used to end a discussion.",
    exampleSentence: "Basta, mahal kita. Wala na 'yun.",
    exampleTranslation: "Just because, I love you. That's it.",
    submittedBy: "admin",
    submittedAt: "Official Entry",
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    upvotes: 3210,
    downvotes: 8,
    commentCount: 145,
    isVerified: true,
    isPending: false,
    isAdmin: true,
    region: null,
    tags: ["essential", "conversational"],
    comments: [
      { user: "linguist_ph", text: "This word drives translators crazy because there's no single English equivalent!", upvotes: 234 },
      { user: "expat_learner", text: "The ultimate Filipino mic drop word 🎤", upvotes: 89 },
    ],
  },
];

const DUMMY_LEADERBOARD = [
  { rank: 1, username: "slang_master99", verified: 14, color: "#FFD700" },
  { rank: 2, username: "maria_santos", verified: 11, color: "#C0C0C0" },
  { rank: 3, username: "gen_z_pinoy", verified: 8, color: "#CD7F32" },
  { rank: 4, username: "word_nerd", verified: 6, color: null },
  { rank: 5, username: "bisaya_pride", verified: 5, color: null },
];

const POS_COLORS: Record<string, { bg: string; text: string }> = {
  PANGNGALAN: { bg: "#7C3AED", text: "#fff" },
  PANDIWA: { bg: "#0057FF", text: "#fff" },
  "PANG-URI": { bg: "#FF6D00", text: "#fff" },
  "PANG-ABAY": { bg: "#00C853", text: "#fff" },
  PANGHALIP: { bg: "#FF007F", text: "#fff" },
  PANDAMDAM: { bg: "#FDE047", text: "#000" },
  PANGATNIG: { bg: "#8B5E3C", text: "#fff" },
};

type FilterType = "trending" | "newest" | "top";

/* ═══════════════════════════════════════════════ */
/*  SCROLL-ANIMATED CARD WRAPPER                   */
/* ═══════════════════════════════════════════════ */

function ScrollCard({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        delay: index < 3 ? index * 0.05 : 0,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════ */
/*  COMPONENT                                      */
/* ═══════════════════════════════════════════════ */

export function CommunityContent() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("trending");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [showRules, setShowRules] = useState(true);

  const comingSoonToast = () => {
    toast("🚧 Coming Soon!", {
      description: "Community features are being built. Stay tuned!",
      duration: 2500,
    });
  };

  const toggleComments = (id: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filters: { key: FilterType; label: string; icon: React.ElementType }[] = [
    { key: "trending", label: "TRENDING", icon: Flame },
    { key: "newest", label: "NEWEST", icon: Clock },
    { key: "top", label: "TOP RATED", icon: Star },
  ];

  /* ── Sorting Logic ── */
  const sortedFeed = useMemo(() => {
    const items = [...DUMMY_FEED];
    switch (activeFilter) {
      case "trending":
        // Trending = high engagement relative to recency (upvotes + comments weighted by age)
        return items.sort((a, b) => {
          const scoreA = (a.upvotes - a.downvotes + a.commentCount * 2) / Math.max(1, (Date.now() - a.createdAt) / (1000 * 60 * 60));
          const scoreB = (b.upvotes - b.downvotes + b.commentCount * 2) / Math.max(1, (Date.now() - b.createdAt) / (1000 * 60 * 60));
          return scoreB - scoreA;
        });
      case "newest":
        return items.sort((a, b) => b.createdAt - a.createdAt);
      case "top":
        return items.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      default:
        return items;
    }
  }, [activeFilter]);

  /* ── Group into Verified and Pending ── */
  const verifiedItems = sortedFeed.filter((item) => item.isVerified);
  const pendingItems = sortedFeed.filter((item) => item.isPending);

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#FF007F] border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0_#000]">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1
              className="text-black uppercase leading-none"
              style={{ fontWeight: 900, fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "-0.03em" }}
            >
              COMMUNITY
            </h1>
            <p className="text-[#888] text-xs uppercase tracking-widest" style={{ fontWeight: 700 }}>
              CROWDSOURCED TAGALOG DICTIONARY
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Layout: Feed + Sidebar ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ════════════════════════════ */}
        {/*  MAIN FEED                   */}
        {/* ════════════════════════════ */}
        <div className="flex-1 min-w-0">
          {/* ── Action Bar ── */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.05 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            {/* Submit Button */}
            <button
              onClick={comingSoonToast}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#FDE047] border-[3px] border-black text-black uppercase tracking-tighter shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
              style={{ fontWeight: 900, fontSize: "0.85rem" }}
            >
              <Plus className="w-5 h-5" />
              SUBMIT A WORD
            </button>

            {/* Filters */}
            <div className="flex gap-2 flex-1">
              {filters.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 border-[2.5px] border-black text-xs uppercase tracking-wider transition-all ${
                    activeFilter === key
                      ? "bg-black text-[#FDE047] shadow-none translate-x-[2px] translate-y-[2px]"
                      : "bg-white text-black shadow-[3px_3px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000]"
                  }`}
                  style={{ fontWeight: 800 }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Feed Sections ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="flex flex-col gap-8 relative"
            >
              {/* ── VERIFIED WORDS SECTION ── */}
              {verifiedItems.length > 0 && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#0057FF] border-[2px] border-black flex items-center justify-center shadow-[2px_2px_0_#000]">
                      <BadgeCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h2 className="text-black text-sm uppercase tracking-tight" style={{ fontWeight: 900 }}>
                      VERIFIED WORDS
                    </h2>
                    <span className="px-2 py-0.5 bg-[#0057FF] text-white border-[1.5px] border-black text-[9px] uppercase tracking-wider" style={{ fontWeight: 800 }}>
                      {verifiedItems.length}
                    </span>
                    <div className="flex-1 h-[2.5px] bg-black/10" />
                  </div>

                  {verifiedItems.map((item, idx) => (
                    <ScrollCard key={item.id} index={idx}>
                      <WordCard
                        item={item}
                        expandedComments={expandedComments}
                        toggleComments={toggleComments}
                        comingSoonToast={comingSoonToast}
                      />
                    </ScrollCard>
                  ))}
                </div>
              )}

              {/* ── PENDING APPROVAL SECTION ── */}
              {pendingItems.length > 0 && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#FF6D00] border-[2px] border-black flex items-center justify-center shadow-[2px_2px_0_#000]">
                      <Hourglass className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h2 className="text-black text-sm uppercase tracking-tight" style={{ fontWeight: 900 }}>
                      PENDING APPROVAL
                    </h2>
                    <span className="px-2 py-0.5 bg-[#FF6D00] text-white border-[1.5px] border-black text-[9px] uppercase tracking-wider" style={{ fontWeight: 800 }}>
                      {pendingItems.length}
                    </span>
                    <div className="flex-1 h-[2.5px] bg-black/10" />
                  </div>

                  {pendingItems.map((item, idx) => (
                    <ScrollCard key={item.id} index={idx}>
                      <WordCard
                        item={item}
                        expandedComments={expandedComments}
                        toggleComments={toggleComments}
                        comingSoonToast={comingSoonToast}
                      />
                    </ScrollCard>
                  ))}
                </div>
              )}

              {/* ── "Coming Soon" Overlay ── */}
              <div className="sticky bottom-4 z-20 flex justify-center pointer-events-none">
                <motion.div
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 500, damping: 30 }}
                  className="pointer-events-auto"
                >
                  <div className="bg-[#FDE047] border-[3px] border-black shadow-[6px_6px_0_#000] px-6 py-3 flex items-center gap-3">
                    <span className="text-2xl">🚧</span>
                    <div>
                      <p className="text-black text-sm uppercase tracking-tight" style={{ fontWeight: 900 }}>
                        COMMUNITY FEATURES COMING SOON
                      </p>
                      <p className="text-black/60 text-[10px] uppercase tracking-widest" style={{ fontWeight: 700 }}>
                        VOTING · COMMENTS · SUBMISSIONS — ALL IN DEVELOPMENT
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ════════════════════════════ */}
        {/*  SIDEBAR                     */}
        {/* ════════════════════════════ */}
        <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-5">
          {/* ── Rules / How It Works ── */}
          <AnimatePresence>
            {showRules && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#E8F0FF] border-[3px] border-black shadow-[4px_4px_0_#000]"
              >
                <div className="flex items-center justify-between px-4 py-2.5 border-b-[2.5px] border-black bg-[#0057FF]">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-white" />
                    <span className="text-white text-xs uppercase tracking-wider" style={{ fontWeight: 900 }}>
                      HOW IT WORKS
                    </span>
                  </div>
                  <button
                    onClick={() => setShowRules(false)}
                    className="w-5 h-5 bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div className="px-4 py-3 flex flex-col gap-2.5">
                  {[
                    { emoji: "📝", text: "Submit new Tagalog words, slang, or definitions" },
                    { emoji: "👍", text: "Upvote accurate and helpful definitions" },
                    { emoji: "👎", text: "Downvote inaccurate or misleading entries" },
                    { emoji: "💬", text: "Add context, usage tips, or corrections via comments" },
                    { emoji: "✅", text: "Words with enough upvotes earn a Verified badge" },
                    { emoji: "🚫", text: "Report spam or inappropriate content" },
                  ].map(({ emoji, text }, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-sm shrink-0">{emoji}</span>
                      <p className="text-[11px] text-[#333] leading-relaxed" style={{ fontWeight: 600 }}>
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Leaderboard ── */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.1 }}
            className="bg-white border-[3px] border-black shadow-[4px_4px_0_#000]"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 border-b-[2.5px] border-black bg-[#FDE047]">
              <Trophy className="w-4 h-4 text-black" />
              <span className="text-black text-xs uppercase tracking-wider" style={{ fontWeight: 900 }}>
                TOP CONTRIBUTORS
              </span>
            </div>
            <div className="px-4 py-3 flex flex-col gap-2">
              {DUMMY_LEADERBOARD.map((user) => (
                <div
                  key={user.rank}
                  className={`flex items-center gap-2.5 p-2 border-[2px] transition-all ${
                    user.rank <= 3 ? "border-black bg-[#FFFBF0]" : "border-black/15 bg-white"
                  }`}
                >
                  {/* Rank */}
                  <div
                    className={`w-6 h-6 flex items-center justify-center text-[10px] border-[1.5px] border-black shrink-0 ${
                      user.rank === 1 ? "bg-[#FFD700]" : user.rank === 2 ? "bg-[#C0C0C0]" : user.rank === 3 ? "bg-[#CD7F32] text-white" : "bg-white"
                    }`}
                    style={{ fontWeight: 900 }}
                  >
                    {user.rank <= 3 ? <Crown className="w-3 h-3" /> : user.rank}
                  </div>
                  {/* Username */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-tight text-black truncate" style={{ fontWeight: 800 }}>
                      @{user.username}
                    </p>
                  </div>
                  {/* Verified Count */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <BadgeCheck className="w-3 h-3 text-[#0057FF]" />
                    <span className="text-[10px] text-[#0057FF]" style={{ fontWeight: 800 }}>
                      {user.verified}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Submit CTA ── */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.15 }}
            className="bg-[#7C3AED] border-[3px] border-black shadow-[4px_4px_0_#000] p-5 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 bg-[#FDE047] border-[2.5px] border-black rounded-full flex items-center justify-center shadow-[3px_3px_0_#000] mb-3">
              <Plus className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-white uppercase mb-1" style={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.02em" }}>
              KNOW A WORD?
            </h3>
            <p className="text-white/70 text-[10px] uppercase tracking-widest mb-4" style={{ fontWeight: 600 }}>
              HELP US BUILD THE MOST COMPLETE TAGALOG DICTIONARY
            </p>
            <button
              onClick={comingSoonToast}
              className="w-full bg-[#FDE047] border-[2.5px] border-black py-2.5 text-black text-xs uppercase tracking-widest shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
              style={{ fontWeight: 900 }}
            >
              SUBMIT A WORD
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/*  WORD CARD COMPONENT                            */
/* ═══════════════════════════════════════════════ */

function WordCard({
  item,
  expandedComments,
  toggleComments,
  comingSoonToast,
}: {
  item: FeedItem;
  expandedComments: Set<string>;
  toggleComments: (id: string) => void;
  comingSoonToast: () => void;
}) {
  const ps = POS_COLORS[item.partOfSpeech] || { bg: "#333", text: "#fff" };
  const isExpanded = expandedComments.has(item.id);
  const netVotes = item.upvotes - item.downvotes;

  return (
    <div className="bg-white border-[3px] border-black shadow-[5px_5px_0_#000]">
      {/* ── Card Header ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b-[2.5px] border-black bg-[#FAFAF8]">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div
            className={`w-7 h-7 rounded-full border-[2px] border-black flex items-center justify-center text-[10px] ${
              item.isAdmin ? "bg-[#FFD700]" : "bg-[#E8F0FF]"
            }`}
            style={{ fontWeight: 900 }}
          >
            {item.isAdmin ? (
              <Shield className="w-3.5 h-3.5 text-black" />
            ) : (
              item.submittedBy.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs uppercase tracking-tight text-black" style={{ fontWeight: 800 }}>
              {item.isAdmin ? "DIKSYO ADMIN" : `@${item.submittedBy}`}
            </span>
            {item.isAdmin && (
              <span className="px-1.5 py-0.5 bg-[#FFD700] border-[1.5px] border-black text-[8px] uppercase tracking-wider" style={{ fontWeight: 900 }}>
                OFFICIAL
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] text-[#999] uppercase tracking-wider" style={{ fontWeight: 700 }}>
          {item.submittedAt}
        </span>
      </div>

      {/* ── Card Body ── */}
      <div className="p-4">
        {/* Word + Badges */}
        <div className="flex items-center flex-wrap gap-2 mb-2">
          <h3
            className="text-black uppercase"
            style={{ fontWeight: 900, fontSize: "1.6rem", lineHeight: 1, letterSpacing: "-0.02em" }}
          >
            {item.word}
          </h3>

          {/* POS Badge */}
          <span
            className="px-2 py-0.5 border-[1.5px] border-black text-[9px] uppercase tracking-wider"
            style={{ fontWeight: 800, background: ps.bg, color: ps.text }}
          >
            {item.posEnglish}
          </span>

          {/* Verified Badge */}
          {item.isVerified && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-[#0057FF] text-white border-[1.5px] border-black text-[9px] uppercase tracking-wider" style={{ fontWeight: 800 }}>
              <BadgeCheck className="w-3 h-3" />
              VERIFIED
            </span>
          )}

          {/* Pending Badge */}
          {item.isPending && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-[#FF6D00] text-white border-[1.5px] border-black text-[9px] uppercase tracking-wider" style={{ fontWeight: 800 }}>
              <Hourglass className="w-3 h-3" />
              PENDING
            </span>
          )}

          {/* Region Badge */}
          {item.region && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-[#E8F0FF] text-[#0057FF] border-[1.5px] border-[#0057FF]/30 text-[9px] uppercase tracking-wider" style={{ fontWeight: 700 }}>
              <MapPin className="w-2.5 h-2.5" />
              {item.region}
            </span>
          )}
        </div>

        {/* Definition */}
        <p className="text-[#333] text-sm leading-relaxed mb-3" style={{ fontWeight: 600 }}>
          {item.definition}
        </p>

        {/* Example Sentence */}
        <div className="bg-[#FFFBF0] border-[2px] border-black/15 p-3 mb-4">
          <p className="text-black text-sm mb-1" style={{ fontWeight: 700 }}>
            🇵🇭 <span className="italic">&ldquo;{item.exampleSentence}&rdquo;</span>
          </p>
          <p className="text-[#666] text-xs" style={{ fontWeight: 500 }}>
            🇺🇸 &ldquo;{item.exampleTranslation}&rdquo;
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-[#f4f1ea] border-[1.5px] border-black/20 text-[9px] uppercase tracking-wider text-[#666]"
              style={{ fontWeight: 700 }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* ── Action Bar ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Upvote/Downvote Block */}
          <div className="flex items-center border-[2.5px] border-black">
            <button
              onClick={comingSoonToast}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#00C853] hover:text-white transition-colors border-r-[2.5px] border-black group"
            >
              <ChevronUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs" style={{ fontWeight: 800 }}>{item.upvotes.toLocaleString()}</span>
            </button>
            <div className="px-2.5 py-1.5 bg-black text-[#FDE047] text-xs" style={{ fontWeight: 900 }}>
              {netVotes.toLocaleString()}
            </div>
            <button
              onClick={comingSoonToast}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#FF3D00] hover:text-white transition-colors border-l-[2.5px] border-black group"
            >
              <ChevronDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs" style={{ fontWeight: 800 }}>{item.downvotes}</span>
            </button>
          </div>

          {/* Comments Button */}
          <button
            onClick={() => toggleComments(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-[2.5px] border-black text-xs uppercase tracking-wider transition-all ${
              isExpanded
                ? "bg-[#7C3AED] text-white shadow-none translate-x-[1px] translate-y-[1px]"
                : "bg-white text-black shadow-[2px_2px_0_#000] hover:bg-[#7C3AED] hover:text-white"
            }`}
            style={{ fontWeight: 800 }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {item.commentCount}
          </button>

          {/* Report */}
          <button
            onClick={comingSoonToast}
            className="flex items-center justify-center w-8 h-8 border-[2px] border-black bg-white hover:bg-[#FF3D00] hover:text-white hover:border-[#FF3D00] transition-colors shadow-[2px_2px_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
            title="Report"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>

          {/* Share */}
          <button
            onClick={comingSoonToast}
            className="flex items-center justify-center w-8 h-8 border-[2px] border-black bg-white hover:bg-[#0057FF] hover:text-white hover:border-[#0057FF] transition-colors shadow-[2px_2px_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Inline Preview Comments (Facebook-style) ── */}
      {item.comments.length > 0 && !isExpanded && (
        <div className="border-t-[2.5px] border-black bg-[#FAFAF8] px-4 py-3">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full border-[1.5px] border-black bg-[#E8F0FF] flex items-center justify-center text-[8px] shrink-0 mt-0.5" style={{ fontWeight: 900 }}>
              {item.comments[0].user.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-tight text-black" style={{ fontWeight: 800 }}>
                @{item.comments[0].user}
              </span>
              <p className="text-xs text-[#555] leading-relaxed" style={{ fontWeight: 500 }}>
                {item.comments[0].text}
              </p>
            </div>
            <span className="text-[9px] text-[#aaa] shrink-0 ml-auto flex items-center gap-0.5" style={{ fontWeight: 700 }}>
              <ThumbsUp className="w-2.5 h-2.5" /> {item.comments[0].upvotes}
            </span>
          </div>
          {item.commentCount > 1 && (
            <button
              onClick={() => toggleComments(item.id)}
              className="mt-2 text-[10px] uppercase tracking-widest text-[#7C3AED] hover:text-black transition-colors"
              style={{ fontWeight: 800 }}
            >
              View all {item.commentCount} comments →
            </button>
          )}
        </div>
      )}

      {/* ── Expanded Comments Thread ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="border-t-[2.5px] border-black bg-[#FAFAF8]">
              {/* Comment thread */}
              <div className="px-4 py-3 flex flex-col gap-3">
                {item.comments.map((comment, ci) => (
                  <div key={ci} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full border-[1.5px] border-black bg-[#E8F0FF] flex items-center justify-center text-[9px] shrink-0 mt-0.5" style={{ fontWeight: 900 }}>
                      {comment.user.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase tracking-tight text-black" style={{ fontWeight: 800 }}>
                        @{comment.user}
                      </span>
                      <p className="text-xs text-[#555] leading-relaxed" style={{ fontWeight: 500 }}>
                        {comment.text}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={comingSoonToast} className="text-[#ccc] hover:text-[#00C853] transition-colors">
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <span className="text-[9px] text-[#aaa]" style={{ fontWeight: 700 }}>{comment.upvotes}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add comment input */}
              <div className="px-4 pb-3">
                <div
                  onClick={comingSoonToast}
                  className="flex items-center gap-2 px-3 py-2 border-[2px] border-black/20 bg-white cursor-pointer hover:border-black transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#ccc]" />
                  <span className="text-xs text-[#aaa] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Add a comment...
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
