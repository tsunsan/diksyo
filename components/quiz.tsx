"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Gamepad2,
  Eye,
  Keyboard,
  Puzzle,
  BookOpen,
  List,
  Blocks,
  Timer,
  Flame,
  CheckCircle2,
  MonitorPlay,
  ArrowRight,
} from "lucide-react";

const LEARNING_MODES = [
  { id: "classic", title: "Classic Recognition", desc: "Translate Tagalog to English.", icon: Eye },
  { id: "production", title: "Production", desc: "Type the Tagalog translation.", icon: Keyboard },
  { id: "cloze", title: "Cloze Deletion", desc: "Fill in the missing words.", icon: Puzzle },
  { id: "advanced", title: "Advanced Definition", desc: "Match definitions entirely in Tagalog.", icon: BookOpen },
  { id: "multiple", title: "Multiple Choice", desc: "Select from four options.", icon: List },
  { id: "affix", title: "Affix Builder", desc: "Construct words from roots.", icon: Blocks },
];

const ARCADE_MODES = [
  { id: "time", title: "Time Attack", desc: "Race against the clock.", icon: Timer, customBg: "#0057FF", customText: "#fff" },
  { id: "streak", title: "Streak Survivor", desc: "One mistake and you're out.", icon: Flame, customBg: "#FF6D00", customText: "#fff" },
];

export function QuizModeClient() {
  const [selectedMode, setSelectedMode] = useState<string>("production");

  return (
    <>
      {/* ── Header Section ── */}
      <div className="mb-12">
        <Link
          href="/app/dashboard"
          className="inline-flex items-center gap-2 text-[#666] hover:text-black transition-colors uppercase tracking-widest text-xs mb-4"
          style={{ fontWeight: 800 }}
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard / Quick Quiz
        </Link>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-black uppercase italic tracking-tight"
          style={{ fontWeight: 900, fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: 1 }}
        >
          CHOOSE YOUR CHALLENGE
        </motion.h1>
      </div>

      {/* ── Two Column Layout ── */}
      <div className="flex flex-col md:flex-row gap-10 items-start">
        
        {/* ── Left Column: Modes Selection (65%) ── */}
        <div className="w-full md:w-[65%] flex flex-col gap-12">
          
          {/* Learning Modes */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <GraduationCap className="w-6 h-6 text-[#7C3AED]" />
              <h2 className="text-black uppercase tracking-widest text-lg" style={{ fontWeight: 900 }}>Learning Modes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LEARNING_MODES.map((mode, i) => {
                const isSelected = selectedMode === mode.id;
                const Icon = mode.icon;
                return (
                  <motion.div
                    key={mode.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`relative border-[3px] border-black p-5 flex flex-col gap-4 cursor-pointer transition-all group ${
                      isSelected ? "translate-x-1 translate-y-1 shadow-none" : "shadow-[4px_4px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    }`}
                    style={{ background: isSelected ? "#FFE500" : "#fff" }}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-6 h-6 text-black" fill="#fff" />
                      </div>
                    )}
                    <Icon className={`w-7 h-7 text-black ${!isSelected && 'group-hover:scale-110 transition-transform'}`} />
                    <div>
                      <h3 className="text-black uppercase mb-1" style={{ fontWeight: 900, fontSize: "0.9rem" }}>{mode.title}</h3>
                      <p className="text-xs" style={{ fontWeight: 600, color: isSelected ? "#333" : "#666" }}>{mode.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Arcade Modes */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <Gamepad2 className="w-6 h-6 text-[#FF6D00]" />
              <h2 className="text-black uppercase tracking-widest text-lg" style={{ fontWeight: 900 }}>Arcade Modes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ARCADE_MODES.map((mode, i) => {
                const isSelected = selectedMode === mode.id;
                const Icon = mode.icon;
                // If selected, it turns Yellow. If not, it uses its custom brutalist color.
                const bg = isSelected ? "#FFE500" : mode.customBg;
                const textColor = isSelected ? "#000" : mode.customText;
                const descColor = isSelected ? "#333" : "rgba(255,255,255,0.8)";

                return (
                  <motion.div
                    key={mode.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: (LEARNING_MODES.length * 0.05) + (i * 0.05) }}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`relative border-[3px] border-black p-5 flex flex-col gap-4 cursor-pointer transition-all overflow-hidden group ${
                      isSelected ? "translate-x-1 translate-y-1 shadow-none" : "shadow-[4px_4px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    }`}
                    style={{ background: bg }}
                  >
                    {/* Halftone Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, #000 2px, transparent 2.5px)`, backgroundSize: "16px 16px" }} />
                    
                    {isSelected && (
                      <div className="absolute top-3 right-3 z-10">
                        <CheckCircle2 className="w-6 h-6 text-black" fill="#fff" />
                      </div>
                    )}
                    <Icon className={`w-8 h-8 relative z-10 ${!isSelected && 'group-hover:rotate-12 group-hover:scale-110 transition-transform'}`} style={{ color: textColor }} />
                    <div className="relative z-10">
                      <h3 className="uppercase mb-1" style={{ fontWeight: 900, fontSize: "0.95rem", color: textColor }}>{mode.title}</h3>
                      <p className="text-xs" style={{ fontWeight: 600, color: descColor }}>{mode.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── Right Column: Preview & Action (35%) ── */}
        <div className="w-full md:w-[35%] flex flex-col gap-6 md:sticky md:top-24">
          
          {/* Mode Preview Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-[4px] border-black p-6 flex flex-col w-full aspect-square relative bg-white shadow-[6px_6px_0_#000]"
          >
            <div className="flex justify-between items-center border-b-[3px] border-black pb-3 mb-6">
              <span className="uppercase tracking-widest text-xs" style={{ fontWeight: 900 }}>MODE PREVIEW</span>
              <MonitorPlay className="w-5 h-5 text-black" />
            </div>
            
            {/* Wireframe inner content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="text-center">
                <span className="inline-block border-[2.5px] border-black px-3 py-1 text-[10px] uppercase tracking-widest mb-3 bg-[#00C853] text-white" style={{ fontWeight: 900 }}>NOUN</span>
                <h4 className="text-black text-4xl" style={{ fontWeight: 900 }}>Book</h4>
              </div>
              <div className="w-full mt-auto border-[3px] border-black border-dashed h-14 bg-[#FFFBF0] flex items-center justify-center opacity-80">
                <span className="text-[#666] text-xs uppercase tracking-widest" style={{ fontWeight: 800 }}>Type Tagalog translation...</span>
              </div>
            </div>
          </motion.div>

          {/* Start Button */}
          <button className="group w-full flex items-center justify-center gap-3 py-5 bg-black text-[#FFE500] border-[4px] border-black uppercase tracking-widest transition-all active:translate-x-1.5 active:translate-y-1.5 active:shadow-none hover:bg-[#111]" style={{ fontWeight: 900, fontSize: "1.05rem", boxShadow: "6px 6px 0 #FFE500" }}>
            START TRAINING
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </div>
    </>
  );
}
