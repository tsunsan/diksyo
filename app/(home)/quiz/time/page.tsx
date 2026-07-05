"use client";

import { useState, useRef, useEffect, useCallback, useTransition } from "react";
import { getVaultWords } from "@/app/actions/vault";
import { submitQuizAnswer } from "@/app/actions/quiz";
import {
  Zap,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Star,
  Flame,
  RefreshCw,
  Volume2,
  Timer as TimerIcon,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { POS_COLORS } from "@/lib/utils";
import Link from "next/link";
import { useTimeQuizStore } from "@/store/time-quiz-store";

const DIFF_COLORS: Record<string, string> = {
  BEGINNER: "#00C853",
  INTERMEDIATE: "#FDE047",
  ADVANCED: "#FF6D00",
};

type FeedbackState = "idle" | "correct" | "incorrect" | "timeout";

// Creative Confetti Component
const CreativeConfetti = () => {
  const pieces = Array.from({ length: 80 });
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: "110%", x: `${50}%`, scale: 0, rotate: 0 }}
          animate={{ y: "-10%", x: `${Math.random() * 100}%`, scale: [0, 1, 1, 0.5, 0], rotate: 720 }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeOut", delay: Math.random() * 5 }}
          style={{
            position: "absolute",
            width: "12px",
            height: "12px",
            backgroundColor: ["#FFE500", "#FF1744", "#00C853", "#0057FF", "#7C3AED"][Math.floor(Math.random() * 5)],
            clipPath: i % 3 === 0 ? "polygon(50% 0%, 0% 100%, 100% 100%)" : i % 3 === 1 ? "circle(50% at 50% 50%)" : "none",
          }}
        />
      ))}
    </div>
  );
};

// Animated Number Component
const AnimatedNumber = ({ value }: { value: number | string }) => (
  <motion.span key={value} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block">
    {value}
  </motion.span>
);

