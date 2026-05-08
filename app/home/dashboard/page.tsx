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
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const TABS = ["OVERVIEW", "ANALYTICS", "ACHIEVEMENTS"];

  return (
    <div style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
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

      {/* Tabs - Segmented Control */}
      <div className="inline-flex max-w-full overflow-x-auto border-[3px] border-black shadow-[5px_5px_0_#000] bg-white mb-10">
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-8 py-3.5 uppercase tracking-widest text-[13px] transition-colors transition-transform focus:outline-none ${
                isActive
                  ? "bg-[#FFE500] text-black font-black"
                  : "bg-white text-[#555] font-bold hover:bg-yellow-100 hover:text-black"
              } ${index !== 0 ? "border-l-[3px] border-black" : ""}`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-6">
        
        {/* ===================== OVERVIEW TAB ===================== */}
        {activeTab === "OVERVIEW" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left Column: Level Progress */}
            <div className="xl:col-span-2">
              <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-6 h-full flex flex-col justify-center">
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
            </div>
            
            {/* Right Column: Streak & Stats Summary */}
            <div className="flex flex-col gap-6">
              {/* Streak Calendar Mini */}
              <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-6 flex-grow flex flex-col">
                <div className="flex items-center gap-2 mb-5">
                  <Flame className="w-5 h-5 text-[#FF6D00]" fill="#FF6D00" />
                  <span className="text-sm uppercase tracking-widest text-black" style={{ fontWeight: 900 }}>
                    DAILY STREAK
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 flex-grow">
                  {STREAK_DAYS.map((active, i) => (
                    <div key={i} className="flex flex-col items-center justify-center">
                      <div className={`w-full aspect-square border-[2px] border-black flex items-center justify-center text-sm ${
                          i === TODAY_INDEX ? "bg-[#FFE500]" : active ? "bg-[#FF6D00]" : "bg-[#f0f0f0]"
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
                    </div>
                  ))}
                  {[...Array(4)].map((_, i) => (
                    <div key={`empty-${i}`} className="flex flex-col items-center justify-center">
                      <div className="w-full aspect-square border-[2px] border-dashed border-[#ddd] flex items-center justify-center">
                        <span className="text-[#eee]">·</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini Stats Row (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: BookOpen, label: "WORDS", value: "234", color: "#0057FF", textColor: "#fff" },
                  { icon: Target, label: "ACCURACY", value: "78%", color: "#00C853", textColor: "#000" },
                  { icon: Zap, label: "QUIZZES", value: "47", color: "#7C3AED", textColor: "#fff" },
                  { icon: TrendingUp, label: "STREAK", value: "18", color: "#FF6D00", textColor: "#fff" },
                ].map(({ icon: Icon, label, value, color, textColor }) => (
                  <div key={label} className="border-[2.5px] border-black shadow-[4px_4px_0_#000] p-4 flex flex-col justify-center" style={{ background: color }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" style={{ color: textColor }} />
                      <span className="text-[9px] uppercase tracking-widest" style={{ fontWeight: 800, color: textColor + "cc" }}>
                        {label}
                      </span>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: "1.5rem", color: textColor, lineHeight: 1 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== ANALYTICS TAB ===================== */}
        {activeTab === "ANALYTICS" && (
          <div className="flex flex-col gap-6">
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
            
            {/* Full Length Stats Row for deep dive */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              {[
                { icon: BookOpen, label: "TOTAL WORDS LEARNED", value: "234", unit: "WORDS", color: "#0057FF", textColor: "#fff" },
                { icon: Target, label: "LIFETIME ACCURACY", value: "78%", unit: "RATE", color: "#00C853", textColor: "#000" },
                { icon: Zap, label: "TOTAL QUIZZES COMPLETED", value: "47", unit: "TOTAL", color: "#7C3AED", textColor: "#fff" },
                { icon: TrendingUp, label: "ALL-TIME BEST STREAK", value: "18", unit: "DAYS", color: "#FF6D00", textColor: "#fff" },
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
          </div>
        )}

        {/* ===================== ACHIEVEMENTS TAB ===================== */}
        {activeTab === "ACHIEVEMENTS" && (
          <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-5 h-5 text-[#FFE500]" />
              <span className="text-sm uppercase tracking-widest text-black" style={{ fontWeight: 900 }}>
                YOUR UNLOCKED ACHIEVEMENTS
              </span>
              <span className="ml-auto text-xs text-[#888] uppercase tracking-widest" style={{ fontWeight: 700 }}>
                3 / 6 UNLOCKED
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.title}
                  className={`border-[2.5px] border-black p-6 flex flex-col items-center text-center gap-3 ${
                    ach.unlocked ? "bg-[#FFFBF0] shadow-[4px_4px_0_#000]" : "bg-[#f5f5f5] opacity-50"
                  }`}
                >
                  <span className="text-4xl mb-2">{ach.icon}</span>
                  <span
                    className="text-sm uppercase tracking-wider text-black"
                    style={{ fontWeight: 900 }}
                  >
                    {ach.title}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#888]" style={{ fontWeight: 600 }}>
                    {ach.desc}
                  </span>
                  {ach.unlocked ? (
                    <div className="w-6 h-6 mt-2 bg-[#00C853] border-[2px] border-black flex items-center justify-center">
                      <span className="text-white" style={{ fontSize: "12px", fontWeight: "900" }}>✓</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 mt-2 border-[2px] border-[#ccc] flex items-center justify-center">
                      <span className="text-[#ccc]" style={{ fontSize: "10px", fontWeight: "900" }}>🔒</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}