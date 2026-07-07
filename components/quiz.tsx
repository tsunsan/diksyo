"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
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
  Brain,
  Zap,
  MousePointerClick,
  BookOpenCheck,
  Package,
  Search,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getVaultWordCount, seedStarterPack } from "@/app/actions/vault";

const LEARNING_MODES = [
  { id: "affix", title: "Affix Builder", desc: "Construct words from roots.", icon: Blocks, available: false },
  { id: "classic", title: "Classic Recognition", desc: "Translate Tagalog to English.", icon: Eye, available: false },
  { id: "production", title: "Production", desc: "Type the Tagalog translation.", icon: Keyboard, available: false },
  { id: "advanced", title: "Advanced Definition", desc: "Match definitions entirely in Tagalog.", icon: BookOpen, available: false },
  { id: "multiple", title: "Multiple Choice", desc: "Select from four options.", icon: List, available: false },
];

const MASTERY_MODES = [
  { id: "time", title: "Time Attack", desc: "Race against the clock in this high-speed typing challenge.", icon: Timer, customBg: "#0057FF", customText: "#fff" },
  { id: "cloze", title: "Cloze Deletion", desc: "Test your comprehension by filling in the missing words.", icon: Puzzle, customBg: "#FF6D00", customText: "#fff" },
];

const ALL_MODES = [...LEARNING_MODES, ...MASTERY_MODES];

