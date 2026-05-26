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
  { id: "affix", title: "Affix Builder", desc: "Construct words from roots.", icon: Blocks, available: true },
  { id: "classic", title: "Classic Recognition", desc: "Translate Tagalog to English.", icon: Eye, available: false },
  { id: "production", title: "Production", desc: "Type the Tagalog translation.", icon: Keyboard, available: false },
  { id: "advanced", title: "Advanced Definition", desc: "Match definitions entirely in Tagalog.", icon: BookOpen, available: false },
  { id: "multiple", title: "Multiple Choice", desc: "Select from four options.", icon: List, available: false },
];

const MASTERY_MODES = [
  { id: "time", title: "Time Attack", desc: "Race against the clock in this high-speed typing challenge.", icon: Timer, customBg: "#0057FF", customText: "#fff" },
  { id: "cloze", title: "Cloze Deletion", desc: "Test your comprehension by filling in the missing words.", icon: Puzzle, customBg: "#FF6D00", customText: "#fff" },
];

export function QuizModeClient() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  return (
    <>
      {/* ── Header Section ── */}
      <div className="mb-12">
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

          {/* Mastery Modes */}
          <section>
                        <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎓</span>
                <h2 className="text-black uppercase tracking-widest text-lg" style={{ fontWeight: 900 }}>Mastery Modes</h2>
              </div>
              <hr className="border-black border-t-[3px] mb-3" />
              <p className="text-[#555] text-sm uppercase tracking-widest" style={{ fontWeight: 800 }}>Focused training based on the words saved in your vault.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MASTERY_MODES.map((mode, i) => {
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
                    className={`relative border-[3px] border-black p-5 flex flex-col gap-4 transition-all overflow-hidden group ${
                      isSelected ? "cursor-pointer translate-x-1 translate-y-1 shadow-none" : "cursor-pointer shadow-[4px_4px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
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

          {/* Arcade/Learning Modes */}
          <section>
             <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎮</span>
                <h2 className="text-black uppercase tracking-widest text-lg" style={{ fontWeight: 900 }}>Arcade Modes</h2>
              </div>
              <hr className="border-black border-t-[3px] mb-3" />
              <p className="text-[#555] text-sm uppercase tracking-widest" style={{ fontWeight: 800 }}>Random fun games to test your speed and reflexes.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LEARNING_MODES.map((mode, i) => {
                const isSelected = selectedMode === mode.id;
                const Icon = mode.icon;
                const isAvailable = mode.available !== false;
                
                return (
                  <motion.div
                    key={mode.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    onClick={() => { if (isAvailable) setSelectedMode(mode.id); }}
                    className={`relative border-[3px] border-black p-5 flex flex-col gap-4 transition-all group ${
                      !isAvailable ? "cursor-not-allowed bg-[#f0f0f0] opacity-80 shadow-[2px_2px_0_#000]" :
                      isSelected ? "cursor-pointer translate-x-1 translate-y-1 shadow-none bg-[#FFE500]" : "cursor-pointer bg-white shadow-[4px_4px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    }`}
                  >
                    {!isAvailable && (
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#FDE047] text-black border-[2px] border-black font-black text-[12px] uppercase px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-[4px_4px_0_#000] whitespace-nowrap pointer-events-none">
                        Coming Soon
                      </span>
                    )}
                    {isSelected && isAvailable && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-6 h-6 text-black" fill="#fff" />
                      </div>
                    )}
                    <Icon className={`w-7 h-7 ${!isAvailable ? 'text-[#888]' : 'text-black'} ${!isSelected && isAvailable && 'group-hover:scale-110 transition-transform'}`} />
                    <div>
                      <h3 className={`uppercase mb-1 ${!isAvailable ? 'text-[#888]' : 'text-black'}`} style={{ fontWeight: 900, fontSize: "0.9rem" }}>{mode.title}</h3>
                      <p className="text-xs" style={{ fontWeight: 600, color: !isAvailable ? '#aaa' : isSelected ? "#333" : "#666" }}>{mode.desc}</p>
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
          <button 
            disabled={!selectedMode}
            className={`group w-full flex items-center justify-center gap-3 py-5 border-[4px] border-black uppercase tracking-widest transition-all ${!selectedMode ? 'bg-[#999] text-[#555] cursor-not-allowed shadow-none translate-x-1.5 translate-y-1.5' : 'bg-black text-[#FFE500] hover:bg-[#111] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none shadow-[6px_6px_0_#FFE500]'}`} 
            style={{ fontWeight: 900, fontSize: "1.05rem" }}
          >
            START TRAINING
            <ArrowRight className={`w-5 h-5 ${selectedMode && 'group-hover:translate-x-1'} transition-transform`} />
          </button>

        </div>
      </div>
    </>
  );
}
