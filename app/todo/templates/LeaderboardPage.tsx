import { useState } from "react";
import { motion } from "motion/react";
import { Trophy, Flame, Star, Crown, TrendingUp, Medal } from "lucide-react";

const GLOBAL_LEADERS = [
  { rank: 1, name: "ANDREA M.", level: "LAKAN", levelColor: "#FFE500", levelBg: "#000", xp: 2840, streak: 62, accuracy: 96 },
  { rank: 2, name: "BENITO R.", level: "LAKAN", levelColor: "#FFE500", levelBg: "#000", xp: 2610, streak: 45, accuracy: 94 },
  { rank: 3, name: "CLARA D.", level: "GURO", levelColor: "#fff", levelBg: "#7C3AED", xp: 1920, streak: 38, accuracy: 91 },
  { rank: 4, name: "DANILO S.", level: "GURO", levelColor: "#fff", levelBg: "#7C3AED", xp: 1780, streak: 30, accuracy: 89 },
  { rank: 5, name: "ELENA P.", level: "GURO", levelColor: "#fff", levelBg: "#7C3AED", xp: 1650, streak: 28, accuracy: 88 },
  { rank: 6, name: "FERNANDO C.", level: "BATIKAN", levelColor: "#fff", levelBg: "#0057FF", xp: 1240, streak: 21, accuracy: 85 },
  { rank: 7, name: "GRACIA T.", level: "BATIKAN", levelColor: "#fff", levelBg: "#0057FF", xp: 1100, streak: 18, accuracy: 83 },
  { rank: 8, name: "HENRY B.", level: "BATIKAN", levelColor: "#fff", levelBg: "#0057FF", xp: 980, streak: 14, accuracy: 80 },
  { rank: 9, name: "IRENE Q.", level: "MAG-AARAL", levelColor: "#000", levelBg: "#00C853", xp: 760, streak: 11, accuracy: 78 },
  { rank: 10, name: "JOSE L.", level: "MAG-AARAL", levelColor: "#000", levelBg: "#00C853", xp: 640, streak: 9, accuracy: 75 },
];

const WEEKLY_LEADERS = [
  { rank: 1, name: "FERNANDO C.", level: "BATIKAN", levelColor: "#fff", levelBg: "#0057FF", xp: 340, streak: 7, accuracy: 92 },
  { rank: 2, name: "JOSE L.", level: "MAG-AARAL", levelColor: "#000", levelBg: "#00C853", xp: 290, streak: 6, accuracy: 89 },
  { rank: 3, name: "ELENA P.", level: "GURO", levelColor: "#fff", levelBg: "#7C3AED", xp: 260, streak: 7, accuracy: 87 },
  { rank: 4, name: "ANDREA M.", level: "LAKAN", levelColor: "#FFE500", levelBg: "#000", xp: 240, streak: 7, accuracy: 95 },
  { rank: 5, name: "GRACIA T.", level: "BATIKAN", levelColor: "#fff", levelBg: "#0057FF", xp: 210, streak: 5, accuracy: 83 },
  { rank: 6, name: "HENRY B.", level: "BATIKAN", levelColor: "#fff", levelBg: "#0057FF", xp: 180, streak: 4, accuracy: 81 },
  { rank: 7, name: "IRENE Q.", level: "MAG-AARAL", levelColor: "#000", levelBg: "#00C853", xp: 160, streak: 6, accuracy: 79 },
  { rank: 8, name: "BENITO R.", level: "LAKAN", levelColor: "#FFE500", levelBg: "#000", xp: 150, streak: 3, accuracy: 90 },
  { rank: 9, name: "CLARA D.", level: "GURO", levelColor: "#fff", levelBg: "#7C3AED", xp: 130, streak: 5, accuracy: 88 },
  { rank: 10, name: "DANILO S.", level: "GURO", levelColor: "#fff", levelBg: "#7C3AED", xp: 110, streak: 2, accuracy: 84 },
];

// You / current user
const YOU = { rank: 23, name: "JUAN D.C.", level: "BATIKAN", levelColor: "#fff", levelBg: "#0057FF", xp: 450, streak: 12, accuracy: 78 };