/* ── Mode Preview Content ── */
function ModePreviewContent({ modeId }: { modeId: string | null }) {
  if (!modeId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
        <MousePointerClick className="w-12 h-12 text-[#bbb]" strokeWidth={1.5} />
        <div>
          <p className="text-[#999] text-xs uppercase tracking-widest mb-1" style={{ fontWeight: 800 }}>No mode selected</p>
          <p className="text-[#bbb] text-[11px] uppercase tracking-wider" style={{ fontWeight: 600 }}>Pick a mode to see its preview</p>
        </div>
      </div>
    );
  }

  switch (modeId) {
    case "affix":
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#999] mb-2" style={{ fontWeight: 800 }}>Build the word</p>
            <h4 className="text-black text-2xl mb-1" style={{ fontWeight: 900 }}>&quot;to write&quot;</h4>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {["mag-", "sulat", "-an", "pag-"].map((part, i) => (
              <span key={i} className={`border-[2.5px] border-black px-3 py-1.5 text-xs uppercase tracking-wider ${i < 2 ? "bg-[#FFE500]" : "bg-white"}`} style={{ fontWeight: 800 }}>
                {part}
              </span>
            ))}
          </div>
          <div className="w-full mt-auto border-[3px] border-black border-dashed h-12 bg-[#FFFBF0] flex items-center justify-center gap-2">
            <span className="border-[2px] border-black bg-[#FFE500] px-2 py-0.5 text-[11px]" style={{ fontWeight: 800 }}>mag-</span>
            <span className="border-[2px] border-black bg-[#FFE500] px-2 py-0.5 text-[11px]" style={{ fontWeight: 800 }}>sulat</span>
            <span className="text-[#bbb] text-xs">+ ...</span>
          </div>
        </div>
      );

    case "classic":
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="text-center">
            <span className="inline-block border-[2.5px] border-black px-3 py-1 text-[10px] uppercase tracking-widest mb-3 bg-[#00C853] text-white" style={{ fontWeight: 900 }}>VERB</span>
            <h4 className="text-black text-3xl" style={{ fontWeight: 900 }}>Kumain</h4>
          </div>
          <div className="w-full mt-auto flex flex-col gap-2">
            <div className="border-[2.5px] border-black p-3 bg-white text-center hover:bg-[#FFE500] transition-colors">
              <span className="text-sm uppercase" style={{ fontWeight: 800 }}>To eat</span>
            </div>
            <div className="border-[2.5px] border-black p-3 bg-[#f5f5f5] text-center opacity-60">
              <span className="text-sm uppercase text-[#999]" style={{ fontWeight: 800 }}>To drink</span>
            </div>
          </div>
        </div>
      );

    case "production":
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="text-center">
            <span className="inline-block border-[2.5px] border-black px-3 py-1 text-[10px] uppercase tracking-widest mb-3 bg-[#00C853] text-white" style={{ fontWeight: 900 }}>NOUN</span>
            <h4 className="text-black text-3xl" style={{ fontWeight: 900 }}>Book</h4>
          </div>
          <div className="w-full mt-auto border-[3px] border-black border-dashed h-14 bg-[#FFFBF0] flex items-center justify-center opacity-80">
            <span className="text-[#666] text-xs uppercase tracking-widest" style={{ fontWeight: 800 }}>Type Tagalog translation...</span>
          </div>
        </div>
      );

    case "advanced":
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#999] mb-2" style={{ fontWeight: 800 }}>Ano ang kahulugan?</p>
            <h4 className="text-black text-2xl" style={{ fontWeight: 900 }}>Aklat</h4>
          </div>
          <div className="w-full mt-auto flex flex-col gap-2">
            <div className="border-[2.5px] border-black p-2.5 bg-white text-center">
              <span className="text-xs" style={{ fontWeight: 700 }}>Isang bagay na binabasa</span>
            </div>
            <div className="border-[2.5px] border-black p-2.5 bg-[#f5f5f5] text-center opacity-60">
              <span className="text-xs text-[#999]" style={{ fontWeight: 700 }}>Isang bagay na kinakain</span>
            </div>
          </div>
        </div>
      );

    case "multiple":
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="text-center">
            <span className="inline-block border-[2.5px] border-black px-3 py-1 text-[10px] uppercase tracking-widest mb-3 bg-[#7C3AED] text-white" style={{ fontWeight: 900 }}>ADJ</span>
            <h4 className="text-black text-3xl" style={{ fontWeight: 900 }}>Maganda</h4>
          </div>
          <div className="w-full mt-auto grid grid-cols-2 gap-2">
            {["Beautiful", "Ugly", "Tall", "Small"].map((opt, i) => (
              <div key={i} className={`border-[2.5px] border-black p-2.5 text-center ${i === 0 ? "bg-[#FFE500]" : "bg-white"}`}>
                <span className="text-[11px] uppercase" style={{ fontWeight: 800 }}>{opt}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "time":
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Timer className="w-5 h-5 text-[#FF4444]" />
              <span className="text-[#FF4444] text-xl font-mono" style={{ fontWeight: 900 }}>00:42</span>
            </div>
            <h4 className="text-black text-3xl" style={{ fontWeight: 900 }}>Bahay</h4>
          </div>
          <div className="w-full bg-[#f0f0f0] border-[2.5px] border-black h-3 overflow-hidden">
            <div className="h-full bg-[#FF4444] transition-all" style={{ width: "65%" }} />
          </div>
          <div className="w-full mt-auto border-[3px] border-black border-dashed h-14 bg-[#FFFBF0] flex items-center justify-center opacity-80">
            <span className="text-[#666] text-xs uppercase tracking-widest" style={{ fontWeight: 800 }}>Type fast...</span>
          </div>
        </div>
      );

    case "cloze":
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#999] mb-3" style={{ fontWeight: 800 }}>Fill in the blank</p>
            <p className="text-black text-lg leading-relaxed" style={{ fontWeight: 700 }}>
              Ang &nbsp;
              <span className="inline-block border-b-[3px] border-black px-4 py-0.5 bg-[#FFE500] min-w-[80px]">
                <span className="text-[#999] text-sm">?</span>
              </span>
              &nbsp; ay malaki.
            </p>
          </div>
          <div className="w-full mt-auto flex gap-2 justify-center flex-wrap">
            {["bahay", "aklat", "tao"].map((word, i) => (
              <span key={i} className="border-[2.5px] border-black px-3 py-1.5 text-xs uppercase bg-white hover:bg-[#FFE500] transition-colors cursor-pointer" style={{ fontWeight: 800 }}>
                {word}
              </span>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}

const MASTERY_MODE_IDS = new Set(MASTERY_MODES.map((m) => m.id));

export function QuizModeClient() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [vaultCount, setVaultCount] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentMode = ALL_MODES.find((m) => m.id === selectedMode);

  // Fetch vault word count on mount
  useEffect(() => {
    getVaultWordCount().then((res) => {
      if (res.success) setVaultCount(res.count);
    });
  }, []);

  function handleStartTraining() {
    if (!selectedMode) return;

    // Intercept mastery modes with too few words in vault
    if (MASTERY_MODE_IDS.has(selectedMode) && vaultCount !== null && vaultCount < 10) {
      setShowOnboarding(true);
      return;
    }

    router.push(`/quiz/${selectedMode}`);
  }

  function handleSeedStarterPack() {
    startTransition(async () => {
      const result = await seedStarterPack();
      if (result.success) {
        setVaultCount(result.count ?? 10);
        setShowOnboarding(false);
        router.push(`/quiz/${selectedMode}`);
      } else {
        console.error(result.error);
        alert(result.error || "Failed to add starter pack");
      }
    });
  }

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
              <div className="flex items-center gap-2 mt-2">
                <Brain className="w-3.5 h-3.5 text-[#888]" />
                <p className="text-[#888] text-[11px] uppercase tracking-wider" style={{ fontWeight: 700 }}>
                  Powered by spaced repetition &amp; the FSRS algorithm
                </p>
              </div>
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
              <span className="uppercase tracking-widest text-xs" style={{ fontWeight: 900 }}>
                {currentMode ? currentMode.title : "MODE PREVIEW"}
              </span>
              {currentMode ? <currentMode.icon className="w-5 h-5 text-black" /> : <MonitorPlay className="w-5 h-5 text-black" />}
            </div>
            
            {/* Dynamic preview content with animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMode ?? "empty"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <ModePreviewContent modeId={selectedMode} />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Start Button */}
          <button 
            disabled={!selectedMode}
            onClick={handleStartTraining}
            className={`group w-full flex items-center justify-center gap-3 py-5 border-[4px] border-black uppercase tracking-widest transition-all ${!selectedMode ? 'bg-[#ddd] text-[#999] cursor-not-allowed shadow-none translate-x-1.5 translate-y-1.5' : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none shadow-[6px_6px_0_#000]'}`} 
            style={{ fontWeight: 900, fontSize: "1.05rem" }}
          >
            START TRAINING
            <ArrowRight className={`w-5 h-5 ${selectedMode && 'group-hover:translate-x-1'} transition-transform`} />
          </button>

        </div>
      </div>

      {/* ── Mastery Onboarding Dialog ── */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent
          showCloseButton={!isPending}
          className="!rounded-none border-[4px] border-black shadow-[8px_8px_0_#000] bg-white p-0 max-w-md overflow-hidden"
        >
          {/* Header banner */}
          <div className="bg-[#FFE500] border-b-[3px] border-black px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="border-[3px] border-black bg-white p-2">
                <BookOpenCheck className="w-6 h-6 text-black" />
              </div>
              <div>
                <DialogHeader>
                  <DialogTitle className="text-black uppercase tracking-tight text-lg" style={{ fontWeight: 900 }}>
                    More words needed
                  </DialogTitle>
                </DialogHeader>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <DialogDescription className="text-[#333] text-sm leading-relaxed mb-1" style={{ fontWeight: 600 }}>
              Mastery modes use <span className="font-black">spaced repetition</span> to train you on words saved in your vault. You need at least 10 words to get started.
            </DialogDescription>

            <div className="flex items-center gap-2 mt-3 mb-6">
              <Brain className="w-3.5 h-3.5 text-[#888]" />
              <span className="text-[#888] text-[11px] uppercase tracking-wider" style={{ fontWeight: 700 }}>Powered by the FSRS algorithm</span>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSeedStarterPack}
                disabled={isPending}
                className="group w-full flex items-center gap-4 p-4 border-[3px] border-black bg-[#7C3AED] text-white shadow-[4px_4px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-70 disabled:cursor-wait"
              >
                {isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin shrink-0" />
                ) : (
                  <Package className="w-6 h-6 shrink-0 group-hover:rotate-12 transition-transform" />
                )}
                <div className="text-left">
                  <span className="block uppercase text-sm" style={{ fontWeight: 900 }}>
                    {isPending ? "Adding words..." : "Add Starter Pack"}
                  </span>
                  <span className="block text-[11px] text-white/70" style={{ fontWeight: 600 }}>10 common Tagalog words added to your vault</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowOnboarding(false);
                  router.push("/dictionary?onboarding=true");
                }}
                disabled={isPending}
                className="group w-full flex items-center gap-4 p-4 border-[3px] border-black bg-white text-black shadow-[4px_4px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
              >
                <Search className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <span className="block uppercase text-sm" style={{ fontWeight: 900 }}>Explore Dictionary</span>
                  <span className="block text-[11px] text-[#666]" style={{ fontWeight: 600 }}>Pick your own words to learn</span>
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