export default function QuizPage2() {
  const {
    deck,
    currentIndex,
    setCurrentIndex,
    feedback,
    setFeedback,
    totalXP,
    setTotalXP,
    streak,
    setStreak,
    maxStreak,
    setMaxStreak,
    results,
    setResults,
    quizDone,
    setQuizDone,
    hasSubmittedOnce,
    setHasSubmittedOnce,
    startQuiz,
    resetQuiz
  } = useTimeQuizStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showDetails, setShowDetails] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimation();
  const timerControls = useAnimation();

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVaultWords(true);
      if (res.success && res.data) {
        const words = res.data.map((item: any) => {
          const w = item.word;
          return {
            id: item.wordId,
            word: w.translation,
            englishPrompt: w.translation,
            partOfSpeech: w.partOfSpeech || "UNKNOWN",
            rootWord: w.meaningFilipino || w.originalExplanation || "No Filipino meaning available",
            rootDefinition: w.usageNotes || "No notes available",
            usageExamples: Array.isArray(w.usageExamples) ? w.usageExamples : [],
            level: w.level || "BEGINNER",
            hint: w.usageNotes || "Translate this to Tagalog",
            xp: w.level === 'ADVANCED' ? 30 : w.level === 'INTERMEDIATE' ? 20 : 10,
            example: (Array.isArray(w.usageExamples) && w.usageExamples[0]) ? w.usageExamples[0].translation : "No example available.",
            answer: w.word,
            acceptedAnswers: [w.word]
          };
        });

        if (words.length > 0) {
          startQuiz(words.sort(() => 0.5 - Math.random()).slice(0, 10));
        } else {
          setError("No suitable words found in your vault.");
        }
      } else {
        setError(res.error || "Failed to load vocabulary.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [startQuiz]);

  useEffect(() => {
    if (deck.length === 0 && !error) loadQuiz();
    else if (deck.length > 0) setLoading(false);
  }, [deck.length, loadQuiz, error]);

  const current = deck[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((i: number) => i + 1);
      setAnswer("");
      setFeedback("idle");
      setFlipped(false);
      setTimeLeft(15);
    } else {
      setQuizDone(true);
    }
  }, [currentIndex, deck.length, setCurrentIndex, setFeedback, setQuizDone]);

  // --- Timer Logic ---
  useEffect(() => {
    if (feedback !== "idle" || quizDone || !current) return;

    if (timeLeft <= 0) {
      setFeedback("timeout");
      setResults((prev) => [...prev, { id: current.id, correct: false, timeBonus: false, xpGained: 0, newMastery: 0, level: current.level || "BEGINNER" }]);
      setStreak(0);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, feedback, quizDone, current, setFeedback, setResults, setStreak]);

  // --- Urgency Effects ---
  useEffect(() => {
    if (timeLeft <= 5 && feedback === "idle") {
      timerControls.start({
        scale: [1, 1.2, 1],
        color: ["#000", "#FF1744", "#000"],
        transition: { duration: 0.5, repeat: Infinity }
      });
    } else {
      timerControls.stop();
      timerControls.set({ scale: 1, color: "#000" });
    }
  }, [timeLeft, feedback, timerControls]);

  useEffect(() => {
    if (feedback === "idle" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [feedback, currentIndex]);

  // --- Enter to Next Challenge ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && feedback !== "idle" && !quizDone) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [feedback, quizDone, handleNext]);


  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
         <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-16 h-16 bg-[#FFE500] border-4 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-black" strokeWidth={3} />
         </motion.div>
      </div>
    );
  }

  if (error || !current) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center p-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white border-[4px] border-black p-8 shadow-[12px_12px_0_0_#000] max-w-md w-full text-center">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-black mb-2">Vault Empty</h2>
            <p className="font-bold text-sm uppercase text-gray-500 mb-8">{error || "No valid words available."}</p>
            <Link href="/vault" className="inline-block w-full bg-[#FFE500] text-black font-black uppercase text-lg border-[3px] border-black px-6 py-4 hover:translate-x-1 hover:translate-y-1 shadow-[6px_6px_0_0_#000] hover:shadow-none transition-all">Return to Vault</Link>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || feedback !== "idle" || isPending) return;

    if (!hasSubmittedOnce) setHasSubmittedOnce(true);

    startTransition(async () => {
      const timeTakenMs = (15 - timeLeft) * 1000;
      const res = await submitQuizAnswer({
         wordId: current.id,
         userAnswer: answer,
         gameMode: "time",
         timeTakenMs,
         acceptedAnswers: current.acceptedAnswers
      });

      if (res.success) {
         const isCorrect = res.correct || false;
         const timeBonus = isCorrect && timeLeft > 10;
         setFeedback(isCorrect ? "correct" : "incorrect");
         
         setResults(prev => [...prev, {
            id: current.id,
            correct: isCorrect,
            timeBonus,
            xpGained: res.xpGained || 0,
            level: res.level || "BEGINNER",
            newMastery: res.newMastery || 0
         }]);

         if (isCorrect) {
            setTotalXP(prev => prev + (res.xpGained || 0));
            setStreak(prev => {
              const newStreak = prev + 1;
              setMaxStreak(max => (newStreak > max ? newStreak : max));
              return newStreak;
            });
         } else {
            setStreak(0);
            await controls.start({ x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } });
         }
      } else {
         setFeedback("incorrect");
         setStreak(0);
         await controls.start({ x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } });
      }
    });
  };

  const handleRestart = () => {
    resetQuiz();
    setAnswer("");
    setFlipped(false);
    setTimeLeft(15);
    setShowDetails(false);
  };

  const correctCount = results.filter((r) => r.correct).length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  const cardBg =
    feedback === "correct"
      ? "#00C853"
      : feedback === "incorrect" || feedback === "timeout"
      ? "#FF1744"
      : "#fff";

  const cardTextColor =
    feedback === "idle" ? "#000" : "#fff";

  // Quiz Done screen
  if (quizDone) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: "'Geist', 'Inter', sans-serif" }} className="relative overflow-hidden min-h-[600px] flex items-center justify-center">
        {accuracy >= 80 && <CreativeConfetti />}
        <div className="absolute inset-0 -z-10">
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -top-20 -left-20 w-64 h-64 bg-[#FFE500]/10 rounded-full blur-3xl" />
          <motion.div animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#0057FF]/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-2xl w-full mx-auto p-4">
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }} className="inline-block p-4 bg-[#FFE500] border-[4px] border-black shadow-[8px_8px_0_#000] mb-6">
              <Zap className="w-12 h-12 text-black" />
            </motion.div>
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="uppercase tracking-tighter text-black" style={{ fontWeight: 900, fontSize: "3.5rem", lineHeight: 0.9 }}>
              QUIZ<br/>COMPLETE!
            </motion.h1>
          </div>
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-black border-[3px] border-black shadow-[12px_12px_0_#FFE500] p-10 text-center mb-10 relative overflow-hidden">
            <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatDelay: 3 }} className="absolute inset-y-0 w-1/2 bg-white/10 skew-x-[-20deg]" />
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.6 }} className="text-[#FFE500] text-8xl mb-4 font-black italic">{accuracy}%</motion.div>
            <p className="text-white uppercase tracking-widest text-sm mb-8 font-bold">ACCURACY RATE</p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: "CORRECT", value: correctCount, color: "#00C853" },
                { label: "STREAK", value: maxStreak, color: "#FF6D00" },
                { label: "XP", value: totalXP, color: "#FFE500" },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8 + i * 0.1, type: "spring" }} className="bg-[#111] border-[2px] border-[#333] p-4 relative">
                  <div className="text-3xl mb-1 font-black" style={{ color: stat.color }}><AnimatedNumber value={stat.value} /></div>
                  <div className="text-[#666] text-[10px] uppercase tracking-widest font-bold">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="mb-8">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full py-4 bg-white border-[4px] border-black shadow-[8px_8px_0_#000] uppercase font-black tracking-widest flex items-center justify-between px-6 transition-all hover:bg-gray-50 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              <span className="text-black">VIEW DETAILED RESULTS</span>
              <motion.div animate={{ rotate: showDetails ? 180 : 0 }}>
                <ChevronDown className="w-6 h-6 text-black" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-4 mt-6 max-h-[250px] overflow-y-auto">
                    {results.map((r, i) => {
                      const w = deck.find((q) => q.id === r.id)!;
                      return (
                        <motion.div
                          key={r.id + "-" + i}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-[3px] border-black shadow-[4px_4px_0_#000] ${r.correct ? "bg-white" : "bg-[#FF1744]/10"}`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                             <div className={`w-12 h-12 border-[3px] border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_#000] ${r.correct ? "bg-[#00C853]" : "bg-[#FF1744]"}`}>
                               {r.correct ? <Check className="w-8 h-8 text-white" /> : <X className="w-8 h-8 text-white" />}
                             </div>
                             <div className="text-left">
                               <span className="text-black uppercase font-black text-xl block leading-none mb-1">
                                 {w.word}
                               </span>
                               <span className="text-[#666] text-xs uppercase tracking-wider font-bold">
                                 EXPECTED: {w.answer}
                               </span>
                               <div className="mt-2 text-[10px] font-black tracking-widest text-black/60 uppercase">MASTERY: {r.newMastery}%</div>
                             </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0">
                            <span className={`px-2 py-1 mb-2 text-[10px] font-black uppercase shadow-[2px_2px_0_0_#000] border-2 border-black ${r.level === 'ADVANCED' ? 'bg-[#FF6D00] text-white' : r.level === 'INTERMEDIATE' ? 'bg-[#FDE047] text-black' : 'bg-[#00C853] text-black'}`}>{r.level}</span>
                            <span className={`text-sm uppercase tracking-wider px-3 py-1 border-[2.5px] border-black font-black shadow-[2px_2px_0_#000] ${r.correct ? "bg-[#FFE500] text-black" : "bg-black text-white"}`}>
                              {r.correct ? `+${r.xpGained} XP` : "MISS"}
                            </span>
                            {r.timeBonus && <span className="text-[10px] font-black text-[#FF6D00] mt-1 tracking-wider uppercase">SPEED BONUS!</span>}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 w-full mb-12">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRestart} className="flex-1 py-6 bg-[#FFE500] border-[4px] border-black shadow-[8px_8px_0_#000] uppercase font-black tracking-widest text-xl transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none flex items-center justify-center">
              <RefreshCw className="w-6 h-6 inline mr-2" /> TRY AGAIN
            </motion.button>
            <Link 
              href="/dictionary" 
              className="flex-1 bg-white text-black border-[4px] border-black py-6 font-black text-xl uppercase tracking-widest hover:translate-x-[4px] hover:translate-y-[4px] shadow-[8px_8px_0_#000] hover:shadow-none transition-all flex items-center justify-center active:scale-95"
            >
              Exit
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ fontFamily: "'Geist', 'Inter', sans-serif" }} className="max-w-3xl mx-auto px-4 py-8">
      {/* HUD Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-6">
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <div className="flex items-center gap-4 mb-2">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="w-10 h-10 bg-[#FFE500] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0_#000]">
              <Zap className="w-6 h-6 text-black" />
            </motion.div>
            <h1 className="uppercase tracking-tighter text-black font-black text-[2rem]">TIME ATTACK </h1>
          </div>
          <div className="flex gap-2 ml-14">
             {deck.map((_, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} className="w-2 h-2 border-[1.5px] border-black" style={{ background: i < results.length ? (results[i].correct ? "#00C853" : "#FF1744") : (i === currentIndex ? "#FFE500" : "#ddd") }} />
            ))}
          </div>
        </motion.div>

        <div className="flex gap-4">
          <motion.div animate={timerControls} className="bg-white border-[3px] border-black px-5 py-3 flex items-center gap-3 shadow-[4px_4px_0_#000]">
            <TimerIcon className={`w-5 h-5 ${timeLeft <= 5 ? 'text-[#FF1744]' : 'text-black'}`} />
            <span className="text-xl font-black">{timeLeft}s</span>
          </motion.div>
          <div className="bg-black border-[3px] border-black px-5 py-3 flex items-center gap-3 shadow-[4px_4px_0_#FFE500]">
            <Star className="w-5 h-5 text-[#FFE500]" />
            <span className="text-[#FFE500] uppercase text-lg font-black"><AnimatedNumber value={totalXP} /></span>
          </div>
          <div className="bg-[#FF6D00] border-[3px] border-black px-5 py-3 flex items-center gap-3 shadow-[4px_4px_0_#000]">
            <Flame className="w-5 h-5 text-white" />
            <span className="text-white uppercase text-lg font-black"><AnimatedNumber value={streak} /></span>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-end justify-between mb-3">
          <motion.span key={currentIndex} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-black">WORD {currentIndex + 1} / {deck.length}</motion.span>
          <span className="text-2xl uppercase tracking-tighter text-black font-black">{Math.round(((currentIndex) / deck.length) * 100)}%</span>
        </div>
        {/* FIX APPLIED HERE: ADDED `relative` */}
        <div className="relative w-full h-2 bg-white border-[3px] border-black overflow-hidden shadow-[2px_2px_0_#000]">
          <motion.div className="h-full bg-[#FFE500] border-r-[3px] border-black" initial={{ width: 0 }} animate={{ width: `${((currentIndex) / deck.length) * 100}%` }} transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }} />
          <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-y-0 w-20 bg-white/30 skew-x-[-20deg]" />
        </div>
      </div>

      <div className="relative">
        <motion.div animate={controls}>
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex + (flipped ? "-flipped" : "")} initial={{ y: 50, opacity: 0, rotateX: 20, scale: 0.9 }} animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }} exit={{ y: -50, opacity: 0, rotateX: -20, scale: 0.9 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="border-[4px] border-black shadow-[15px_15px_0_#000] p-12 mb-8 relative overflow-hidden min-h-[400px] flex flex-col justify-center" style={{ background: cardBg, perspective: "1000px", transformStyle: "preserve-3d" }}>
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "20px 20px" }} />
            {timeLeft <= 3 && feedback === "idle" && <motion.div animate={{ opacity: [0, 0.2, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="absolute inset-0 bg-red-600 pointer-events-none" />}
            
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
              <span className="px-4 py-2 border-[2.5px] border-black text-xs uppercase tracking-widest shadow-[4px_4px_0_#000] font-black" style={{ background: POS_COLORS[current.partOfSpeech]?.bg || "#333", color: POS_COLORS[current.partOfSpeech]?.text || "#fff" }}>{current.partOfSpeech}</span>
              <span className="px-4 py-2 border-[2.5px] border-black text-xs uppercase tracking-widest shadow-[4px_4px_0_#000] font-black" style={{ background: DIFF_COLORS[current.level || "BEGINNER"] || "#00C853", color: current.level === "ADVANCED" ? "#fff" : "#000" }}>{current.level || "BEGINNER"}</span>
            </div>

            {!flipped ? (
              <div className="text-center mt-8">
                <p className="uppercase tracking-[0.3em] text-[10px] mb-6 font-black" style={{ color: cardTextColor + "cc" }}>TRANSLATE TO TAGALOG</p>
                <div className="relative w-full max-w-full mx-auto mb-8">
                  <motion.div className="uppercase tracking-tighter font-black text-4xl sm:text-5xl md:text-[4.5rem] leading-[1.1] md:leading-[0.9] flex flex-wrap justify-center items-center break-words" style={{ color: cardTextColor }}>
                    {current.word.split(" ").map((wordStr, wordIdx) => (
                      <span key={wordIdx} className="inline-flex flex-wrap justify-center mr-3 last:mr-0 md:mr-6">
                        {wordStr.split("").map((char, i) => (
                          <motion.span key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 + (wordIdx * 5 + i) * 0.02, type: "spring", stiffness: 400, damping: 25 }} className="inline-block break-all">{char}</motion.span>
                        ))}
                      </span>
                    ))}
                  </motion.div>
                </div>
                <p className="text-lg uppercase tracking-wider mb-8 italic font-bold" style={{ color: feedback === "idle" ? "#555" : "#fffcc" }}>"{current.example}"</p>
                {feedback === "idle" && <div className="inline-block px-6 py-3 border-[3px] border-black/10 bg-black/5"><p className="text-[10px] uppercase tracking-widest text-[#888] font-black">HINT: {current.hint}</p></div>}
                
                <AnimatePresence>
                  {feedback !== "idle" && (
                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute inset-0 flex items-center justify-center backdrop-blur-md bg-black/40 z-10 p-12">
                      <div className="text-center">
                        {feedback === "correct" ? (
                          <motion.div>
                            <div className="w-24 h-24 bg-white border-[4px] border-black flex items-center justify-center mx-auto mb-6 shadow-[8px_8px_0_#000]"><Check className="w-16 h-16 text-[#00C853]" /></div>
                            <h2 className="text-white uppercase font-black text-[3rem]">EXCELLENT!</h2>
                            {timeLeft > 10 && <p className="text-[#FFE500] font-black text-sm uppercase mt-1">+5 SPEED BONUS</p>}
                          </motion.div>
                        ) : (
                          <motion.div>
                            <div className="w-24 h-24 bg-white border-[4px] border-black flex items-center justify-center mx-auto mb-6 shadow-[8px_8px_0_#000]"><X className="w-16 h-16 text-[#FF1744]" /></div>
                            <h2 className="text-white uppercase font-black text-[3rem]">{feedback === "timeout" ? "TIME UP!" : "NOT QUITE!"}</h2>
                            <div className="mt-4 px-4 py-2 bg-[#FF1744] text-white inline-block border-[3px] border-white font-black text-xs">ANSWER: {(current.answer || "").toUpperCase()}</div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} className="text-center mt-8">
                <div className="relative inline-block mb-10 w-[90%] sm:w-auto max-w-full">
                  <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -inset-4 bg-[#FFE500] border-[4px] border-black -z-10 shadow-[8px_8px_0_#000]" />
                  <div className="px-6 py-6 sm:px-10 break-words">
                    <p className="text-[10px] uppercase font-black text-black/40 mb-2">FILIPINO MEANING</p>
                    <h2 className="uppercase tracking-tighter text-black font-black text-2xl sm:text-3xl md:text-4xl leading-tight break-words">{current.rootWord}</h2>
                  </div>
                </div>
                <p className="text-xl text-black/70 uppercase tracking-widest px-10 mb-8 font-black">{current.rootDefinition}</p>
              </motion.div>
            )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -right-12 top-1/2 -z-10 opacity-10"><Star className="w-32 h-32 text-black" /></motion.div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 relative">
        <div className="flex gap-4">
          <input ref={inputRef} type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={feedback !== "idle" || isPending} placeholder={feedback !== "idle" || isPending ? "" : "TYPE IN TAGALOG..."} className={`flex-1 px-8 py-6 bg-white border-[4px] border-black outline-none shadow-[8px_8px_0_#000] focus:shadow-[12px_12px_0_#000] transition-all uppercase text-xl placeholder:text-[#ccc] font-black ${isPending ? 'bg-gray-100 opacity-60 animate-pulse' : ''} disabled:bg-[#eee]`} />
          <motion.button whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }} type="submit" disabled={feedback !== "idle" || !answer.trim() || isPending} className="px-10 py-6 bg-black text-[#FFE500] border-[4px] border-black shadow-[8px_8px_0_#FFE500] uppercase font-black transition-all flex items-center justify-center gap-3 disabled:opacity-40 hover:bg-[#111] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
            {isPending ? <RefreshCw className="w-6 h-6 animate-spin" /> : <span>CHECK</span>}
            {!isPending && <kbd className="font-sans text-[8px] sm:text-[10px] font-bold bg-white text-black px-1.5 py-0.5 border-2 border-white shadow-[2px_2px_0_#FFE500] group-hover:shadow-none">ENTER ↵</kbd>}
          </motion.button>
        </div>
      </form>

      <div className="flex gap-4 flex-wrap items-center">
        <motion.button whileHover={{ y: -4, boxShadow: "6px 6px 0 #000" }} whileTap={{ y: 0, boxShadow: "none" }} onClick={() => setFlipped(!flipped)} className="flex items-center gap-3 px-6 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0_#000] uppercase font-black text-sm transition-all"><RotateCcw className={`w-5 h-5 transition-transform duration-500 ${flipped ? "rotate-180" : ""}`} />{flipped ? "HIDE MEANING" : "VIEW MEANING"}</motion.button>
        <button className="flex items-center gap-3 px-6 py-4 bg-[#f0f0f0] border-[3px] border-black shadow-[4px_4px_0_#000] uppercase font-black text-sm transition-all cursor-not-allowed group relative">
          <Volume2 className="w-5 h-5 text-[#888]" />
          <span className="text-[#888]">PRONOUNCE</span>
          <span className="absolute -center-10 left-1/2 -translate-x-1/2 z-50 bg-[#FDE047] text-black border-[2px] border-black font-black text-[10px] uppercase px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-[4px_4px_0_#000] whitespace-nowrap pointer-events-none">
            Coming Soon
          </span>
        </button>
        <AnimatePresence>
          {feedback !== "idle" && (
            <motion.button initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }} whileHover={{ x: 10, backgroundColor: "#000", color: "#fff" }} onClick={handleNext} className="ml-auto flex items-center gap-4 px-10 py-4 bg-[#FFE500] text-black border-[4px] border-black shadow-[6px_6px_0_#000] uppercase font-black transition-all">
              {currentIndex < deck.length - 1 ? "NEXT CHALLENGE" : "FINISH"} <ChevronRight className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
