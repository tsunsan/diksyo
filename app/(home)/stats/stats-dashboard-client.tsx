"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Star,
  TrendingUp,
  Zap,
  BookOpen,
  Target,
  Award,
  Trophy,
  Clock,
  BrainCircuit,
  CalendarDays,
  Swords,
  GraduationCap,
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

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS = ["MY PROGRESS", "ACHIEVEMENTS", "LEADERBOARD"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getLevelDetails = (xp: number, levels: any[]) => {
  if (!levels || levels.length === 0) {
    return {
      current: { name: "BAGUHAN", minXp: 0, color: "#aaa" },
      next: { name: "MAG-AARAL", minXp: 100, color: "#00C853" },
    };
  }
  let current = levels[0];
  let next = levels.length > 1 ? levels[1] : levels[0];
  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].minXp) {
      current = levels[i];
      next = levels[i + 1] || levels[i];
    }
  }
  return { current, next };
};

const formatTime = (ms: number) => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m`;
  return "0m";
};

const formatQuizTime = (ms: number) => {
  if (!ms || ms === 0) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

const getHeatmapColor = (xp: number): string => {
  if (xp === 0) return "#e5e1d8";
  if (xp < 15) return "#FFF3B0";
  if (xp < 40) return "#FFE500";
  if (xp < 80) return "#FF6D00";
  return "#000000";
};

const getHeatmapData = (yearlyHeatmap: any[]) => {
  if (!yearlyHeatmap.length)
    return {
      weeks: [] as (any | null)[][],
      months: [] as { label: string; weekIndex: number }[],
    };

  const weeks: (any | null)[][] = [];
  let currentWeek: (any | null)[] = [];

  const firstDate = new Date(yearlyHeatmap[0].date + "T00:00:00");
  const startPadding = firstDate.getDay();
  for (let i = 0; i < startPadding; i++) {
    currentWeek.push(null);
  }

  yearlyHeatmap.forEach((day: any) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const monthNames = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];
  const months: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, wi) => {
    const firstDay = week.find((d: any) => d !== null);
    if (firstDay) {
      const month = new Date(firstDay.date + "T00:00:00").getMonth();
      if (month !== lastMonth) {
        months.push({ label: monthNames[month], weekIndex: wi });
        lastMonth = month;
      }
    }
  });

  return { weeks, months };
};

const getMemoryLabel = (rate: number) => {
  if (rate >= 81) return { text: "EXCELLENT", color: "#00C853" };
  if (rate >= 61) return { text: "GREAT", color: "#0057FF" };
  if (rate >= 31) return { text: "BUILDING", color: "#FF6D00" };
  return { text: "STARTING", color: "#888" };
};

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

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function StatsDashboardClient({
  stats,
  leaderboard,
  greeting,
}: {
  stats: any;
  leaderboard: any;
  greeting: string;
}) {
  const [activeTab, setActiveTab] = useState("MY PROGRESS");

  // ── Data extraction with fallbacks ──
  const profile = stats?.profile || {
    displayName: "JUAN DELA CRUZ",
    userId: "",
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    wordsMastered: 0,
    quizzesCompleted: 0,
    perfectQuizzes: 0,
    fastestQuizMs: 0,
    totalTimeLearningMs: 0,
  };

  const achievements = stats?.achievements || [];
  const weeklyWords = stats?.weeklyWords || [];
  const accuracyTrend = stats?.accuracyTrend || [];
  const dynamicLevels = stats?.levels || [];
  const fsrs = stats?.fsrs || {
    retentionRate: 0,
    upcomingReviewsCount: 0,
    wordsByDifficulty: { learning: 0, reviewing: 0, mastered: 0 },
    struggledWords: [],
  };
  const yearlyHeatmap = stats?.yearlyHeatmap || [];

  const topXp = leaderboard?.topXp || [];
  const topWords = leaderboard?.topWords || [];
  const weeklyTopXp = leaderboard?.weeklyTopXp || [];

  const [leaderboardScope, setLeaderboardScope] = useState<"ALL_TIME" | "WEEKLY">("ALL_TIME");

  // ── Computed values ──
  const { current: CURRENT_LEVEL, next: NEXT_LEVEL } = getLevelDetails(profile.xp, dynamicLevels);
  const XP_PROGRESS =
    NEXT_LEVEL.minXp > CURRENT_LEVEL.minXp
      ? ((profile.xp - CURRENT_LEVEL.minXp) / (NEXT_LEVEL.minXp - CURRENT_LEVEL.minXp)) * 100
      : 100;

  const heatmapData = useMemo(() => getHeatmapData(yearlyHeatmap), [yearlyHeatmap]);

  const totalPipelineWords =
    fsrs.wordsByDifficulty.learning +
    fsrs.wordsByDifficulty.reviewing +
    fsrs.wordsByDifficulty.mastered;

  const pipelinePercentages =
    totalPipelineWords > 0
      ? {
          learning: (fsrs.wordsByDifficulty.learning / totalPipelineWords) * 100,
          reviewing: (fsrs.wordsByDifficulty.reviewing / totalPipelineWords) * 100,
          mastered: (fsrs.wordsByDifficulty.mastered / totalPipelineWords) * 100,
        }
      : { learning: 0, reviewing: 0, mastered: 0 };

  const unlockedCount = achievements.filter((a: any) => a.unlocked).length;
  const activeDays = yearlyHeatmap.filter((d: any) => d.xp > 0).length;
  const totalXpYear = yearlyHeatmap.reduce((acc: number, d: any) => acc + d.xp, 0);
  const memoryLabel = getMemoryLabel(fsrs.retentionRate);
  const activeXpLeaderboard = leaderboardScope === "ALL_TIME" ? topXp : weeklyTopXp;
  const medalEmojis = ["🥇", "🥈", "🥉"];

  // ── Jeepney road position ──
  const currentLevelIndex = dynamicLevels.findIndex(
    (l: any) => l.name === CURRENT_LEVEL.name
  );
  const totalSegments = dynamicLevels.length - 1;
  const jeepneyRoadPercent =
    totalSegments > 0
      ? ((currentLevelIndex + XP_PROGRESS / 100) / totalSegments) * 100
      : 100;

  // ── Render ──
  return (
    <div style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
      {/* ═══════════════════════════════════════════════════════════════════
          PERSISTENT HERO — Always visible above tabs
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-5 mb-8"
      >
        <div>
          <p
            className="text-[#888] text-xs uppercase tracking-[0.2em] mb-1"
            style={{ fontWeight: 700 }}
          >
            {greeting}
          </p>
          <h1
            className="uppercase tracking-tighter text-black italic"
            style={{
              fontWeight: 900,
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              lineHeight: 1.1,
            }}
          >
            {profile.displayName}
          </h1>
        </div>

        {/* 4 Key Stat Badges */}
        <div id="stats-hero-badges" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              icon: Flame,
              label: "STREAK",
              value: profile.currentStreak,
              unit: "DAYS",
              bg: "#FF6D00",
              iconColor: "#FFE500",
              fill: true,
              shadow: "#000",
            },
            {
              icon: Star,
              label: "TOTAL XP",
              value: profile.xp.toLocaleString(),
              unit: "XP",
              bg: "#000",
              iconColor: "#FFE500",
              fill: true,
              shadow: "#FFE500",
            },
            {
              icon: BookOpen,
              label: "WORDS MASTERED",
              value: profile.wordsMastered,
              unit: "WORDS",
              bg: "#0057FF",
              iconColor: "#fff",
              fill: false,
              shadow: "#000",
            },
            {
              icon: Clock,
              label: "TIME LEARNING",
              value: formatTime(profile.totalTimeLearningMs || 0),
              unit: "TOTAL",
              bg: "#00C853",
              iconColor: "#fff",
              fill: false,
              shadow: "#000",
            },
          ].map(({ icon: Icon, label, value, unit, bg, iconColor, fill, shadow }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.03, y: -3 }}
              className="border-[3px] border-black p-4 flex flex-col justify-between relative overflow-hidden group cursor-default min-h-[100px]"
              style={{ background: bg, boxShadow: `5px 5px 0 ${shadow}` }}
            >
              <div className="absolute -right-3 -bottom-3 opacity-[0.12] group-hover:scale-125 transition-transform duration-500">
                <Icon className="w-20 h-20" style={{ color: iconColor }} />
              </div>
              <div className="flex items-center gap-1.5 mb-2 relative z-10">
                <Icon
                  className="w-4 h-4"
                  style={{ color: iconColor }}
                  {...(fill ? { fill: iconColor } : {})}
                />
                <span
                  className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em]"
                  style={{ fontWeight: 800, color: "rgba(255,255,255,0.65)" }}
                >
                  {label}
                </span>
              </div>
              <div
                className="relative z-10"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(1.3rem, 3vw, 1.75rem)",
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
              <div
                className="text-[9px] uppercase tracking-[0.15em] mt-1 relative z-10"
                style={{ fontWeight: 700, color: "rgba(255,255,255,0.45)" }}
              >
                {unit}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          TAB NAVIGATION
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="inline-flex max-w-full overflow-x-auto border-[3px] border-black shadow-[5px_5px_0_#000] bg-white mb-8">
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-6 sm:px-8 py-3.5 uppercase tracking-widest text-[11px] sm:text-[13px] focus:outline-none relative active:scale-[0.98] transition-transform ${
                isActive
                  ? "bg-[#FFE500] text-black font-black"
                  : "bg-white text-[#555] font-bold hover:bg-yellow-100 hover:text-black"
              } ${index !== 0 ? "border-l-[3px] border-black" : ""}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-black"
                />
              )}
              {tab}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TAB CONTENT
          ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
          className="flex flex-col gap-6"
        >
          {/* ─────────────── MY PROGRESS TAB ─────────────── */}
          {activeTab === "MY PROGRESS" && (
            <>
              {/* ═══ JEEPNEY ROAD JOURNEY ═══ */}
              <motion.div variants={itemVariants} className="relative">
                <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5 sm:p-6 relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#7C3AED]" />
                      <span
                        className="text-sm uppercase tracking-[0.15em] text-black"
                        style={{ fontWeight: 900 }}
                      >
                        YOUR JOURNEY
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 border-[2.5px] border-black flex items-center justify-center"
                        style={{ background: CURRENT_LEVEL.color }}
                      >
                        <GraduationCap
                          className="w-4 h-4"
                          style={{
                            color: CURRENT_LEVEL.color === "#FFE500" ? "#000" : "#fff",
                          }}
                        />
                      </div>
                      <span
                        className="text-sm uppercase tracking-tight"
                        style={{ fontWeight: 900 }}
                      >
                        {CURRENT_LEVEL.name}
                      </span>
                    </div>
                  </div>
                  <p
                    className="text-[10px] text-[#888] uppercase tracking-wider mb-6"
                    style={{ fontWeight: 600 }}
                  >
                    RIDE THE JEEPNEY THROUGH YOUR TAGALOG LEVELS
                  </p>

                  {/* Road Scene */}
                  <div className="overflow-x-auto pb-2">
                    <div className="relative" style={{ minWidth: `${dynamicLevels.length * 90}px`, height: '140px' }}>

                      {/* Sky / background scenery line */}
                      <div className="absolute bottom-[54px] left-0 right-0 h-[1px] bg-[#eee]" />

                      {/* ── THE ROAD ── */}
                      {/* Road surface (gray base) */}
                      <div
                        className="absolute bottom-[30px] left-[40px] h-[14px] bg-[#ddd] border-[2px] border-black"
                        style={{ right: '40px' }}
                      />
                      {/* Road dashed center line */}
                      <div
                        className="absolute bottom-[35px] left-[44px] h-[2px]"
                        style={{
                          right: '44px',
                          backgroundImage: 'repeating-linear-gradient(to right, #888 0px, #888 8px, transparent 8px, transparent 16px)',
                        }}
                      />
                      {/* Road filled portion (yellow) */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(jeepneyRoadPercent, 100)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute bottom-[30px] left-[40px] h-[14px] bg-[#FFE500] border-[2px] border-black overflow-hidden"
                        style={{ maxWidth: 'calc(100% - 80px)' }}
                      >
                        {/* Dashed line over filled road */}
                        <div
                          className="absolute top-[3px] left-0 right-0 h-[2px]"
                          style={{
                            backgroundImage: 'repeating-linear-gradient(to right, #000 0px, #000 8px, transparent 8px, transparent 16px)',
                            opacity: 0.3,
                          }}
                        />
                      </motion.div>

                      {/* ── LEVEL STOPS ── */}
                      {dynamicLevels.map((lvl: any, i: number) => {
                        const isCurrent = lvl.name === CURRENT_LEVEL.name;
                        const isUnlocked = profile.xp >= lvl.minXp;
                        const stopPercent =
                          totalSegments > 0 ? (i / totalSegments) * 100 : 50;

                        return (
                          <div
                            key={lvl.name}
                            className="absolute flex flex-col items-center"
                            style={{
                              left: `calc(40px + (100% - 80px) * ${stopPercent / 100})`,
                              bottom: '20px',
                              transform: 'translateX(-50%)',
                            }}
                          >
                            {/* Jeepney on current level */}
                            {isCurrent && (
                              <motion.div
                                initial={{ x: -60, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 80,
                                  damping: 14,
                                  delay: 0.8,
                                }}
                                className="absolute bottom-[24px]"
                              >
                                {/* Inline SVG Jeepney */}
                                <motion.svg
                                  animate={{ y: [0, -2, 0] }}
                                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                  width="72"
                                  height="42"
                                  viewBox="0 0 72 42"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="drop-shadow-sm"
                                >
                                  {/* Body */}
                                  <rect x="2" y="12" width="56" height="20" fill="#FFE500" stroke="#000" strokeWidth="2.5" />
                                  {/* Roof / luggage rack */}
                                  <rect x="2" y="6" width="56" height="8" fill="#FF6D00" stroke="#000" strokeWidth="2.5" />
                                  {/* Roof rails */}
                                  <line x1="8" y1="6" x2="8" y2="3" stroke="#000" strokeWidth="2" />
                                  <line x1="52" y1="6" x2="52" y2="3" stroke="#000" strokeWidth="2" />
                                  <line x1="8" y1="3" x2="52" y2="3" stroke="#000" strokeWidth="2" />
                                  {/* Windows */}
                                  <rect x="6" y="15" width="9" height="7" fill="#fff" stroke="#000" strokeWidth="1.5" />
                                  <rect x="18" y="15" width="9" height="7" fill="#fff" stroke="#000" strokeWidth="1.5" />
                                  <rect x="30" y="15" width="9" height="7" fill="#fff" stroke="#000" strokeWidth="1.5" />
                                  <rect x="42" y="15" width="9" height="7" fill="#fff" stroke="#000" strokeWidth="1.5" />
                                  {/* Front cabin */}
                                  <rect x="56" y="10" width="14" height="22" fill="#FFE500" stroke="#000" strokeWidth="2.5" />
                                  {/* Front windshield */}
                                  <rect x="59" y="13" width="8" height="8" fill="#C5F0FF" stroke="#000" strokeWidth="1.5" />
                                  {/* Headlight */}
                                  <rect x="68" y="24" width="3" height="4" fill="#fff" stroke="#000" strokeWidth="1" />
                                  {/* Bumper */}
                                  <rect x="58" y="30" width="14" height="3" fill="#333" stroke="#000" strokeWidth="1" />
                                  {/* Back entrance */}
                                  <rect x="2" y="17" width="1" height="12" fill="#000" />
                                  {/* Wheels */}
                                  <circle cx="18" cy="34" r="6" fill="#444" stroke="#000" strokeWidth="2.5" />
                                  <circle cx="18" cy="34" r="2.5" fill="#888" />
                                  <circle cx="54" cy="34" r="6" fill="#444" stroke="#000" strokeWidth="2.5" />
                                  <circle cx="54" cy="34" r="2.5" fill="#888" />
                                  {/* Exhaust puff */}
                                  <motion.circle
                                    animate={{ x: [-2, -8], opacity: [0.5, 0], r: [2, 5] }}
                                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
                                    cx="0"
                                    cy="32"
                                    r="2"
                                    fill="#ccc"
                                  />
                                </motion.svg>
                              </motion.div>
                            )}

                            {/* Stop marker */}
                            <motion.div
                              whileHover={isUnlocked ? { scale: 1.15 } : {}}
                              className="relative z-10"
                            >
                              {/* Stop post (vertical line into road) */}
                              <div
                                className="w-[3px] h-[10px] mx-auto"
                                style={{ background: isUnlocked ? '#000' : '#ccc' }}
                              />
                              {/* Stop sign */}
                              <div
                                className={`w-8 h-8 sm:w-9 sm:h-9 border-[2.5px] flex items-center justify-center ${
                                  isUnlocked
                                    ? 'border-black'
                                    : 'border-[#ccc]'
                                }`}
                                style={{
                                  background: isUnlocked ? lvl.color : '#f0f0f0',
                                  ...(isCurrent
                                    ? { boxShadow: '0 0 0 3px #000, 0 0 0 5px #FFE500' }
                                    : {}),
                                }}
                              >
                                {isUnlocked ? (
                                  isCurrent ? (
                                    <motion.div
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                      <Star
                                        className="w-4 h-4"
                                        style={{
                                          color: lvl.color === '#FFE500' ? '#000' : '#fff',
                                        }}
                                        fill={lvl.color === '#FFE500' ? '#000' : '#fff'}
                                      />
                                    </motion.div>
                                  ) : (
                                    <span
                                      style={{
                                        fontWeight: 900,
                                        fontSize: '11px',
                                        color: lvl.color === '#FFE500' ? '#000' : '#fff',
                                      }}
                                    >
                                      ✓
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[#bbb] text-[10px]">🔒</span>
                                )}
                              </div>
                            </motion.div>

                            {/* Level name below stop */}
                            <span
                              className="text-[7px] sm:text-[8px] uppercase tracking-wider whitespace-nowrap mt-1"
                              style={{
                                fontWeight: 800,
                                color: isCurrent ? '#000' : isUnlocked ? '#666' : '#bbb',
                              }}
                            >
                              {lvl.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* XP Road Progress */}
                  <div className="bg-[#FFFBF0] border-[2px] border-black p-3 sm:p-4 mt-2">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 border-[2px] border-black flex items-center justify-center"
                          style={{ background: CURRENT_LEVEL.color }}
                        >
                          <span
                            style={{
                              fontWeight: 900,
                              fontSize: '8px',
                              color: CURRENT_LEVEL.color === '#FFE500' ? '#000' : '#fff',
                            }}
                          >
                            {currentLevelIndex + 1}
                          </span>
                        </div>
                        <span
                          className="text-black uppercase tracking-tight"
                          style={{ fontWeight: 900, fontSize: '1rem' }}
                        >
                          {CURRENT_LEVEL.name}
                        </span>
                        {NEXT_LEVEL.name !== CURRENT_LEVEL.name && (
                          <span
                            className="text-[#888] text-xs uppercase tracking-wider"
                            style={{ fontWeight: 600 }}
                          >
                            → {NEXT_LEVEL.name}
                          </span>
                        )}
                      </div>
                      <span className="text-black text-sm" style={{ fontWeight: 800 }}>
                        {profile.xp} /{' '}
                        {NEXT_LEVEL.name !== CURRENT_LEVEL.name
                          ? NEXT_LEVEL.minXp
                          : 'MAX'}{' '}
                        XP
                      </span>
                    </div>
                    {/* XP bar styled as road */}
                    <div className="h-5 bg-[#ddd] border-[2px] border-black overflow-hidden relative">
                      {/* Road dashes on the bar */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(to right, transparent 0px, transparent 14px, rgba(0,0,0,0.08) 14px, rgba(0,0,0,0.08) 16px)',
                        }}
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${XP_PROGRESS}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                        className="h-full relative z-[1]"
                        style={{ background: CURRENT_LEVEL.color }}
                      />
                    </div>
                    {NEXT_LEVEL.name !== CURRENT_LEVEL.name && (
                      <p
                        className="text-[#888] text-[10px] sm:text-xs mt-2 uppercase tracking-wider"
                        style={{ fontWeight: 600 }}
                      >
                        {NEXT_LEVEL.minXp - profile.xp} XP UNTIL NEXT STOP — {NEXT_LEVEL.name}
                      </p>
                    )}
                  </div>
                </div>
                {/* Decorative block */}
                <div className="absolute -z-10 top-4 -right-4 w-14 h-14 bg-[#7C3AED] border-[2px] border-black hidden sm:block" />
              </motion.div>

              {/* Yearly Activity Heatmap */}
              <motion.div variants={itemVariants}>
                <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#000] transition-all">
                  <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-[#FF6D00]" />
                      <span
                        className="text-sm uppercase tracking-[0.15em] text-black"
                        style={{ fontWeight: 900 }}
                      >
                        YOUR YEAR
                      </span>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-[#FF6D00]" fill="#FF6D00" />
                        <span
                          className="text-[10px] uppercase tracking-wider"
                          style={{ fontWeight: 800 }}
                        >
                          {activeDays} ACTIVE DAYS
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-[#FFE500]" fill="#FFE500" />
                        <span
                          className="text-[10px] uppercase tracking-wider"
                          style={{ fontWeight: 800 }}
                        >
                          {totalXpYear.toLocaleString()} XP EARNED
                        </span>
                      </div>
                    </div>
                  </div>

                  {heatmapData.weeks.length > 0 ? (
                    <div className="overflow-x-auto pb-2">
                      {/* Month labels */}
                      <div
                        className="relative"
                        style={{
                          height: "16px",
                          marginBottom: "4px",
                          marginLeft: "30px",
                        }}
                      >
                        {heatmapData.months.map((m, i) => (
                          <span
                            key={`${m.label}-${i}`}
                            className="absolute text-[9px] uppercase tracking-wider select-none"
                            style={{
                              fontWeight: 800,
                              color: "#888",
                              left: `${m.weekIndex * 13}px`,
                            }}
                          >
                            {m.label}
                          </span>
                        ))}
                      </div>

                      {/* Heatmap grid */}
                      <div className="flex gap-[2px]">
                        {/* Day labels */}
                        <div
                          className="flex flex-col gap-[2px] shrink-0 justify-start"
                          style={{ width: "26px" }}
                        >
                          {["", "M", "", "W", "", "F", ""].map((d, i) => (
                            <div
                              key={i}
                              className="flex items-center"
                              style={{ height: "11px" }}
                            >
                              <span
                                className="text-[8px] uppercase"
                                style={{ fontWeight: 700, color: "#888" }}
                              >
                                {d}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Week columns */}
                        {heatmapData.weeks.map((week, wi) => (
                          <div key={wi} className="flex flex-col gap-[2px]">
                            {week.map((day: any, di: number) => (
                              <div
                                key={di}
                                className="w-[11px] h-[11px] transition-colors hover:ring-1 hover:ring-black cursor-default"
                                style={{
                                  background: day
                                    ? getHeatmapColor(day.xp)
                                    : "transparent",
                                  border: day
                                    ? "1px solid rgba(0,0,0,0.06)"
                                    : "none",
                                }}
                                title={
                                  day
                                    ? `${day.date}: ${day.xp} XP, ${day.quizzes} answers`
                                    : ""
                                }
                              />
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-2 mt-3 ml-[30px]">
                        <span
                          className="text-[9px] uppercase tracking-wider"
                          style={{ fontWeight: 700, color: "#888" }}
                        >
                          LESS
                        </span>
                        {[
                          "#e5e1d8",
                          "#FFF3B0",
                          "#FFE500",
                          "#FF6D00",
                          "#000000",
                        ].map((color) => (
                          <div
                            key={color}
                            className="w-[11px] h-[11px]"
                            style={{
                              background: color,
                              border: "1px solid rgba(0,0,0,0.1)",
                            }}
                          />
                        ))}
                        <span
                          className="text-[9px] uppercase tracking-wider"
                          style={{ fontWeight: 700, color: "#888" }}
                        >
                          MORE
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-10 border-[2px] border-dashed border-[#ccc]">
                      <p
                        className="text-[#aaa] text-sm uppercase tracking-wider"
                        style={{ fontWeight: 700 }}
                      >
                        YOUR ACTIVITY WILL APPEAR HERE
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* This Week — Charts */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Words Learned Chart */}
                <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#000] transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-[#0057FF]" />
                    <span
                      className="text-sm uppercase tracking-[0.15em] text-black"
                      style={{ fontWeight: 900 }}
                    >
                      WORDS LEARNED
                    </span>
                  </div>
                  <p
                    className="text-[10px] text-[#888] uppercase tracking-wider mb-5"
                    style={{ fontWeight: 600 }}
                  >
                    NEW WORDS PICKED UP EACH DAY THIS WEEK
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={weeklyWords} barSize={28}>
                      <CartesianGrid
                        strokeDasharray="0"
                        stroke="#eee"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        tick={{ fontWeight: 800, fontSize: 10, fill: "#000" }}
                        axisLine={{ stroke: "#000", strokeWidth: 2 }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontWeight: 700, fontSize: 10, fill: "#888" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "#FFE500", opacity: 0.3 }}
                      />
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

                {/* Accuracy Trend Chart */}
                <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#000] transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-[#00C853]" />
                    <span
                      className="text-sm uppercase tracking-[0.15em] text-black"
                      style={{ fontWeight: 900 }}
                    >
                      ACCURACY TREND
                    </span>
                  </div>
                  <p
                    className="text-[10px] text-[#888] uppercase tracking-wider mb-5"
                    style={{ fontWeight: 600 }}
                  >
                    YOUR QUIZ ANSWER ACCURACY OVER THE PAST 7 DAYS
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={accuracyTrend}>
                      <defs>
                        <linearGradient
                          id="accuracyGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#00C853"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#00C853"
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="0"
                        stroke="#eee"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="week"
                        tick={{ fontWeight: 800, fontSize: 10, fill: "#000" }}
                        axisLine={{ stroke: "#000", strokeWidth: 2 }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontWeight: 700, fontSize: 10, fill: "#888" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="step"
                        dataKey="accuracy"
                        stroke="#00C853"
                        strokeWidth={3}
                        fill="url(#accuracyGrad)"
                        activeDot={{
                          r: 7,
                          fill: "#FFE500",
                          stroke: "#000",
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Memory Insights */}
              <motion.div variants={itemVariants}>
                <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#000] transition-all">
                  <div className="flex items-center gap-2 mb-6">
                    <BrainCircuit className="w-5 h-5 text-[#7C3AED]" />
                    <span
                      className="text-sm uppercase tracking-[0.15em] text-black"
                      style={{ fontWeight: 900 }}
                    >
                      HOW YOUR BRAIN IS DOING
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Memory Strength */}
                    <div className="bg-[#FFFBF0] border-[2.5px] border-black p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BrainCircuit className="w-4 h-4 text-[#FF6D00]" />
                        <span
                          className="text-[10px] uppercase tracking-[0.15em]"
                          style={{ fontWeight: 800 }}
                        >
                          MEMORY STRENGTH
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span
                          style={{
                            fontWeight: 900,
                            fontSize: "2rem",
                            lineHeight: 1,
                          }}
                        >
                          {fsrs.retentionRate}%
                        </span>
                        <span
                          className="text-[10px] uppercase tracking-wider"
                          style={{
                            fontWeight: 800,
                            color: memoryLabel.color,
                          }}
                        >
                          {memoryLabel.text}
                        </span>
                      </div>
                      {/* Segmented gauge */}
                      <div className="flex gap-[2px] h-4">
                        {Array.from({ length: 10 }).map((_, i) => {
                          const threshold = (i + 1) * 10;
                          const filled = fsrs.retentionRate >= threshold;
                          return (
                            <div
                              key={i}
                              className="flex-1 border border-black/15 transition-colors"
                              style={{
                                background: filled ? memoryLabel.color : "#eee",
                              }}
                            />
                          );
                        })}
                      </div>
                      <p
                        className="text-[9px] text-[#888] uppercase tracking-wider mt-2"
                        style={{ fontWeight: 600 }}
                      >
                        HOW WELL YOU REMEMBER LEARNED WORDS
                      </p>
                    </div>

                    {/* Due Reviews */}
                    <div className="bg-white border-[2.5px] border-black p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CalendarDays className="w-4 h-4 text-[#00C853]" />
                        <span
                          className="text-[10px] uppercase tracking-[0.15em]"
                          style={{ fontWeight: 800 }}
                        >
                          DUE FOR REVIEW
                        </span>
                      </div>
                      <div
                        className="mb-2"
                        style={{
                          fontWeight: 900,
                          fontSize: "2rem",
                          lineHeight: 1,
                          color:
                            fsrs.upcomingReviewsCount > 0
                              ? "#FF6D00"
                              : "#000",
                        }}
                      >
                        {fsrs.upcomingReviewsCount}
                      </div>
                      <p
                        className="text-[9px] text-[#888] uppercase tracking-wider mb-3"
                        style={{ fontWeight: 600 }}
                      >
                        WORDS READY TO PRACTICE NOW
                      </p>
                      {fsrs.upcomingReviewsCount > 0 && (
                        <div
                          className="border-[2px] border-black bg-[#FFE500] px-3 py-1.5 text-center uppercase tracking-wider text-[10px] cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0_#000] transition-all"
                          style={{ fontWeight: 900 }}
                        >
                          START REVIEW →
                        </div>
                      )}
                    </div>

                    {/* Word Pipeline */}
                    <div className="bg-black text-white border-[2.5px] border-black p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-[#FFE500]" />
                        <span
                          className="text-[10px] uppercase tracking-[0.15em]"
                          style={{ fontWeight: 800 }}
                        >
                          WORD PIPELINE
                        </span>
                      </div>
                      {/* Stacked bar */}
                      <div className="h-5 border-[2px] border-white/30 flex overflow-hidden mb-3">
                        {totalPipelineWords > 0 ? (
                          <>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${pipelinePercentages.learning}%`,
                              }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="h-full bg-[#FF6D00] flex items-center justify-center"
                            >
                              {pipelinePercentages.learning > 18 && (
                                <span
                                  className="text-[8px] text-white"
                                  style={{ fontWeight: 900 }}
                                >
                                  {fsrs.wordsByDifficulty.learning}
                                </span>
                              )}
                            </motion.div>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${pipelinePercentages.reviewing}%`,
                              }}
                              transition={{ duration: 0.8, delay: 0.4 }}
                              className="h-full bg-[#FFE500] flex items-center justify-center"
                            >
                              {pipelinePercentages.reviewing > 18 && (
                                <span
                                  className="text-[8px] text-black"
                                  style={{ fontWeight: 900 }}
                                >
                                  {fsrs.wordsByDifficulty.reviewing}
                                </span>
                              )}
                            </motion.div>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${pipelinePercentages.mastered}%`,
                              }}
                              transition={{ duration: 0.8, delay: 0.6 }}
                              className="h-full bg-[#00C853] flex items-center justify-center"
                            >
                              {pipelinePercentages.mastered > 18 && (
                                <span
                                  className="text-[8px] text-white"
                                  style={{ fontWeight: 900 }}
                                >
                                  {fsrs.wordsByDifficulty.mastered}
                                </span>
                              )}
                            </motion.div>
                          </>
                        ) : (
                          <div className="h-full w-full bg-white/10 flex items-center justify-center">
                            <span
                              className="text-[9px] uppercase tracking-wider"
                              style={{
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.4)",
                              }}
                            >
                              NO WORDS YET
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Legend */}
                      <div className="flex gap-3 flex-wrap">
                        {[
                          {
                            label: "LEARNING",
                            count: fsrs.wordsByDifficulty.learning,
                            color: "#FF6D00",
                          },
                          {
                            label: "REVIEWING",
                            count: fsrs.wordsByDifficulty.reviewing,
                            color: "#FFE500",
                          },
                          {
                            label: "MASTERED",
                            count: fsrs.wordsByDifficulty.mastered,
                            color: "#00C853",
                          },
                        ].map(({ label, count, color }) => (
                          <div key={label} className="flex items-center gap-1">
                            <div
                              className="w-2.5 h-2.5 border border-white/30"
                              style={{ background: color }}
                            />
                            <span
                              className="text-[8px] uppercase tracking-wider"
                              style={{ fontWeight: 700 }}
                            >
                              {label} ({count})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Struggled Words */}
                  {fsrs.struggledWords && fsrs.struggledWords.length > 0 && (
                    <div className="border-t-[2px] border-black pt-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Swords className="w-4 h-4 text-[#FF6D00]" />
                        <span
                          className="text-xs uppercase tracking-[0.15em]"
                          style={{ fontWeight: 900 }}
                        >
                          WORDS TO PRACTICE
                        </span>
                        <span
                          className="text-[9px] text-[#888] uppercase tracking-wider ml-1 hidden sm:inline"
                          style={{ fontWeight: 600 }}
                        >
                          — YOUR MOST CHALLENGING WORDS
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {fsrs.struggledWords.map((word: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-2.5 border-[2px] border-black bg-[#FFFBF0] hover:bg-[#fff5d6] transition-colors"
                          >
                            <div
                              className="w-6 h-6 border-[2px] border-black bg-[#FF6D00] flex items-center justify-center shrink-0"
                              style={{
                                fontWeight: 900,
                                fontSize: "10px",
                                color: "#fff",
                              }}
                            >
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span
                                className="text-sm uppercase truncate block"
                                style={{ fontWeight: 900 }}
                              >
                                {word.word || "—"}
                              </span>
                              <span
                                className="text-[10px] text-[#888] uppercase tracking-wider truncate block"
                                style={{ fontWeight: 600 }}
                              >
                                {word.translation || "—"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="w-16 sm:w-24 h-2.5 bg-white border-[1.5px] border-black overflow-hidden">
                                <div
                                  className="h-full transition-all"
                                  style={{
                                    width: `${word.mastery || 0}%`,
                                    background:
                                      (word.mastery || 0) < 50
                                        ? "#FF6D00"
                                        : (word.mastery || 0) < 90
                                          ? "#FFE500"
                                          : "#00C853",
                                  }}
                                />
                              </div>
                              <span
                                className="text-[10px] w-8 text-right"
                                style={{ fontWeight: 800 }}
                              >
                                {word.mastery || 0}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}

          {/* ─────────────── ACHIEVEMENTS TAB ─────────────── */}
          {activeTab === "ACHIEVEMENTS" && (
            <>
              {/* Personal Records */}
              <motion.div variants={itemVariants}>
                <div className="bg-[#FFFBF0] border-[3px] border-black shadow-[4px_4px_0_#000] p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000] transition-all relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 opacity-[0.06]">
                    <Trophy className="w-32 h-32 text-black" />
                  </div>
                  <div className="flex items-center gap-2 mb-5">
                    <Trophy
                      className="w-5 h-5 text-[#FFE500]"
                      fill="#FFE500"
                    />
                    <span
                      className="text-sm uppercase tracking-[0.15em] text-black"
                      style={{ fontWeight: 900 }}
                    >
                      PERSONAL RECORDS
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
                    {[
                      {
                        icon: Flame,
                        label: "BEST STREAK",
                        value: profile.longestStreak || 0,
                        unit: "DAYS",
                        color: "#FF6D00",
                      },
                      {
                        icon: Zap,
                        label: "PERFECT QUIZZES",
                        value: profile.perfectQuizzes || 0,
                        unit: "100% SCORE",
                        color: "#7C3AED",
                      },
                      {
                        icon: Clock,
                        label: "FASTEST QUIZ",
                        value: formatQuizTime(
                          profile.fastestQuizMs || 0
                        ),
                        unit: "BEST TIME",
                        color: "#00C853",
                      },
                    ].map(({ icon: Icon, label, value, unit, color }) => (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        key={label}
                        className="border-[2px] border-black bg-white p-4 text-center"
                      >
                        <Icon
                          className="w-5 h-5 mx-auto mb-2"
                          style={{ color }}
                        />
                        <div
                          className="text-2xl mb-0.5"
                          style={{ fontWeight: 900 }}
                        >
                          {value}
                        </div>
                        <div
                          className="text-[10px] uppercase tracking-wider mb-0.5"
                          style={{ fontWeight: 900 }}
                        >
                          {label}
                        </div>
                        <div
                          className="text-[9px] uppercase tracking-wider"
                          style={{ fontWeight: 600, color: "#888" }}
                        >
                          {unit}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Achievements Grid */}
              <motion.div variants={itemVariants}>
                <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-5 flex-wrap">
                    <Award className="w-5 h-5 text-[#FFE500]" />
                    <span
                      className="text-sm uppercase tracking-[0.15em] text-black"
                      style={{ fontWeight: 900 }}
                    >
                      YOUR BADGES
                    </span>
                    <span
                      className="ml-auto text-xs text-[#888] uppercase tracking-widest"
                      style={{ fontWeight: 700 }}
                    >
                      {unlockedCount} / {achievements.length} UNLOCKED
                    </span>
                  </div>

                  {achievements.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {achievements.map((ach: any) => (
                        <motion.div
                          whileHover={
                            ach.unlocked
                              ? { scale: 1.04, rotate: 1 }
                              : {}
                          }
                          key={ach.title}
                          className={`border-[2.5px] border-black p-4 sm:p-5 flex flex-col items-center text-center gap-2 transition-all ${
                            ach.unlocked
                              ? "bg-[#FFFBF0] shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000]"
                              : "bg-[#f5f5f5] opacity-50 grayscale"
                          }`}
                        >
                          <span className="text-3xl sm:text-4xl">
                            {ach.icon}
                          </span>
                          <span
                            className="text-[11px] sm:text-sm uppercase tracking-wider text-black leading-tight"
                            style={{ fontWeight: 900 }}
                          >
                            {ach.title}
                          </span>
                          <span
                            className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#888] leading-tight"
                            style={{ fontWeight: 600 }}
                          >
                            {ach.desc || ach.description}
                          </span>
                          {ach.unlocked ? (
                            <div className="w-5 h-5 bg-[#00C853] border-[2px] border-black flex items-center justify-center mt-1">
                              <span
                                className="text-white text-[10px]"
                                style={{ fontWeight: 900 }}
                              >
                                ✓
                              </span>
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-[2px] border-[#ccc] flex items-center justify-center mt-1">
                              <span className="text-[#ccc] text-[9px]">
                                🔒
                              </span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-10 border-[2px] border-dashed border-[#ccc]">
                      <p
                        className="text-[#aaa] text-sm uppercase tracking-wider"
                        style={{ fontWeight: 700 }}
                      >
                        COMPLETE QUIZZES TO EARN ACHIEVEMENTS
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}

          {/* ─────────────── LEADERBOARD TAB ─────────────── */}
          {activeTab === "LEADERBOARD" && (
            <>
              {/* Scope toggle */}
              <motion.div variants={itemVariants} className="flex justify-center">
                <div className="flex border-[2.5px] border-black bg-white shadow-[4px_4px_0_#000]">
                  <button
                    id="leaderboard-scope-alltime"
                    onClick={() => setLeaderboardScope("ALL_TIME")}
                    className={`px-6 py-2.5 uppercase tracking-widest text-[10px] border-r-[2.5px] border-black ${
                      leaderboardScope === "ALL_TIME"
                        ? "bg-[#FFE500] text-black"
                        : "text-[#888] hover:text-black hover:bg-yellow-50"
                    }`}
                    style={{ fontWeight: 800 }}
                  >
                    ALL-TIME
                  </button>
                  <button
                    id="leaderboard-scope-weekly"
                    onClick={() => setLeaderboardScope("WEEKLY")}
                    className={`px-6 py-2.5 uppercase tracking-widest text-[10px] ${
                      leaderboardScope === "WEEKLY"
                        ? "bg-[#FFE500] text-black"
                        : "text-[#888] hover:text-black hover:bg-yellow-50"
                    }`}
                    style={{ fontWeight: 800 }}
                  >
                    THIS WEEK
                  </button>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* TOP XP */}
                <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-5 border-b-[2px] border-black pb-4">
                    <Star
                      className="w-5 h-5 text-[#FF6D00]"
                      fill="#FF6D00"
                    />
                    <span
                      className="text-base uppercase tracking-tight text-black"
                      style={{ fontWeight: 900 }}
                    >
                      TOP LEARNERS
                    </span>
                    <span
                      className="text-[10px] text-[#888] uppercase tracking-wider"
                      style={{ fontWeight: 600 }}
                    >
                      (XP)
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {activeXpLeaderboard.map(
                      (user: any, index: number) => {
                        const isCurrentUser =
                          user.userId === profile.userId;
                        return (
                          <motion.div
                            key={user.userId}
                            whileHover={{ scale: 1.01, x: 3 }}
                            className={`flex items-center justify-between p-3 border-[2px] border-black transition-colors ${
                              index === 0
                                ? "bg-[#FFE500] shadow-[4px_4px_0_#000]"
                                : index === 1
                                  ? "bg-[#e2e8f0] shadow-[3px_3px_0_#000]"
                                  : index === 2
                                    ? "bg-[#fcd34d] shadow-[2px_2px_0_#000]"
                                    : "bg-white"
                            } ${isCurrentUser ? "ring-2 ring-[#0057FF] ring-offset-1" : ""}`}
                          >
                            <div className="flex items-center gap-3">
                              {index < 3 ? (
                                <span className="text-xl w-8 text-center">
                                  {medalEmojis[index]}
                                </span>
                              ) : (
                                <div
                                  className="w-8 h-8 flex items-center justify-center bg-black text-white text-xs"
                                  style={{ fontWeight: 900 }}
                                >
                                  #{index + 1}
                                </div>
                              )}
                              <span
                                className="uppercase tracking-widest text-sm"
                                style={{ fontWeight: 800 }}
                              >
                                {user.displayName}
                                {isCurrentUser && (
                                  <span
                                    className="text-[9px] text-[#0057FF] ml-1.5"
                                    style={{ fontWeight: 700 }}
                                  >
                                    (YOU)
                                  </span>
                                )}
                              </span>
                            </div>
                            <span
                              className="text-base"
                              style={{ fontWeight: 900 }}
                            >
                              {user.xp.toLocaleString()}{" "}
                              <span className="text-[10px] text-black/50">
                                XP
                              </span>
                            </span>
                          </motion.div>
                        );
                      }
                    )}
                    {activeXpLeaderboard.length === 0 && (
                      <p
                        className="text-center text-[#888] py-8 uppercase tracking-wider text-sm"
                        style={{ fontWeight: 700 }}
                      >
                        NO RANKINGS YET
                      </p>
                    )}
                  </div>
                </div>

                {/* TOP WORDS */}
                <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-5 border-b-[2px] border-black pb-4">
                    <BookOpen className="w-5 h-5 text-[#0057FF]" />
                    <span
                      className="text-base uppercase tracking-tight text-black"
                      style={{ fontWeight: 900 }}
                    >
                      TOP SCHOLARS
                    </span>
                    <span
                      className="text-[10px] text-[#888] uppercase tracking-wider"
                      style={{ fontWeight: 600 }}
                    >
                      (WORDS)
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {topWords.map((user: any, index: number) => {
                      const isCurrentUser =
                        user.userId === profile.userId;
                      return (
                        <motion.div
                          key={user.userId}
                          whileHover={{ scale: 1.01, x: 3 }}
                          className={`flex items-center justify-between p-3 border-[2px] border-black transition-colors ${
                            index === 0
                              ? "bg-[#00C853] text-white shadow-[4px_4px_0_#000]"
                              : index === 1
                                ? "bg-[#e2e8f0] shadow-[3px_3px_0_#000]"
                                : index === 2
                                  ? "bg-[#a7f3d0] shadow-[2px_2px_0_#000]"
                                  : "bg-white"
                          } ${isCurrentUser ? "ring-2 ring-[#0057FF] ring-offset-1" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            {index < 3 ? (
                              <span className="text-xl w-8 text-center">
                                {medalEmojis[index]}
                              </span>
                            ) : (
                              <div
                                className="w-8 h-8 flex items-center justify-center bg-black text-white text-xs"
                                style={{ fontWeight: 900 }}
                              >
                                #{index + 1}
                              </div>
                            )}
                            <span
                              className="uppercase tracking-widest text-sm"
                              style={{ fontWeight: 800 }}
                            >
                              {user.displayName}
                              {isCurrentUser && (
                                <span
                                  className={`text-[9px] ml-1.5 ${index === 0 ? "text-white/80" : "text-[#0057FF]"}`}
                                  style={{ fontWeight: 700 }}
                                >
                                  (YOU)
                                </span>
                              )}
                            </span>
                          </div>
                          <span
                            className="text-base"
                            style={{ fontWeight: 900 }}
                          >
                            {user.wordsMastered}{" "}
                            <span
                              className={`text-[10px] ${index === 0 ? "text-white/60" : "text-black/50"}`}
                            >
                              WORDS
                            </span>
                          </span>
                        </motion.div>
                      );
                    })}
                    {topWords.length === 0 && (
                      <p
                        className="text-center text-[#888] py-8 uppercase tracking-wider text-sm"
                        style={{ fontWeight: 700 }}
                      >
                        NO RANKINGS YET
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
