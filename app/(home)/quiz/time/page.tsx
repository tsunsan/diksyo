"use client";

import { useState, useRef, useEffect, useCallback, useTransition } from "react";
import { getVaultWords, getQuizWords } from "@/app/actions/vault";
import { submitQuizAnswer, submitQuizSession } from "@/app/actions/quiz";
import {
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
  ArrowRight,
  Trophy,
  Coffee,
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
  const [pieces] = useState(() => Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 2,
    color: ["#FFE500", "#FF1744", "#00C853", "#0057FF", "#7C3AED"][Math.floor(Math.random() * 5)],
    shape: i % 3 === 0 ? "polygon(50% 0%, 0% 100%, 100% 100%)" : i % 3 === 1 ? "circle(50% at 50% 50%)" : "none"
  })));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ top: "110%", scale: 0, rotate: 0 }}
          animate={{ top: "-10%", scale: [0, 1, 1, 0.5, 0], rotate: 720 }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "easeOut", delay: p.delay }}
          style={{
            position: "absolute",
            left: p.left,
            width: "12px",
            height: "12px",
            backgroundColor: p.color,
            clipPath: p.shape,
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
    resetQuiz,
    quizStartTime,
    countsForStats,
    isExtraPractice
  } = useTimeQuizStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showDetails, setShowDetails] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [sessionSubmitted, setSessionSubmitted] = useState(false);
  const [showPracticeDialog, setShowPracticeDialog] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const pendingRequestsRef = useRef<Promise<any>[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimation();
  const timerControls = useAnimation();

  const correctCount = results.filter((r) => r.correct).length;

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getQuizWords("time");
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
          if (res.isExtraPractice) {
            setShowPracticeDialog(true);
          }
          startQuiz(words.sort(() => 0.5 - Math.random()), res.countsForStats, res.isExtraPractice);
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

  useEffect(() => {
    return () => {
      resetQuiz();
    };
  }, [resetQuiz]);

  useEffect(() => {
    if (quizDone && !sessionSubmitted && deck.length > 0) {
      setSessionSubmitted(true);
      const totalTimeMs = Date.now() - quizStartTime;
      const isPerfect = correctCount === deck.length;
      submitQuizSession({ isPerfect, timeTakenMs: totalTimeMs, countsForStats });
    }
  }, [quizDone, sessionSubmitted, quizStartTime, correctCount, deck.length, countsForStats]);

  const current = deck[currentIndex];

  const handleNext = useCallback(async () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((i: number) => i + 1);
      setAnswer("");
      setFeedback("idle");
      setFlipped(false);
      setTimeLeft(15);
    } else {
      setIsFinalizing(true);
      await Promise.all(pendingRequestsRef.current);
      setIsFinalizing(false);
      setQuizDone(true);
    }
  }, [currentIndex, deck.length, setCurrentIndex, setFeedback, setQuizDone]);

  // --- Timer Logic ---
  useEffect(() => {
    if (feedback !== "idle" || quizDone || !current || isPending || showPracticeDialog) return;

    if (timeLeft <= 0) {
      setFeedback("timeout");
      
      if (!hasSubmittedOnce) setHasSubmittedOnce(true);
      setStreak(0);

      const promise = submitQuizAnswer({
        wordId: current.id,
        userAnswer: "",
        gameMode: "time",
        timeTakenMs: 15000,
        acceptedAnswers: current.acceptedAnswers,
        countsForStats
      }).then(res => {
        setResults((prev) => [...prev, { 
          id: current.id, 
          correct: false, 
          timeBonus: false, 
          xpGained: res.success ? (res.xpGained || 0) : 0, 
          newMastery: res.success ? (res.newMastery || 0) : 0, 
          level: current.level || "BEGINNER" 
        }]);
      }).catch(err => {
        setResults((prev) => [...prev, { 
          id: current.id, correct: false, timeBonus: false, xpGained: 0, newMastery: 0, level: current.level || "BEGINNER" 
        }]);
      });

      pendingRequestsRef.current.push(promise);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, feedback, quizDone, current, isPending, setFeedback, setResults, setStreak]);

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
      if (e.key === "Enter" && feedback !== "idle" && !quizDone && !isFinalizing) {
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

  if (showPracticeDialog) {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ y: 40, opacity: 0, rotate: -2 }} 
          animate={{ y: 0, opacity: 1, rotate: 0 }} 
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white border-[4px] border-black shadow-[12px_12px_0_0_#000] max-w-md w-full relative overflow-hidden"
        >
          {/* Top accent bar */}
          <div className="w-full h-3 bg-[#FFE500] border-b-[4px] border-black" />
          
          {/* Diagonal stripe decoration */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#FFE500] border-[4px] border-black rotate-12 opacity-20" />
          <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-black rotate-45 opacity-5" />

          <div className="p-6 sm:p-8 text-center">
            {/* Trophy icon */}
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
              className="w-20 h-20 bg-[#FFE500] border-[4px] border-black flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0_0_#000]"
            >
              <Trophy className="w-10 h-10 text-black" strokeWidth={2.5} />
            </motion.div>

            <motion.h2 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-black mb-1"
            >
              Queue Cleared!
            </motion.h2>
            
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="inline-flex items-center gap-2 bg-black text-[#FFE500] px-3 py-1 border-[3px] border-black mb-6 font-black text-xs uppercase tracking-widest">
                <Coffee className="w-4 h-4" />
                You&apos;ve earned a break, champ
              </div>
              
              <p className="font-bold text-xs sm:text-sm uppercase text-black/50 mb-2 leading-relaxed">
                Your brain did its daily reps. We cap it at 10 so you actually <span className="bg-[#FFE500] text-black px-1 border-[2px] border-black">remember</span> things — not just speedrun them.
              </p>
              <p className="font-bold text-xs uppercase text-black/30 mb-8 leading-relaxed">
                Want more? Extra practice won&apos;t progress new words, but it still counts for stats.
              </p>
            </motion.div>

            <motion.div 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3"
            >
              <button 
                onClick={() => setShowPracticeDialog(false)}
                className="w-full bg-[#FFE500] text-black font-black uppercase text-lg border-[4px] border-black px-6 py-4 hover:translate-x-1 hover:translate-y-1 shadow-[6px_6px_0_0_#000] hover:shadow-none transition-all active:translate-x-2 active:translate-y-2 flex items-center justify-center gap-3"
              >
                <TimerIcon className="w-5 h-5" strokeWidth={3} />
                Start Practice
              </button>
              <Link 
                href="/quiz"
                className="w-full bg-white text-black font-black uppercase text-lg border-[4px] border-black px-6 py-4 hover:translate-x-1 hover:translate-y-1 shadow-[6px_6px_0_0_#000] hover:shadow-none transition-all active:translate-x-2 active:translate-y-2 flex items-center justify-center gap-3"
              >
                Return to Menu
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || feedback !== "idle" || isFinalizing) return;

    if (!hasSubmittedOnce) setHasSubmittedOnce(true);

    const typed = answer.trim().toLowerCase();
    const expected = (current.answer || "").toLowerCase();
    const accepted = (current.acceptedAnswers || []).map((a: string) => a.toLowerCase());
    const isCorrect = typed === expected || accepted.includes(typed);

    const timeBonus = isCorrect && timeLeft > 10;
    setFeedback(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      const optimisticXP = current.xp || 10;
      setTotalXP(prev => prev + optimisticXP);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(max => (newStreak > max ? newStreak : max));
        return newStreak;
      });
    } else {
      setStreak(0);
      controls.start({ x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } });
    }

    const timeTakenMs = (15 - timeLeft) * 1000;
    
    const promise = submitQuizAnswer({
       wordId: current.id,
       userAnswer: answer,
       gameMode: "time",
       timeTakenMs,
       acceptedAnswers: current.acceptedAnswers,
       countsForStats
    }).then(res => {
       if (res.success) {
          setResults(prev => [...prev, {
             id: current.id,
             correct: res.correct || false,
             timeBonus,
             xpGained: res.xpGained || 0,
             level: res.level || "BEGINNER",
             newMastery: res.newMastery || 0
          }]);
       } else {
          setResults(prev => [...prev, {
             id: current.id, correct: isCorrect, timeBonus, xpGained: 0, level: current.level || "BEGINNER", newMastery: 0
          }]);
       }
    }).catch(err => {
       setResults(prev => [...prev, {
          id: current.id, correct: isCorrect, timeBonus, xpGained: 0, level: current.level || "BEGINNER", newMastery: 0
       }]);
    });

    pendingRequestsRef.current.push(promise);
  };

  const handleRestart = () => {
    resetQuiz();
    setAnswer("");
    setFlipped(false);
    setTimeLeft(15);
    setShowDetails(false);
    setSessionSubmitted(false);
  };

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
      <>
        {accuracy === 100 && <CreativeConfetti />}
        {/* Background Pattern */}
        <div 
          className="fixed inset-0 z-0 opacity-[0.07] pointer-events-none"
          style={{ 
            backgroundImage: 'url("/images/Late for Class.svg"), url("/images/Meela Pantalones.svg"), url("/images/Polka Pup.svg"), url("/images/Runner.svg"), url("/images/Ecto Plasma.svg"), url("/images/Consumer.svg")',
            backgroundSize: '400px, 350px, 300px, 450px, 350px, 400px',
            backgroundPosition: '0px 0px, 200px 200px, 400px 50px, 100px 350px, 500px 150px, 300px 400px',
            backgroundRepeat: 'repeat'
          }}
        />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: "'Geist', 'Inter', sans-serif" }} className="relative z-10 min-h-[85vh] sm:min-h-[600px] flex items-center justify-center py-4">
        
        <div className="max-w-xl w-full mx-auto p-4 flex flex-col items-center text-center">
          {/* Boxed Icon & QUIZ COMPLETE! from Time Attack */}
          <div className="text-center mb-3 sm:mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }} className="inline-block p-2 sm:p-4 bg-[#FFE500] border-[2px] sm:border-[4px] border-black shadow-[2px_2px_0_#000] sm:shadow-[8px_8px_0_#000] mb-2 sm:mb-6">
              <TimerIcon className="w-6 h-6 sm:w-12 sm:h-12 text-black" />
            </motion.div>
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="uppercase tracking-tighter text-black text-3xl sm:text-[3.5rem] leading-[0.9]" style={{ fontWeight: 900 }}>
              QUIZ<br/>COMPLETE!
            </motion.h1>
          </div>

          {/* Stats Box from Cloze Mode */}
          <div className="bg-black text-white p-4 sm:p-10 border-[3px] sm:border-[4px] border-black shadow-[4px_4px_0_#FFE500] sm:shadow-[12px_12px_0_#FFE500] w-full transform -rotate-1 hover:rotate-0 transition-transform mb-3 sm:mb-8">
             <div className="text-5xl sm:text-7xl md:text-8xl font-black mb-0 italic tracking-tighter text-[#FFE500]">
               {accuracy}<span className="text-3xl sm:text-4xl md:text-5xl">%</span>
             </div>
             <p className="font-bold uppercase tracking-[0.3em] text-[10px] sm:text-sm text-gray-400 mb-3 sm:mb-6">Overall Accuracy</p>
             
             <div className="flex justify-around items-center border-t-[2px] sm:border-t-[4px] border-dashed border-gray-700 pt-3 sm:pt-6">
               <div className="flex flex-col items-center">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#00C853]">{correctCount}</p>
                  <p className="text-[8px] sm:text-[10px] md:text-xs uppercase font-bold text-gray-400 tracking-widest mt-1">Correct</p>
               </div>
               <div className="h-6 sm:h-10 w-[2px] sm:w-[4px] bg-gray-700"></div>
               <div className="flex flex-col items-center">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#FF6D00]">{maxStreak}</p>
                  <p className="text-[8px] sm:text-[10px] md:text-xs uppercase font-bold text-gray-400 tracking-widest mt-1">Streak</p>
               </div>
               <div className="h-6 sm:h-10 w-[2px] sm:w-[4px] bg-gray-700"></div>
               <div className="flex flex-col items-center">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#FFE500]">{totalXP}</p>
                  <p className="text-[8px] sm:text-[10px] md:text-xs uppercase font-bold text-gray-400 tracking-widest mt-1">XP</p>
               </div>
             </div>
          </div>

          {/* Detailed Results (Cloze style + Speed Bonus) */}
          <div className="w-full mb-3 sm:mb-8">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full py-2 sm:py-4 bg-white border-[2px] sm:border-[4px] border-black shadow-[4px_4px_0_#000] sm:shadow-[8px_8px_0_#000] uppercase font-black tracking-widest flex items-center justify-between px-3 sm:px-6 transition-all hover:bg-gray-50 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-[10px] sm:text-base"
            >
              <span className="text-black">VIEW DETAILED RESULTS</span>
              <motion.div animate={{ rotate: showDetails ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4"
                >
                  <div className="bg-white border-[3px] sm:border-[4px] border-black shadow-[4px_4px_0_#000] sm:shadow-[8px_8px_0_#000] text-left max-h-[250px] overflow-y-auto">
                    {results.map((r, i) => {
                      const w = deck.find((q) => q.id === r.id)!;
                      return (
                        <div key={i} className={`flex items-start justify-between p-4 border-b-[2px] border-black ${r.correct ? "bg-[#f0fdf4]" : "bg-[#fff1f2]"} last:border-b-0`}>
                          <div>
                            <p className="font-black uppercase text-lg text-black">{w.word}</p>
                            <p className="text-xs uppercase font-bold text-gray-500 italic mt-1">EXPECTED: {w.answer}</p>
                            <div className="mt-3 w-full sm:w-[250px]">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-black tracking-widest text-black/60 uppercase">Mastery</span>
                                <span className="text-[10px] font-black tracking-widest text-black uppercase">{r.newMastery}%</span>
                              </div>
                              <div className="w-full bg-white border-[2px] border-black h-2.5 shadow-[2px_2px_0_0_#000] overflow-hidden">
                                <motion.div 
                                  className={`h-full border-r-[2px] border-black ${r.level === 'ADVANCED' ? 'bg-[#FF6D00]' : r.level === 'INTERMEDIATE' ? 'bg-[#FDE047]' : 'bg-[#00C853]'}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${r.newMastery}%` }}
                                  transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.1 + 0.3 }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0_0_#000] border-2 border-black ${r.level === 'ADVANCED' ? 'bg-[#FF6D00] text-white' : r.level === 'INTERMEDIATE' ? 'bg-[#FDE047] text-black' : 'bg-[#00C853] text-black'}`}>{r.level}</span>
                            {r.correct ? (
                              <span className="bg-[#FFE500] text-black border-2 border-black px-2 py-1 text-xs font-black uppercase shadow-[2px_2px_0_0_#000]">+{r.xpGained} XP</span>
                            ) : (
                              <span className="bg-black text-white border-2 border-black px-2 py-1 text-xs font-black uppercase shadow-[2px_2px_0_0_#000]">MISSED</span>
                            )}
                            {r.timeBonus && <span className="text-[9px] font-black text-[#FF6D00] mt-1 tracking-wider uppercase">SPEED BONUS!</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
            <button 
              onClick={handleRestart} 
              className="flex-1 bg-[#FFE500] text-black border-[2px] sm:border-[4px] border-black py-2 sm:py-5 font-black text-sm sm:text-xl uppercase tracking-widest hover:translate-x-[4px] hover:translate-y-[4px] shadow-[4px_4px_0_#000] sm:shadow-[8px_8px_0_#000] hover:shadow-none transition-all flex items-center justify-center gap-2 sm:gap-3 active:scale-95"
            >
              <RefreshCw className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={3} /> Replay
            </button>
            <Link 
              href="/quiz" 
              className="flex-1 bg-white text-black border-[2px] sm:border-[4px] border-black py-2 sm:py-5 font-black text-sm sm:text-xl uppercase tracking-widest hover:translate-x-[4px] hover:translate-y-[4px] shadow-[4px_4px_0_#000] sm:shadow-[8px_8px_0_#000] hover:shadow-none transition-all flex items-center justify-center active:scale-95"
            >
              Exit
            </Link>
          </div>
        </div>
      </motion.div>
      </>
    );
  }

  return (
    <div style={{ fontFamily: "'Geist', 'Inter', sans-serif" }} className="max-w-3xl mx-auto px-4 py-2 sm:py-8">
      {/* HUD Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-8 flex-wrap gap-3 sm:gap-6">
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <div className="flex items-center gap-2 sm:gap-4 mb-1 sm:mb-2">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFE500] border-[2px] sm:border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0_#000]">
              <TimerIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </motion.div>
            <h1 className="uppercase tracking-tighter text-black font-black text-xl sm:text-[2rem]">TIME ATTACK </h1>
          </div>
          <div className="flex gap-2 ml-14">
             {deck.map((_, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} className="w-2 h-2 border-[1.5px] border-black" style={{ background: i < results.length ? (results[i].correct ? "#00C853" : "#FF1744") : (i === currentIndex ? "#FFE500" : "#ddd") }} />
            ))}
          </div>
          
          {/* Status Badges */}
          <div className="flex flex-col gap-1 ml-14 mt-3 mb-2">
            {!countsForStats && (
              <span className="inline-block bg-[#FF1744] text-white text-[8px] sm:text-[10px] font-black tracking-widest px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_0_#000] uppercase">
                Not Counted For Stats (&lt;10 words)
              </span>
            )}
            {isExtraPractice && (
              <span className="inline-block bg-[#FFE500] text-black text-[8px] sm:text-[10px] font-black tracking-widest px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_0_#000] uppercase">
                Extra Practice (Counts for Stats)
              </span>
            )}
          </div>
        </motion.div>

        <div className="flex gap-2 sm:gap-4 flex-wrap">
          <motion.div animate={timerControls} className="bg-white border-[3px] border-black px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-[4px_4px_0_#000]">
            <TimerIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${timeLeft <= 5 ? 'text-[#FF1744]' : 'text-black'}`} />
            <span className="text-base sm:text-xl font-black">{timeLeft}s</span>
          </motion.div>
          <div className="bg-black border-[3px] border-black px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-[4px_4px_0_#FFE500]">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE500]" />
            <span className="text-[#FFE500] uppercase text-base sm:text-lg font-black"><AnimatedNumber value={totalXP} /></span>
          </div>
          <div className="bg-[#FF6D00] border-[3px] border-black px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-[4px_4px_0_#000]">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="text-white uppercase text-base sm:text-lg font-black"><AnimatedNumber value={streak} /></span>
          </div>
        </div>
      </div>

      <div className="mb-4 sm:mb-10">
        <div className="flex items-end justify-between mb-1 sm:mb-3">
          <motion.span key={currentIndex} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#888] font-black">WORD {currentIndex + 1} / {deck.length}</motion.span>
          <span className="text-2xl uppercase tracking-tighter text-black font-black">{Math.round(((currentIndex) / deck.length) * 100)}%</span>
        </div>
        <div className="relative w-full h-2 bg-white border-[3px] border-black overflow-hidden shadow-[2px_2px_0_#000]">
          <motion.div className="h-full bg-[#FFE500] border-r-[3px] border-black" initial={{ width: 0 }} animate={{ width: `${((currentIndex) / deck.length) * 100}%` }} transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }} />
          <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-y-0 w-20 bg-white/30 skew-x-[-20deg]" />
        </div>
      </div>

      <div className="relative">
        <motion.div animate={controls}>
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex + (flipped ? "-flipped" : "")} initial={{ y: 50, opacity: 0, rotateX: 20, scale: 0.9 }} animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }} exit={{ y: -50, opacity: 0, rotateX: -20, scale: 0.9 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="border-[3px] sm:border-[4px] border-black shadow-[4px_4px_0_#000] sm:shadow-[15px_15px_0_#000] p-4 sm:p-12 mb-3 sm:mb-8 relative overflow-hidden min-h-[180px] sm:min-h-[400px] flex flex-col justify-center" style={{ background: cardBg, perspective: "1000px", transformStyle: "preserve-3d" }}>
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "20px 20px" }} />
            {timeLeft <= 3 && feedback === "idle" && <motion.div animate={{ opacity: [0, 0.2, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="absolute inset-0 bg-red-600 pointer-events-none" />}
            
            <div className="absolute top-3 sm:top-6 left-3 sm:left-6 right-3 sm:right-6 flex items-center justify-between">
              <span className="px-2 sm:px-4 py-1 sm:py-2 border-[2px] sm:border-[2.5px] border-black text-[10px] sm:text-xs uppercase tracking-widest shadow-[2px_2px_0_#000] sm:shadow-[4px_4px_0_#000] font-black" style={{ background: POS_COLORS[current.partOfSpeech]?.bg || "#333", color: POS_COLORS[current.partOfSpeech]?.text || "#fff" }}>{current.partOfSpeech}</span>
              <span className="px-4 py-2 border-[2.5px] border-black text-xs uppercase tracking-widest shadow-[4px_4px_0_#000] font-black" style={{ background: DIFF_COLORS[current.level || "BEGINNER"] || "#00C853", color: current.level === "ADVANCED" ? "#fff" : "#000" }}>{current.level || "BEGINNER"}</span>
            </div>

            {!flipped ? (
              <div className="text-center mt-12 sm:mt-8">
                <p className="uppercase tracking-[0.3em] text-[8px] sm:text-[10px] mb-2 sm:mb-6 font-black" style={{ color: cardTextColor + "cc" }}>TRANSLATE TO TAGALOG</p>
                <div className="relative w-full max-w-full mx-auto mb-3 sm:mb-8">
                  <motion.div className={`uppercase tracking-tighter font-black leading-[1.1] md:leading-[0.9] flex flex-wrap justify-center items-center break-words ${current.word.length > 30 ? 'text-lg sm:text-2xl md:text-4xl' : current.word.length > 15 ? 'text-xl sm:text-4xl md:text-[3.5rem]' : 'text-2xl sm:text-5xl md:text-[4.5rem]'}`} style={{ color: cardTextColor }}>
                    {current.word.split(" ").map((wordStr, wordIdx) => (
                      <span key={wordIdx} className="inline-flex flex-wrap justify-center mr-2 sm:mr-3 last:mr-0 md:mr-6">
                        {wordStr.split("").map((char, i) => (
                          <motion.span key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 + (wordIdx * 5 + i) * 0.02, type: "spring", stiffness: 400, damping: 25 }} className="inline-block break-all">{char}</motion.span>
                        ))}
                      </span>
                    ))}
                  </motion.div>
                </div>
                <p className="text-xs sm:text-lg uppercase tracking-wider mb-3 sm:mb-8 italic font-bold" style={{ color: feedback === "idle" ? "#555" : "#fffcc" }}>"{current.example}"</p>
                {feedback === "idle" && <div className="inline-block px-3 sm:px-6 py-2 sm:py-3 border-[2px] sm:border-[3px] border-black/10 bg-black/5"><p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-[#888] font-black">HINT: {current.hint}</p></div>}
                
                <AnimatePresence>
                  {feedback !== "idle" && (
                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute inset-0 flex items-center justify-center backdrop-blur-md bg-black/40 z-10 p-4 sm:p-12">
                      <div className="text-center">
                        {feedback === "correct" ? (
                          <motion.div>
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white border-[3px] sm:border-[4px] border-black flex items-center justify-center mx-auto mb-3 sm:mb-6 shadow-[4px_4px_0_#000] sm:shadow-[8px_8px_0_#000]"><Check className="w-10 h-10 sm:w-16 sm:h-16 text-[#00C853]" /></div>
                            <h2 className="text-white uppercase font-black text-3xl sm:text-[3rem]">EXCELLENT!</h2>
                            {timeLeft > 10 && <p className="text-[#FFE500] font-black text-xs sm:text-sm uppercase mt-1">+5 SPEED BONUS</p>}
                          </motion.div>
                        ) : (
                          <motion.div>
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white border-[3px] sm:border-[4px] border-black flex items-center justify-center mx-auto mb-3 sm:mb-6 shadow-[4px_4px_0_#000] sm:shadow-[8px_8px_0_#000]"><X className="w-10 h-10 sm:w-16 sm:h-16 text-[#FF1744]" /></div>
                            <h2 className="text-white uppercase font-black text-3xl sm:text-[3rem]">{feedback === "timeout" ? "TIME UP!" : "NOT QUITE!"}</h2>
                            <div className="mt-3 sm:mt-4 px-3 sm:px-4 py-1 sm:py-2 bg-[#FF1744] text-white inline-block border-[2px] sm:border-[3px] border-white font-black text-[10px] sm:text-xs">ANSWER: {(current.answer || "").toUpperCase()}</div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} className="text-center mt-10 sm:mt-8">
                <div className="relative inline-block mb-4 sm:mb-10 w-[95%] sm:w-auto max-w-full">
                  <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -inset-1.5 sm:-inset-4 bg-[#FFE500] border-[2px] sm:border-[4px] border-black -z-10 shadow-[4px_4px_0_#000] sm:shadow-[8px_8px_0_#000]" />
                  <div className="px-3 py-3 sm:px-10 sm:py-6 break-words">
                    <p className="text-[8px] sm:text-[10px] uppercase font-black text-black/40 mb-1 sm:mb-2">FILIPINO MEANING</p>
                    <h2 className={`uppercase tracking-tighter text-black font-black leading-tight break-words ${(current.rootWord?.length ?? 0) > 30 ? 'text-sm sm:text-lg md:text-2xl' : (current.rootWord?.length ?? 0) > 15 ? 'text-base sm:text-2xl md:text-3xl' : 'text-lg sm:text-3xl md:text-4xl'}`}>{current.rootWord}</h2>
                  </div>
                </div>
                <p className="text-xs sm:text-xl text-black/70 uppercase tracking-wider sm:tracking-widest px-2 sm:px-10 mb-2 sm:mb-8 font-black leading-tight sm:leading-normal">{current.rootDefinition}</p>
              </motion.div>
            )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -right-12 top-1/2 -z-10 opacity-10"><Star className="w-32 h-32 text-black" /></motion.div>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 sm:mb-8 relative">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <input ref={inputRef} type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={feedback !== "idle" || isFinalizing} placeholder={feedback !== "idle" || isFinalizing ? "" : "TYPE IN TAGALOG..."} className={`flex-1 px-4 sm:px-8 py-3 sm:py-6 bg-white border-[3px] sm:border-[4px] border-black outline-none shadow-[4px_4px_0_#000] sm:shadow-[8px_8px_0_#000] focus:shadow-[6px_6px_0_#000] sm:focus:shadow-[12px_12px_0_#000] transition-all uppercase text-base sm:text-xl placeholder:text-[#ccc] font-black ${isFinalizing ? 'bg-gray-100 opacity-60 animate-pulse' : ''} disabled:bg-[#eee]`} />
          <motion.button whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }} type="submit" disabled={feedback !== "idle" || !answer.trim() || isFinalizing} className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-6 bg-black text-[#FFE500] border-[3px] sm:border-[4px] border-black shadow-[4px_4px_0_#FFE500] sm:shadow-[8px_8px_0_#FFE500] uppercase font-black transition-all flex items-center justify-center gap-3 disabled:opacity-40 hover:bg-[#111] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
            {isFinalizing ? <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <span className="text-base sm:text-xl">CHECK</span>}
            {!isFinalizing && <kbd className="font-sans text-[8px] sm:text-[10px] font-bold bg-white text-black px-1.5 py-0.5 border-[1.5px] sm:border-2 border-white shadow-[2px_2px_0_#FFE500] group-hover:shadow-none hidden sm:inline-block">ENTER ↵</kbd>}
          </motion.button>
        </div>
      </form>

      <div className="flex flex-col sm:flex-row gap-4 flex-wrap items-stretch sm:items-center">
        <motion.button whileHover={{ y: -4, boxShadow: "6px 6px 0 #000" }} whileTap={{ y: 0, boxShadow: "none" }} onClick={() => setFlipped(!flipped)} className="w-full sm:w-auto flex justify-center items-center gap-3 px-6 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0_#000] uppercase font-black text-sm transition-all"><RotateCcw className={`w-5 h-5 transition-transform duration-500 ${flipped ? "rotate-180" : ""}`} />{flipped ? "HIDE MEANING" : "VIEW MEANING"}</motion.button>
        <AnimatePresence>
          {feedback !== "idle" && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-8">
              <button
                onClick={handleNext}
                disabled={isFinalizing}
                className={`w-full font-black uppercase text-2xl py-6 border-[4px] border-black shadow-[8px_8px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:translate-x-2 active:translate-y-2 flex items-center justify-center gap-3 ${
                  feedback === "correct" ? "bg-[#00E676] text-black" : "bg-white text-black"
                }`}
              >
                {isFinalizing ? (
                  <>
                    <RefreshCw className="w-8 h-8 animate-spin" strokeWidth={3} />
                    Saving...
                  </>
                ) : (
                  <>
                    {currentIndex < deck.length - 1 ? "Next Card" : "Finish Quiz"}
                    <ArrowRight className="w-8 h-8" strokeWidth={3} />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <button onClick={() => {
          if (deck.length > 0 && results.length === 0) {
            setResults([{ id: deck[0].id, correct: true, timeBonus: true, xpGained: 15, newMastery: 50, level: "BEGINNER" }]);
          }
          setQuizDone(true);
        }} className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 text-xs sm:text-sm bg-red-500 text-white font-black px-4 py-2 uppercase border-[3px] border-black shadow-[4px_4px_0_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all">
          Skip
        </button>
      )}
    </div>
  );
}
