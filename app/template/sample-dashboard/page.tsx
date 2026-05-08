"use client";

import { useState } from "react";
import {
  Flame,
  Star,
  TrendingUp,
  Zap,
  BookOpen,
  Target,
  Award,
  Tag,
  BookMarked,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// ─── Mock data ───────────────────────────────────────────────────────────────
const WEEKLY_WORDS = [
  { day: "MON", words: 12 },
  { day: "TUE", words: 8 },
  { day: "WED", words: 20 },
  { day: "THU", words: 15 },
  { day: "FRI", words: 5 },
  { day: "SAT", words: 22 },
  { day: "SUN", words: 18 },
];

const ACCURACY_TREND = [
  { week: "W1", accuracy: 58 },
  { week: "W2", accuracy: 64 },
  { week: "W3", accuracy: 70 },
  { week: "W4", accuracy: 72 },
  { week: "W5", accuracy: 78 },
  { week: "W6", accuracy: 82 },
];

const LEVELS = [
  { name: "BAGUHAN", minXP: 0, color: "#aaa" },
  { name: "MAG-AARAL", minXP: 100, color: "#00C853" },
  { name: "BATIKAN", minXP: 300, color: "#0057FF" },
  { name: "GURO", minXP: 600, color: "#7C3AED" },
  { name: "LAKAN", minXP: 1000, color: "#FFE500" },
];

const CURRENT_XP = 450;
const CURRENT_LEVEL = LEVELS[2]; // BATIKAN
const NEXT_LEVEL = LEVELS[3]; // GURO
const XP_PROGRESS = ((CURRENT_XP - 300) / (600 - 300)) * 100;

const STREAK_DAYS = [true, true, true, false, true, true, true, true, false, true, true, true];
const TODAY_INDEX = 11;

const VAULT_WORDS = [
  { id: 1, word: "Pagmamahal", definition: "Love / Deep affection", tags: ["DAMDAMIN", "RELASYON"], pos: "PANGNGALAN", posColor: "#7C3AED", saved: "2 days ago" },
  { id: 2, word: "Kalayaan", definition: "Freedom / Liberty", tags: ["BANSA", "KASAYSAYAN"], pos: "PANGNGALAN", posColor: "#7C3AED", saved: "3 days ago" },
  { id: 3, word: "Maganda", definition: "Beautiful / Pretty", tags: ["KATANGIAN"], pos: "PANG-URI", posColor: "#0057FF", saved: "1 week ago" },
  { id: 4, word: "Kalikasan", definition: "Nature / Environment", tags: ["KAPALIGIRAN"], pos: "PANGNGALAN", posColor: "#7C3AED", saved: "1 week ago" },
  { id: 5, word: "Matatag", definition: "Strong / Resilient", tags: ["KATANGIAN", "KARAKTER"], pos: "PANG-URI", posColor: "#0057FF", saved: "2 weeks ago" },
  { id: 6, word: "Umibig", definition: "To fall in love", tags: ["DAMDAMIN", "KILOS"], pos: "PANDIWA", posColor: "#FF6D00", saved: "2 weeks ago" },
];

const ALL_TAGS = ["ALL", "DAMDAMIN", "RELASYON", "BANSA", "KASAYSAYAN", "KATANGIAN", "KAPALIGIRAN", "KARAKTER", "KILOS"];

const ACHIEVEMENTS = [
  { icon: "🔥", title: "FIRST FLAME", desc: "3-day streak", unlocked: true },
  { icon: "📚", title: "WORD HOG", desc: "Learned 100 words", unlocked: true },
  { icon: "⚡", title: "SPEED DEMON", desc: "Quiz in under 30s", unlocked: true },
  { icon: "🏆", title: "PERFECT SCORE", desc: "100% accuracy quiz", unlocked: false },
  { icon: "👑", title: "LAKAN", desc: "Reach max level", unlocked: false },
  { icon: "📖", title: "BOOKWORM", desc: "Learn 500 words", unlocked: false },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="bg-black border-[2px] border-[#FFE500] px-3 py-2"
        style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}
      >
        <p className="text-[#FFE500] text-xs uppercase tracking-wider" style={{ fontWeight: 800 }}>
          {label}
        </p>
        <p className="text-white text-sm" style={{ fontWeight: 900 }}>
          {payload[0].value}
          {payload[0].name === "accuracy" ? "%" : " words"}
        </p>
      </div>
    );
  }
  return null;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "vault">("overview");
  const [activeTag, setActiveTag] = useState("ALL");
  const [vaultSearch, setVaultSearch] = useState("");

  const filteredVault = VAULT_WORDS.filter((w) => {
    const matchTag = activeTag === "ALL" || w.tags.includes(activeTag);
    const matchSearch =
      w.word.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      w.definition.toLowerCase().includes(vaultSearch.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <div style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-[#888] text-xs uppercase tracking-widest mb-1" style={{ fontWeight: 700 }}>
            MAGANDANG UMAGA · GOOD MORNING
          </p>
          <h1
            className="uppercase tracking-tight text-black"
            style={{ fontWeight: 900, fontSize: "2rem", lineHeight: 1.1 }}
          >
            JUAN DELA CRUZ
          </h1>
        </div>
        <div className="flex gap-3">
          <div className="bg-[#FF6D00] border-[2.5px] border-black shadow-[3px_3px_0_#000] px-4 py-2.5 flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FFE500]" fill="#FFE500" />
            <div>
              <p className="text-white text-xs uppercase tracking-widest" style={{ fontWeight: 700 }}>
                STREAK
              </p>
              <p className="text-[#FFE500]" style={{ fontWeight: 900, fontSize: "1.2rem" }}>
                12 DAYS
              </p>
            </div>
          </div>
          <div className="bg-black border-[2.5px] border-black shadow-[3px_3px_0_#FFE500] px-4 py-2.5 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#FFE500]" fill="#FFE500" />
            <div>
              <p className="text-[#888] text-xs uppercase tracking-widest" style={{ fontWeight: 700 }}>
                TOTAL XP
              </p>
              <p className="text-[#FFE500]" style={{ fontWeight: 900, fontSize: "1.2rem" }}>
                450 XP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-8 border-[3px] border-black inline-flex w-fit">
        {(["overview", "vault"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 uppercase tracking-widest text-sm transition-colors ${
              activeTab === tab ? "bg-black text-[#FFE500]" : "bg-white text-black hover:bg-[#f5f5f5]"
            }`}
            style={{ fontWeight: 900 }}
          >
            {tab === "overview" ? "📊 OVERVIEW" : "🗃️ VOCABULARY VAULT"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* Level Progress Card */}
          <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-5 h-5 text-[#7C3AED]" />
              <span className="text-sm uppercase tracking-widest text-black" style={{ fontWeight: 900 }}>
                LEVEL PROGRESSION
              </span>
            </div>

            {/* Levels row */}
            <div className="flex items-center gap-0 mb-6 overflow-x-auto">
              {LEVELS.map((lvl, i) => {
                const isCurrent = lvl.name === CURRENT_LEVEL.name;
                const isUnlocked = CURRENT_XP >= lvl.minXP;
                return (
                  <div key={lvl.name} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-12 h-12 border-[2.5px] border-black flex items-center justify-center text-lg relative"
                        style={{ background: isUnlocked ? lvl.color : "#eee" }}
                      >
                        {isCurrent && (
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#FF6D00] border-[1.5px] border-black" />
                        )}
                        {isUnlocked ? (
                          <span style={{ fontWeight: 900, fontSize: "0.65rem", color: lvl.color === "#FFE500" ? "#000" : "#fff" }}>
                            {lvl.name.slice(0, 3)}
                          </span>
                        ) : (
                          <span className="text-[#bbb]">🔒</span>
                        )}
                      </div>
                      <span
                        className="text-[8px] uppercase tracking-wider whitespace-nowrap"
                        style={{ fontWeight: 800, color: isCurrent ? "#000" : "#aaa" }}
                      >
                        {lvl.name}
                      </span>
                      <span
                        className="text-[8px] uppercase tracking-wider"
                        style={{ fontWeight: 600, color: "#aaa" }}
                      >
                        {lvl.minXP}XP
                      </span>
                    </div>
                    {i < LEVELS.length - 1 && (
                      <div
                        className="w-10 h-[3px] mx-1"
                        style={{ background: CURRENT_XP >= LEVELS[i + 1].minXP ? "#000" : "#ddd" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* XP Bar */}
            <div className="bg-[#FFFBF0] border-[2px] border-black p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span
                    className="text-black uppercase tracking-tight"
                    style={{ fontWeight: 900, fontSize: "1.2rem" }}
                  >
                    {CURRENT_LEVEL.name}
                  </span>
                  <span className="text-[#888] text-xs ml-2 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    → {NEXT_LEVEL.name}
                  </span>
                </div>
                <span className="text-black text-sm" style={{ fontWeight: 800 }}>
                  {CURRENT_XP} / {NEXT_LEVEL.minXP} XP
                </span>
              </div>
              <div className="h-5 bg-white border-[2px] border-black">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${XP_PROGRESS}%`, background: CURRENT_LEVEL.color }}
                />
              </div>
              <p className="text-[#888] text-xs mt-2 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                {NEXT_LEVEL.minXP - CURRENT_XP} XP MORE TO REACH {NEXT_LEVEL.name}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, label: "WORDS LEARNED", value: "234", unit: "WORDS", color: "#0057FF", textColor: "#fff" },
              { icon: Target, label: "ACCURACY", value: "78%", unit: "RATE", color: "#00C853", textColor: "#000" },
              { icon: Zap, label: "QUIZZES DONE", value: "47", unit: "TOTAL", color: "#7C3AED", textColor: "#fff" },
              { icon: TrendingUp, label: "BEST STREAK", value: "18", unit: "DAYS", color: "#FF6D00", textColor: "#fff" },
            ].map(({ icon: Icon, label, value, unit, color, textColor }) => (
              <div
                key={label}
                className="border-[2.5px] border-black shadow-[4px_4px_0_#000] p-5"
                style={{ background: color }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4" style={{ color: textColor }} />
                  <span
                    className="text-[10px] uppercase tracking-widest"
                    style={{ fontWeight: 800, color: textColor + "cc" }}
                  >
                    {label}
                  </span>
                </div>
                <div style={{ fontWeight: 900, fontSize: "2rem", color: textColor, lineHeight: 1 }}>
                  {value}
                </div>
                <div
                  className="text-[10px] uppercase tracking-widest mt-1"
                  style={{ fontWeight: 700, color: textColor + "99" }}
                >
                  {unit}
                </div>
              </div>
            ))}
          </div>

          {/* Streak Calendar */}
          <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Flame className="w-5 h-5 text-[#FF6D00]" fill="#FF6D00" />
              <span className="text-sm uppercase tracking-widest text-black" style={{ fontWeight: 900 }}>
                DAILY STREAK TRACKER
              </span>
              <div className="ml-auto bg-[#FF6D00] border-[2px] border-black px-3 py-1">
                <span className="text-white text-xs uppercase tracking-widest" style={{ fontWeight: 900 }}>
                  🔥 12 DAYS
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {STREAK_DAYS.map((active, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-10 h-10 border-[2px] border-black flex items-center justify-center text-sm ${
                      i === TODAY_INDEX
                        ? "bg-[#FFE500]"
                        : active
                        ? "bg-[#FF6D00]"
                        : "bg-[#f0f0f0]"
                    }`}
                  >
                    {i === TODAY_INDEX ? (
                      <Flame className="w-4 h-4 text-black" fill="black" />
                    ) : active ? (
                      <Flame className="w-4 h-4 text-white" fill="white" />
                    ) : (
                      <span className="text-[#ccc]">—</span>
                    )}
                  </div>
                  <span className="text-[8px] text-[#aaa]" style={{ fontWeight: 600 }}>
                    D{i + 1}
                  </span>
                </div>
              ))}
              {/* Empty future days */}
              {[...Array(6)].map((_, i) => (
                <div key={`empty-${i}`} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 border-[2px] border-dashed border-[#ddd] flex items-center justify-center">
                    <span className="text-[#eee]">·</span>
                  </div>
                  <span className="text-[8px] text-[#eee]" style={{ fontWeight: 600 }}>
                    D{STREAK_DAYS.length + i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Words per day bar chart */}
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-6">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-4 h-4 text-[#0057FF]" />
                <span className="text-sm uppercase tracking-widest text-black" style={{ fontWeight: 900 }}>
                  WORDS LEARNED THIS WEEK
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={WEEKLY_WORDS} barSize={28}>
                  <CartesianGrid strokeDasharray="0" stroke="#eee" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontWeight: 800, fontSize: 10, fill: "#000", fontFamily: "Inter, sans-serif" }}
                    axisLine={{ stroke: "#000", strokeWidth: 2 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontWeight: 700, fontSize: 10, fill: "#888", fontFamily: "Inter, sans-serif" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#FFE500", opacity: 0.3 }} />
                  <Bar
                    dataKey="words"
                    fill="#0057FF"
                    stroke="#000"
                    strokeWidth={2}
                    radius={0}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Accuracy trend line chart */}
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-4 h-4 text-[#00C853]" />
                <span className="text-sm uppercase tracking-widest text-black" style={{ fontWeight: 900 }}>
                  ACCURACY TREND
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={ACCURACY_TREND}>
                  <defs>
                    <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C853" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00C853" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" stroke="#eee" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontWeight: 800, fontSize: 10, fill: "#000", fontFamily: "Inter, sans-serif" }}
                    axisLine={{ stroke: "#000", strokeWidth: 2 }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[50, 100]}
                    tick={{ fontWeight: 700, fontSize: 10, fill: "#888", fontFamily: "Inter, sans-serif" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#00C853"
                    strokeWidth={3}
                    fill="url(#accuracyGrad)"
                    dot={{ r: 5, fill: "#fff", stroke: "#000", strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: "#FFE500", stroke: "#000", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-5 h-5 text-[#FFE500]" />
              <span className="text-sm uppercase tracking-widest text-black" style={{ fontWeight: 900 }}>
                ACHIEVEMENTS
              </span>
              <span className="ml-auto text-xs text-[#888] uppercase tracking-widest" style={{ fontWeight: 700 }}>
                3 / 6 UNLOCKED
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.title}
                  className={`border-[2.5px] border-black p-4 flex flex-col items-center text-center gap-2 ${
                    ach.unlocked ? "bg-[#FFFBF0] shadow-[3px_3px_0_#000]" : "bg-[#f5f5f5] opacity-50"
                  }`}
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <span
                    className="text-[10px] uppercase tracking-wider text-black"
                    style={{ fontWeight: 900 }}
                  >
                    {ach.title}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#888]" style={{ fontWeight: 600 }}>
                    {ach.desc}
                  </span>
                  {ach.unlocked && (
                    <div className="w-4 h-4 bg-[#00C853] border-[1.5px] border-black flex items-center justify-center">
                      <span className="text-white" style={{ fontSize: "8px" }}>✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "vault" && (
        <div className="flex flex-col gap-5">
          {/* Vault Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <BookMarked className="w-5 h-5 text-[#7C3AED]" />
                <h2 className="uppercase tracking-tight text-black" style={{ fontWeight: 900, fontSize: "1.4rem" }}>
                  PERSONAL VOCABULARY VAULT
                </h2>
              </div>
              <p className="text-[#888] text-xs uppercase tracking-widest" style={{ fontWeight: 600 }}>
                {VAULT_WORDS.length} WORDS SAVED · ORGANIZED BY TAGS
              </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-3 bg-[#7C3AED] text-white border-[2.5px] border-black shadow-[4px_4px_0_#000] uppercase tracking-widest text-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all hover:bg-[#6d28d9]" style={{ fontWeight: 900 }}>
              <Plus className="w-4 h-4" />
              ADD WORD
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" />
            <input
              type="text"
              value={vaultSearch}
              onChange={(e) => setVaultSearch(e.target.value)}
              placeholder="SEARCH YOUR VAULT..."
              className="w-full pl-11 pr-4 py-3 bg-white border-[2.5px] border-black outline-none focus:shadow-[4px_4px_0_#000] transition-shadow uppercase text-sm"
              style={{ fontWeight: 700 }}
            />
          </div>

          {/* Tags filter */}
          <div className="flex gap-2 flex-wrap">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border-[2px] border-black text-xs uppercase tracking-widest transition-all ${
                  activeTag === tag
                    ? "bg-[#7C3AED] text-white shadow-[2px_2px_0_#000]"
                    : "bg-white text-black hover:bg-[#f0f0f0]"
                }`}
                style={{ fontWeight: 800 }}
              >
                {tag !== "ALL" && <Tag className="w-3 h-3" />}
                {tag}
              </button>
            ))}
          </div>

          {/* Word grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVault.map((w) => (
              <div
                key={w.id}
                className="bg-white border-[2.5px] border-black shadow-[4px_4px_0_#000] p-5 flex flex-col gap-3 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#000] transition-all cursor-pointer"
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="text-black uppercase"
                      style={{ fontWeight: 900, fontSize: "1.3rem", lineHeight: 1.2 }}
                    >
                      {w.word}
                    </span>
                    <p
                      className="text-[#666] text-xs uppercase tracking-wider mt-1"
                      style={{ fontWeight: 600 }}
                    >
                      {w.definition}
                    </p>
                  </div>
                  <span
                    className="text-white text-[9px] uppercase tracking-wider px-2 py-1 border-[1.5px] border-black shrink-0"
                    style={{ fontWeight: 800, background: w.posColor }}
                  >
                    {w.pos.slice(0, 4)}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-[2px] bg-black" />

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {w.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-0.5 bg-[#FFFBF0] border-[1.5px] border-black text-[9px] uppercase tracking-wider"
                      style={{ fontWeight: 800 }}
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t-[1.5px] border-[#eee]">
                  <span className="text-[10px] text-[#aaa] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    SAVED {w.saved}
                  </span>
                  <button className="flex items-center gap-1 text-[10px] text-black uppercase tracking-wider hover:text-[#7C3AED] transition-colors" style={{ fontWeight: 800 }}>
                    STUDY <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add new card */}
            <div className="border-[2.5px] border-dashed border-[#ccc] p-5 flex flex-col items-center justify-center gap-3 text-[#ccc] hover:border-black hover:text-black transition-all cursor-pointer min-h-[160px]">
              <Plus className="w-8 h-8" />
              <span className="text-xs uppercase tracking-widest" style={{ fontWeight: 800 }}>
                ADD NEW WORD
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}