const RANK_ICONS: Record<number, typeof Trophy> = { 1: Trophy, 2: Medal, 3: Medal };
const RANK_COLORS: Record<number, string> = { 1: "#FFE500", 2: "#C0C0C0", 3: "#CD7F32" };

export function LeaderboardPage() {
  const [tab, setTab] = useState<"global" | "weekly">("global");
  const leaders = tab === "global" ? GLOBAL_LEADERS : WEEKLY_LEADERS;

  return (
    <div style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-[#FFE500] border-[2px] border-black flex items-center justify-center">
            <Trophy className="w-4 h-4 text-black" />
          </div>
          <h1 className="uppercase tracking-tight text-black" style={{ fontWeight: 900, fontSize: "1.6rem", lineHeight: 1.1 }}>LEADERBOARD</h1>
        </div>
        <p className="text-[#666] text-xs uppercase tracking-widest ml-11" style={{ fontWeight: 600 }}>COMPETE WITH LEARNERS WORLDWIDE</p>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-0 mb-8 border-[3px] border-black w-fit">
        {(["global", "weekly"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-6 py-3 uppercase tracking-widest text-sm transition-colors"
            style={{ fontWeight: 900, background: tab === t ? "#000" : "#fff", color: tab === t ? "#FFE500" : "#000" }}>
            {t === "global" ? "🌏 ALL TIME" : "⚡ THIS WEEK"}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-0 mb-8 max-w-2xl mx-auto">
        {/* 2nd */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex flex-col items-center gap-2 pt-8">
          <div className="w-16 h-16 bg-[#C0C0C0] border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0_#000]">
            <span className="text-white" style={{ fontWeight: 900, fontSize: "1.4rem" }}>{leaders[1]?.name.charAt(0)}</span>
          </div>
          <div className="text-center">
            <p className="text-black text-xs uppercase" style={{ fontWeight: 800 }}>{leaders[1]?.name}</p>
            <span className="text-[9px] px-1.5 py-0.5 uppercase border-[1.5px] border-black" style={{ fontWeight: 800, background: leaders[1]?.levelBg, color: leaders[1]?.levelColor }}>{leaders[1]?.level}</span>
          </div>
          <div className="w-full border-[3px] border-black flex flex-col items-center justify-end py-3" style={{ background: "#C0C0C0", height: "70px" }}>
            <p className="text-white text-lg" style={{ fontWeight: 900 }}>2</p>
          </div>
          <p className="text-[#888] text-xs uppercase" style={{ fontWeight: 700 }}>{leaders[1]?.xp} XP</p>
        </motion.div>

        {/* 1st */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col items-center gap-2">
          <Crown className="w-6 h-6 text-[#FFE500]" fill="#FFE500" />
          <div className="w-20 h-20 bg-[#FFE500] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0_#000]">
            <span className="text-black" style={{ fontWeight: 900, fontSize: "1.8rem" }}>{leaders[0]?.name.charAt(0)}</span>
          </div>
          <div className="text-center">
            <p className="text-black text-xs uppercase" style={{ fontWeight: 800 }}>{leaders[0]?.name}</p>
            <span className="text-[9px] px-1.5 py-0.5 uppercase border-[1.5px] border-black" style={{ fontWeight: 800, background: leaders[0]?.levelBg, color: leaders[0]?.levelColor }}>{leaders[0]?.level}</span>
          </div>
          <div className="w-full border-[3px] border-black flex flex-col items-center justify-end py-3" style={{ background: "#FFE500", height: "100px" }}>
            <p className="text-black text-xl" style={{ fontWeight: 900 }}>1</p>
          </div>
          <p className="text-[#888] text-xs uppercase" style={{ fontWeight: 700 }}>{leaders[0]?.xp} XP</p>
        </motion.div>

        {/* 3rd */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="flex flex-col items-center gap-2 pt-12">
          <div className="w-14 h-14 bg-[#CD7F32] border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0_#000]">
            <span className="text-white" style={{ fontWeight: 900, fontSize: "1.2rem" }}>{leaders[2]?.name.charAt(0)}</span>
          </div>
          <div className="text-center">
            <p className="text-black text-xs uppercase" style={{ fontWeight: 800 }}>{leaders[2]?.name}</p>
            <span className="text-[9px] px-1.5 py-0.5 uppercase border-[1.5px] border-black" style={{ fontWeight: 800, background: leaders[2]?.levelBg, color: leaders[2]?.levelColor }}>{leaders[2]?.level}</span>
          </div>
          <div className="w-full border-[3px] border-black flex flex-col items-center justify-end py-3" style={{ background: "#CD7F32", height: "50px" }}>
            <p className="text-white text-base" style={{ fontWeight: 900 }}>3</p>
          </div>
          <p className="text-[#888] text-xs uppercase" style={{ fontWeight: 700 }}>{leaders[2]?.xp} XP</p>
        </motion.div>
      </div>

      {/* Rank table: 4–10 */}
      <div className="flex flex-col gap-0 mb-4">
        {leaders.slice(3).map((user, i) => (
          <motion.div key={user.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }}
            className="flex items-center gap-4 px-5 py-4 border-[2.5px] border-black bg-white transition-all hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5"
            style={{ marginTop: i > 0 ? "-2.5px" : "0" }}>
            {/* Rank number */}
            <div className="w-8 h-8 border-[2px] border-black flex items-center justify-center flex-shrink-0" style={{ background: "#f5f5f5" }}>
              <span className="text-black text-xs" style={{ fontWeight: 900 }}>#{user.rank}</span>
            </div>
            {/* Avatar */}
            <div className="w-10 h-10 border-[2px] border-black flex items-center justify-center flex-shrink-0" style={{ background: user.levelBg }}>
              <span style={{ fontWeight: 900, fontSize: "0.9rem", color: user.levelColor }}>{user.name.charAt(0)}</span>
            </div>
            {/* Name + level */}
            <div className="flex-1 min-w-0">
              <p className="text-black text-sm uppercase" style={{ fontWeight: 900 }}>{user.name}</p>
              <span className="text-[9px] px-1.5 py-0.5 uppercase border-[1.5px] border-black" style={{ fontWeight: 800, background: user.levelBg, color: user.levelColor }}>{user.level}</span>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#FF6D00]" fill="#FF6D00" />
                <span className="text-xs uppercase" style={{ fontWeight: 700, color: "#888" }}>{user.streak}D</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#00C853]" />
                <span className="text-xs uppercase" style={{ fontWeight: 700, color: "#888" }}>{user.accuracy}%</span>
              </div>
              <div className="flex items-center gap-1 bg-black px-2.5 py-1 border-[2px] border-black">
                <Star className="w-3 h-3 text-[#FFE500]" fill="#FFE500" />
                <span className="text-[#FFE500] text-xs uppercase" style={{ fontWeight: 900 }}>{user.xp}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Your rank (pinned) */}
      <div className="border-[3px] border-black bg-[#FFE500] shadow-[5px_5px_0_#000] px-5 py-4 flex items-center gap-4">
        <div className="w-8 h-8 bg-black flex items-center justify-center flex-shrink-0">
          <span className="text-[#FFE500] text-xs" style={{ fontWeight: 900 }}>#{YOU.rank}</span>
        </div>
        <div className="w-10 h-10 border-[2px] border-black flex items-center justify-center flex-shrink-0" style={{ background: YOU.levelBg }}>
          <span style={{ fontWeight: 900, fontSize: "0.9rem", color: YOU.levelColor }}>{YOU.name.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-black text-sm uppercase" style={{ fontWeight: 900 }}>{YOU.name} <span className="text-[#888] text-xs">(YOU)</span></p>
          <span className="text-[9px] px-1.5 py-0.5 uppercase border-[1.5px] border-black" style={{ fontWeight: 800, background: YOU.levelBg, color: YOU.levelColor }}>{YOU.level}</span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-1 bg-black px-2.5 py-1 border-[2px] border-black">
            <Star className="w-3 h-3 text-[#FFE500]" fill="#FFE500" />
            <span className="text-[#FFE500] text-xs uppercase" style={{ fontWeight: 900 }}>{YOU.xp} XP</span>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-[#aaa] mt-3 uppercase tracking-widest" style={{ fontWeight: 600 }}>EARN MORE XP TO CLIMB THE RANKS</p>
    </div>
  );
}
