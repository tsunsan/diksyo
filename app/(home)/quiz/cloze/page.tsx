"use client";

import { useEffect, useState, useCallback, useRef, useTransition } from "react";
import { useQuizStore, QuizWord } from "@/store/quiz-store";
import { getVaultWords, getQuizWords } from "@/app/actions/vault";
import { submitQuizAnswer, submitQuizSession } from "@/app/actions/quiz";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { 
  Zap, 
  RefreshCw, 
  Puzzle, 
  CheckCircle2, 
  AlertOctagon, 
  ArrowRight, 
  Keyboard,
  Star,
  Flame,
  ChevronDown,
  Check,
  X,
  Trophy,
  Coffee,
} from "lucide-react";
import { POS_COLORS } from "@/lib/utils";
import Link from "next/link";

const DIFF_COLORS: Record<string, string> = {
  BEGINNER: "#00C853",
  INTERMEDIATE: "#FDE047",
  ADVANCED: "#FF6D00",
};

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

// --- Types & Constants ---
const LETTERS = ['A', 'B', 'C', 'D'];
const FALLBACK_WORDS = ["salita", "buhay", "tao", "araw", "gabi", "tubig", "lupa", "bahay", "oras", "taon"];

export default function ClozeQuizPage() {
  const { 
    deck, 
    currentIndex, 
    status, 
    correctCount, 
    questionStartTime,
    startQuiz, 
    applyAnswerResult, 
    nextCard, 
    resetQuiz,
    quizStartTime,
    countsForStats,
    isExtraPractice
  } = useQuizStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [results, setResults] = useState<{ id: string; correct: boolean; word: string; translationPrompt: string; xpGained: number; newMastery: number; level: string }[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  
  const [isPending, startTransition] = useTransition();
  const [sessionSubmitted, setSessionSubmitted] = useState(false);
  const [showPracticeDialog, setShowPracticeDialog] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const pendingRequestsRef = useRef<Promise<any>[]>([]);
  const controls = useAnimation();

  // --- Initializer ---
  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getQuizWords("cloze");
      if (res.success && res.data) {
        const clozeWords = res.data.reduce((acc: QuizWord[], item: any) => {
          const w = item.word;
          if (!w) return acc;
          
          const examples = Array.isArray(w.usageExamples) ? w.usageExamples : [];
          const hasCloze = examples.some(
            (ex: any) => typeof ex.sentence === 'string' && /\*\*(.*?)\*\*/.test(ex.sentence)
          );
          
          if (hasCloze) {
            acc.push({
              id: item.wordId!,
              word: w.word,
              englishPrompt: w.translation,
              partOfSpeech: w.partOfSpeech || "UNKNOWN",
              rootWord: w.originalExplanation || undefined,
              usageExamples: examples,
              level: w.level || "BEGINNER",
            });
          }
          return acc;
        }, []);

        if (clozeWords.length > 0) {
          if (res.isExtraPractice) {
            setShowPracticeDialog(true);
          }
          startQuiz(clozeWords.sort(() => 0.5 - Math.random()), res.countsForStats, res.isExtraPractice);
        } else {
          setError("No suitable context sentences found in your vault.");
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
    if (status === 'idle') loadQuiz();
    else setLoading(false);
  }, [status, loadQuiz]);

  useEffect(() => {
    return () => {
      resetQuiz();
    };
  }, [resetQuiz]);

  useEffect(() => {
    if (status === 'completed' && !sessionSubmitted && deck.length > 0) {
      setSessionSubmitted(true);
      const totalTimeMs = Date.now() - quizStartTime;
      const isPerfect = correctCount === deck.length;
      submitQuizSession({ isPerfect, timeTakenMs: totalTimeMs, countsForStats });
    }
  }, [status, sessionSubmitted, quizStartTime, correctCount, deck.length, countsForStats]);

  // --- Multiple Choice Generator ---
  useEffect(() => {
    if (deck.length > 0 && currentIndex < deck.length) {
      const correctWord = deck[currentIndex].word.toLowerCase();
      
      const distractors = deck
        .filter(item => item.word.toLowerCase() !== correctWord)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(item => item.word);

      while (distractors.length < 3) {
        const fb = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
        if (!distractors.includes(fb) && fb.toLowerCase() !== correctWord) {
          distractors.push(fb);
        }
      }

      setOptions([deck[currentIndex].word, ...distractors].sort(() => 0.5 - Math.random()));
    }
  }, [currentIndex, deck]);

  // --- Handlers ---
  const handleOptionClick = useCallback((option: string) => {
    if (status !== 'typing' || isFinalizing || showPracticeDialog) return;
    
    setSelectedOption(option);
    
    const timeTakenMs = Date.now() - questionStartTime;
    const currentWord = deck[currentIndex];
    const isCorrect = option === currentWord.word;
    
    applyAnswerResult(isCorrect);

    if (isCorrect) {
      const optimisticXP = (currentWord.level || "").toUpperCase() === 'ADVANCED' ? 30 : (currentWord.level || "").toUpperCase() === 'INTERMEDIATE' ? 20 : 10;
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
    
    const optimisticXP = (currentWord.level || "").toUpperCase() === 'ADVANCED' ? 30 : (currentWord.level || "").toUpperCase() === 'INTERMEDIATE' ? 20 : 10;
    
    setResults(prev => [...prev, {
      id: currentWord.id,
      word: currentWord.word,
      translationPrompt: currentWord.englishPrompt,
      correct: isCorrect,
      xpGained: isCorrect ? optimisticXP : 0,
      newMastery: 0,
      level: currentWord.level || "BEGINNER"
    }]);
    
    const promise = submitQuizAnswer({
      wordId: currentWord.id,
      userAnswer: option,
      gameMode: "cloze",
      timeTakenMs,
      countsForStats,
      isExtraPractice
    }).then(res => {
      if (res.success) {
        setResults(prev => prev.map(r => r.id === currentWord.id ? {
          ...r,
          correct: res.correct ?? r.correct,
          xpGained: res.xpGained || r.xpGained,
          newMastery: res.newMastery || 0
        } : r));
      }
    }).catch(err => {
      console.error("Failed to submit cloze answer", err);
    });

    pendingRequestsRef.current.push(promise);
  }, [status, isFinalizing, questionStartTime, deck, currentIndex, applyAnswerResult, controls, countsForStats, setTotalXP, setStreak, setMaxStreak, setResults, showPracticeDialog]);

  const handleNext = useCallback(async () => {
    if (status !== 'revealed') return;
    setSelectedOption("");
    
    if (currentIndex < deck.length - 1) {
      nextCard();
    } else {
      setIsFinalizing(true);
      await Promise.all(pendingRequestsRef.current);
      setIsFinalizing(false);
      nextCard();
    }
  }, [status, currentIndex, deck.length, nextCard]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status === 'revealed' && e.key === "Enter" && !isFinalizing) {
        e.preventDefault();
        handleNext();
      }
      
      if (status === 'typing' && !isPending && !showPracticeDialog) {
        const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
        if (keyMap[e.key] !== undefined && options[keyMap[e.key]]) {
          e.preventDefault();
          handleOptionClick(options[keyMap[e.key]]);
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, isPending, handleNext, options, handleOptionClick]);

  // --- Render Helpers ---
  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
         <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-16 h-16 bg-[#4361EE] border-4 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center"
          >
            <RefreshCw className="w-8 h-8 text-white" strokeWidth={3} />
         </motion.div>
      </div>
    );
  }

  if (error || deck.length === 0) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-[4px] border-black p-8 shadow-[12px_12px_0_0_#000] max-w-md w-full text-center relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-4 bg-[#FF1744] border-b-[4px] border-black" />
            <AlertOctagon className="w-16 h-16 text-[#FF1744] mb-4 mx-auto mt-4" strokeWidth={2.5}/>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-black mb-2">Vault Empty</h2>
            <p className="font-bold text-sm uppercase text-gray-500 mb-8">{error || "No valid cloze cards available."}</p>
            <Link 
              href="/vault" 
              className="inline-block w-full bg-[#FFE500] text-black font-black uppercase text-lg border-[3px] border-black px-6 py-4 hover:translate-x-1 hover:translate-y-1 shadow-[6px_6px_0_0_#000] hover:shadow-none transition-all active:translate-x-2 active:translate-y-2"
            >
                Return to Vault
            </Link>
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
          <div className="w-full h-3 bg-[#4361EE] border-b-[4px] border-black" />
          
          {/* Diagonal stripe decoration */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#4361EE] border-[4px] border-black rotate-12 opacity-20" />
          <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-black rotate-45 opacity-5" />

          <div className="p-6 sm:p-8 text-center">
            {/* Trophy icon */}
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
              className="w-20 h-20 bg-[#4361EE] border-[4px] border-black flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0_0_#000]"
            >
              <Trophy className="w-10 h-10 text-white" strokeWidth={2.5} />
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
              <div className="inline-flex items-center gap-2 bg-black text-[#4361EE] px-3 py-1 border-[3px] border-black mb-6 font-black text-xs uppercase tracking-widest">
                <Coffee className="w-4 h-4" />
                You&apos;ve earned a break, champ
              </div>
              
              <p className="font-bold text-xs sm:text-sm uppercase text-black/50 mb-2 leading-relaxed">
                Your brain did its daily reps. We cap it at 10 so you actually <span className="bg-[#4361EE] text-white px-1 border-[2px] border-black">remember</span> things &mdash; not just speedrun them.
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
                className="w-full bg-[#4361EE] text-white font-black uppercase text-lg border-[4px] border-black px-6 py-4 hover:translate-x-1 hover:translate-y-1 shadow-[6px_6px_0_0_#000] hover:shadow-none transition-all active:translate-x-2 active:translate-y-2 flex items-center justify-center gap-3"
              >
                <Puzzle className="w-5 h-5" strokeWidth={3} />
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

  if (status === 'completed') {
    const accuracy = Math.round((correctCount / deck.length) * 100);
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
          {/* Boxed Icon & QUIZ COMPLETE! */}
          <div className="text-center mb-3 sm:mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }} className="inline-block p-2 sm:p-4 bg-[#4361EE] border-[2px] sm:border-[4px] border-black shadow-[2px_2px_0_#000] sm:shadow-[8px_8px_0_#000] mb-2 sm:mb-6">
              <Puzzle className="w-6 h-6 sm:w-12 sm:h-12 text-white" />
            </motion.div>
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="uppercase tracking-tighter text-black text-3xl sm:text-[3.5rem] leading-[0.9]" style={{ fontWeight: 900 }}>
              QUIZ<br/>COMPLETE!
            </motion.h1>
          </div>

          {/* Stats Box */}
          <div className="bg-black text-white p-4 sm:p-10 border-[3px] sm:border-[4px] border-black shadow-[4px_4px_0_#4361EE] sm:shadow-[12px_12px_0_#4361EE] w-full transform -rotate-1 hover:rotate-0 transition-transform mb-3 sm:mb-8">
             <div className="text-5xl sm:text-7xl md:text-8xl font-black mb-0 italic tracking-tighter text-[#4361EE]">
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

          {/* Detailed Results */}
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
                    {results.map((res, index) => (
                      <div key={index} className={`flex items-start justify-between p-4 border-b-[2px] border-black ${res.correct ? "bg-[#f0fdf4]" : "bg-[#fff1f2]"} last:border-b-0`}>
                        <div>
                          <p className="font-black uppercase text-lg text-black">{res.word}</p>
                          <p className="text-xs uppercase font-bold text-gray-500 italic mt-1">&quot;{res.translationPrompt}&quot;</p>
                          <div className="mt-3 w-full sm:w-[250px]">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-black tracking-widest text-black/60 uppercase">Mastery</span>
                              <span className="text-[10px] font-black tracking-widest text-black uppercase">{res.newMastery}%</span>
                            </div>
                            <div className="w-full bg-white border-[2px] border-black h-2.5 shadow-[2px_2px_0_0_#000] overflow-hidden">
                              <motion.div 
                                className={`h-full border-r-[2px] border-black ${res.level === 'ADVANCED' ? 'bg-[#FF6D00]' : res.level === 'INTERMEDIATE' ? 'bg-[#FDE047]' : 'bg-[#00C853]'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${res.newMastery}%` }}
                                transition={{ duration: 1.2, ease: "easeOut", delay: index * 0.1 + 0.3 }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0_0_#000] border-2 border-black ${res.level === 'ADVANCED' ? 'bg-[#FF6D00] text-white' : res.level === 'INTERMEDIATE' ? 'bg-[#FDE047] text-black' : 'bg-[#00C853] text-black'}`}>{res.level}</span>
                          {res.correct ? (
                            <span className="bg-[#FFE500] text-black border-2 border-black px-2 py-1 text-xs font-black uppercase shadow-[2px_2px_0_0_#000]">+{res.xpGained} XP</span>
                          ) : (
                            <span className="bg-black text-white border-2 border-black px-2 py-1 text-xs font-black uppercase shadow-[2px_2px_0_0_#000]">MISSED</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
            <button 
              onClick={() => { 
                resetQuiz(); 
                setTotalXP(0);
                setStreak(0);
                setMaxStreak(0);
                setResults([]);
                setShowDetails(false);
                setSessionSubmitted(false);
                loadQuiz(); 
              }} 
              className="flex-1 bg-[#4361EE] text-white border-[2px] sm:border-[4px] border-black py-2 sm:py-5 font-black text-sm sm:text-xl uppercase tracking-widest hover:translate-x-[4px] hover:translate-y-[4px] shadow-[4px_4px_0_#000] sm:shadow-[8px_8px_0_#000] hover:shadow-none transition-all flex items-center justify-center gap-2 sm:gap-3 active:scale-95"
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

  // --- Active Quiz State ---
  const currentWord = deck[currentIndex];
  let clozedSentence = currentWord.word + " (fallback)";
  let translationHint = currentWord.englishPrompt;
  
  const examples = currentWord.usageExamples || [];
  for (const ex of examples) {
    if (/\*\*(.*?)\*\*/.test(ex.sentence)) {
      clozedSentence = ex.sentence;
      translationHint = ex.translation;
      break;
    }
  }

  // Split sentence into segments (Text -> Blank -> Text)
  const sentenceParts = clozedSentence.split(/\*\*(.*?)\*\*/);
  const isCorrect = status === 'revealed' && selectedOption.trim().toLowerCase() === currentWord.word.toLowerCase();
  
  // Dynamic styling based on status
  const cardBg = '#fff';
  const cardTextColor = '#000';

  return (
    <div style={{ fontFamily: "'Geist', 'Inter', sans-serif" }} className="max-w-3xl mx-auto px-4 py-2 sm:py-8">
      
      {/* HUD Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-8 flex-wrap gap-3 sm:gap-6">
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <div className="flex items-center gap-2 sm:gap-4 mb-1 sm:mb-2">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} 
              transition={{ duration: 4, repeat: Infinity }} 
              className="w-8 h-8 sm:w-10 sm:h-10 bg-[#4361EE] border-[2px] sm:border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0_#000]"
            >
              <Puzzle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="uppercase tracking-tighter text-black font-black text-xl sm:text-[2rem] leading-none">CLOZE DELETION</h1>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex flex-col items-start gap-1 ml-10 sm:ml-14 mb-2">
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

          {/* Per-question dot progress indicators */}
          <div className="flex gap-2 ml-10 sm:ml-14">
            {deck.map((_, i) => (
              <motion.div 
                key={i} 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ delay: i * 0.1 }} 
                className="w-2 h-2 border-[1.5px] border-black" 
                style={{ 
                  background: i < results.length 
                    ? (results[i].correct ? "#00C853" : "#FF1744") 
                    : (i === currentIndex ? "#4361EE" : "#ddd") 
                }} 
              />
            ))}
          </div>
        </motion.div>
        
        <div className="flex gap-2 sm:gap-4 flex-wrap">
          <div className="bg-[#4361EE] text-white border-[2px] sm:border-[3px] border-black px-3 sm:px-5 py-2 sm:py-3 shadow-[4px_4px_0_#000] flex items-center justify-center font-black italic text-base sm:text-xl">
            {currentIndex + 1} / {deck.length}
          </div>
          <div className="bg-black border-[2px] sm:border-[3px] border-black px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-[4px_4px_0_#FFE500]">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE500]" />
            <span className="text-[#FFE500] uppercase text-base sm:text-lg font-black"><AnimatedNumber value={totalXP} /></span>
          </div>
          <div className="bg-[#FF6D00] border-[2px] sm:border-[3px] border-black px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-[4px_4px_0_#000]">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="text-white uppercase text-base sm:text-lg font-black"><AnimatedNumber value={streak} /></span>
          </div>
        </div>
      </div>

      {/* Progress Bar with shimmer */}
      <div className="mb-4 sm:mb-10">
        <div className="flex items-end justify-between mb-1 sm:mb-3">
          <motion.span key={currentIndex} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#888] font-black">
            WORD {currentIndex + 1} / {deck.length}
          </motion.span>
          <span className="text-2xl uppercase tracking-tighter text-black font-black">
            {Math.round(((currentIndex) / deck.length) * 100)}%
          </span>
        </div>
        <div className="relative w-full h-2 bg-white border-[3px] border-black overflow-hidden shadow-[2px_2px_0_#000]">
          <motion.div 
            className="h-full bg-[#4361EE] border-r-[3px] border-black" 
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex) / deck.length) * 100}%` }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
          />
          <motion.div 
            animate={{ x: ["-100%", "200%"] }} 
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
            className="absolute inset-y-0 w-20 bg-white/30 skew-x-[-20deg]" 
          />
        </div>
      </div>

      {/* Main Flashcard */}
      <div className="relative">
        <motion.div animate={controls}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWord.id}
              initial={{ y: 50, opacity: 0, rotateX: 20, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ y: -50, opacity: 0, rotateX: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="border-[3px] sm:border-[4px] border-black shadow-[4px_4px_0_#000] sm:shadow-[15px_15px_0_#000] p-4 sm:p-12 mb-3 sm:mb-8 relative overflow-hidden min-h-[180px] sm:min-h-[320px] flex flex-col justify-center transition-colors duration-300"
              style={{ background: cardBg, perspective: "1000px", transformStyle: "preserve-3d" }}
            >
              {/* Dot pattern overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "20px 20px" }} />

              {/* POS + Level badges */}
              <div className="absolute top-3 sm:top-6 left-3 sm:left-6 right-3 sm:right-6 flex items-center justify-between">
                <span 
                  className="px-2 sm:px-4 py-1 sm:py-2 border-[2px] sm:border-[2.5px] border-black text-[10px] sm:text-xs uppercase tracking-widest shadow-[2px_2px_0_#000] sm:shadow-[4px_4px_0_#000] font-black" 
                  style={{ 
                    background: POS_COLORS[currentWord.partOfSpeech]?.bg || "#333", 
                    color: POS_COLORS[currentWord.partOfSpeech]?.text || "#fff" 
                  }}
                >
                  {currentWord.partOfSpeech}
                </span>
                <span 
                  className="px-2 sm:px-4 py-1 sm:py-2 border-[2px] sm:border-[2.5px] border-black text-[10px] sm:text-xs uppercase tracking-widest shadow-[2px_2px_0_#000] sm:shadow-[4px_4px_0_#000] font-black"
                  style={{ 
                    background: DIFF_COLORS[currentWord.level || "BEGINNER"] || "#00C853", 
                    color: (currentWord.level === "ADVANCED") ? "#fff" : "#000" 
                  }}
                >
                  {currentWord.level || "BEGINNER"}
                </span>
              </div>

              {/* The Sentence */}
              <div className="min-h-[100px] sm:min-h-[140px] flex items-center justify-center text-center my-8 sm:my-10 mt-14 sm:mt-16">
                <h3 className="text-xl sm:text-2xl md:text-4xl font-black leading-snug text-black">
                   {sentenceParts.map((part, i) => {
                      if (i % 2 === 0) return <span key={i}>{part}</span>;
                      
                      if (status === 'typing') {
                        return (
                          <motion.span 
                            key={`typing-${i}`} 
                            animate={{ borderColor: ["#4361EE", "#7C3AED", "#4361EE"] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="inline-block mx-1 sm:mx-3 px-3 sm:px-6 py-1 bg-[#4361EE]/10 border-b-[4px] sm:border-b-[6px] border-[#4361EE] rounded-sm align-middle min-w-[80px] sm:min-w-[120px]"
                          >
                             &nbsp;
                          </motion.span>
                        );
                      }
                      
                      return (
                        <motion.span 
                          key={`revealed-${i}`} 
                          initial={{ scale: 0, rotate: -10 }}
                          animate={{ scale: 1, rotate: -2, borderColor: "#000" }}
                          transition={{ type: "spring", stiffness: 500, damping: 20 }}
                          className={`inline-block mx-1 sm:mx-3 px-2 sm:px-4 py-1 border-[3px] border-black shadow-[4px_4px_0_0_#000] ${
                            isCorrect ? 'bg-[#00C853] text-white' : 'bg-[#FF1744] text-white'
                          }`}
                        >
                           {currentWord.word}
                        </motion.span>
                      );
                   })}
                </h3>
              </div>
              
              {/* Hint Footer */}
              {status === 'typing' && (
                <div className="flex justify-center">
                  <div className="bg-white border-[2px] sm:border-[3px] border-black px-3 sm:px-6 py-2 sm:py-3 shadow-[2px_2px_0_#000] sm:shadow-[4px_4px_0_#000] transform rotate-1 inline-block">
                     <p className="uppercase text-[8px] sm:text-[10px] font-black tracking-[0.2em] text-gray-400 mb-1">Target Translation</p>
                     <p className="italic text-black font-bold text-sm sm:text-lg">&quot;{translationHint}&quot;</p>
                  </div>
                </div>
              )}


            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Floating decorative star */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 360] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }} 
          className="absolute -right-12 top-1/2 -z-10 opacity-10"
        >
          <Star className="w-32 h-32 text-black" />
        </motion.div>
      </div>

      {/* Multiple Choice Grid */}
      <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-3 mt-4 sm:mt-0">
        <Keyboard className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
        <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-gray-400">Press 1-4 to select</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-8">
        {options.map((option, idx) => {
          const isCorrectOption = option.toLowerCase() === currentWord.word.toLowerCase();
          const isSelected = option === selectedOption;
          
          let btnBg = "#fff";
          let btnTextColor = "#000";
          let btnShadow = "8px 8px 0 #000";
          let btnTranslate = "";
          let btnCursor = "pointer";
          let btnOpacity = "1";
          let badgeBg = "#FFE500";
          let badgeText = "#000";
          let extraClasses = "hover:bg-[#4361EE] hover:text-white hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none group";
          let badgeExtraClasses = "group-hover:bg-black group-hover:text-[#FFE500] shadow-[2px_2px_0_#000] sm:shadow-[3px_3px_0_#000]";
          
          if (status === 'revealed') {
            if (isCorrectOption) {
              btnBg = "#00C853";
              btnTextColor = "#000";
              btnTranslate = "translate-x-[4px] translate-y-[4px]";
              btnShadow = "none";
              extraClasses = "z-10 scale-[1.02]";
              badgeBg = "#fff";
              badgeText = "#000";
              badgeExtraClasses = "shadow-[2px_2px_0_#000] sm:shadow-[3px_3px_0_#000]";
            } else if (isSelected && !isCorrectOption) {
              btnBg = "#FF1744";
              btnTextColor = "#fff";
              btnTranslate = "translate-x-[4px] translate-y-[4px]";
              btnShadow = "none";
              extraClasses = "";
              badgeBg = "#000";
              badgeText = "#fff";
              badgeExtraClasses = "border-white shadow-[2px_2px_0_#fff] sm:shadow-[3px_3px_0_#fff]";
            } else {
              btnBg = "#f3f4f6";
              btnTextColor = "#9ca3af";
              btnOpacity = "0.6";
              btnCursor = "not-allowed";
              extraClasses = "";
              badgeBg = "#d1d5db";
              badgeText = "#6b7280";
              badgeExtraClasses = "border-gray-400 shadow-[2px_2px_0_#9ca3af] sm:shadow-[3px_3px_0_#9ca3af]";
            }
          }

          if (isPending && isSelected) {
            btnBg = "#4361EE";
            btnTextColor = "#fff";
            btnTranslate = "translate-x-[4px] translate-y-[4px]";
            btnShadow = "none";
            btnCursor = "wait";
            extraClasses = "animate-pulse";
            badgeBg = "#fff";
            badgeText = "#000";
            badgeExtraClasses = "shadow-[2px_2px_0_#000] sm:shadow-[3px_3px_0_#000]";
          } else if (isPending) {
            btnBg = "#f3f4f6";
            btnTextColor = "#9ca3af";
            btnOpacity = "0.6";
            btnCursor = "not-allowed";
            extraClasses = "";
            badgeBg = "#d1d5db";
            badgeText = "#6b7280";
            badgeExtraClasses = "border-gray-400 shadow-[2px_2px_0_#9ca3af] sm:shadow-[3px_3px_0_#9ca3af]";
          }

          return (
            <motion.button
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05, type: "spring", stiffness: 400, damping: 25 }}
              disabled={status !== 'typing' || isPending}
              onClick={() => handleOptionClick(option)}
              style={{ 
                background: btnBg, 
                color: btnTextColor, 
                boxShadow: btnShadow, 
                cursor: btnCursor, 
                opacity: btnOpacity 
              }}
              className={`
                border-[3px] sm:border-[4px] border-black p-3 sm:p-4 md:p-5 text-base sm:text-lg md:text-xl font-black 
                transition-all duration-200 flex items-center gap-3 sm:gap-5 text-left w-full leading-tight
                active:scale-95 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
                ${btnTranslate} ${extraClasses}
              `}
            >
              <span 
                style={{ background: badgeBg, color: badgeText }}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-[2px] sm:border-[3px] border-black flex-shrink-0 text-base sm:text-lg transition-all ${badgeExtraClasses}`}
              >
                {LETTERS[idx]}
              </span>
              <span className="uppercase flex-1 break-words whitespace-normal">{option}</span>
              {isPending && isSelected && <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin flex-shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {/* Results Banner & Next Button */}
      <AnimatePresence>
        {status === 'revealed' && (
          <motion.div 
            initial={{ y: 30, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[60] flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 bg-white border-t-[4px] sm:border-[4px] border-black shadow-[0_-8px_0_0_rgba(0,0,0,0.1)] sm:shadow-[8px_8px_0_#000] sm:mb-8 sm:static"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
               {isCorrect ? (
                  <div className="bg-[#00C853] p-2 sm:p-3 border-[2px] sm:border-[3px] border-black flex-shrink-0">
                     <Check className="w-6 h-6 sm:w-8 sm:h-8 text-black" strokeWidth={3} />
                  </div>
               ) : (
                  <div className="bg-[#FF1744] p-2 sm:p-3 border-[2px] sm:border-[3px] border-black flex-shrink-0">
                     <X className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={3} />
                  </div>
               )}
               <div className="flex flex-col">
                  <h3 className="uppercase tracking-tighter font-black text-2xl sm:text-3xl leading-none">
                     {isCorrect ? "FLAWLESS!" : "NOT QUITE!"}
                  </h3>
                  {isCorrect ? (
                     <p className="text-[#00C853] font-black text-xs sm:text-sm uppercase tracking-widest mt-1">
                        +{results[results.length-1]?.xpGained} XP
                     </p>
                  ) : (
                     <p className="text-[#FF1744] font-black text-xs sm:text-sm uppercase tracking-widest mt-1">
                        TARGET: {currentWord.word}
                     </p>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 justify-center sm:justify-end">
               <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                 <Keyboard className="w-4 h-4" />
                 <span>ENTER ↵</span>
               </div>
               <motion.button 
                 whileHover={{ x: 5, y: 5, boxShadow: "none" }}
                 onClick={handleNext} 
                 disabled={isFinalizing}
                 className="w-full sm:w-auto flex justify-center items-center gap-3 px-6 sm:px-10 py-3 sm:py-4 bg-[#4361EE] text-white border-[3px] sm:border-[4px] border-black shadow-[4px_4px_0_#000] sm:shadow-[6px_6px_0_#000] uppercase font-black transition-all text-sm sm:text-base active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-70"
               >
                 {isFinalizing ? (
                   <>
                     <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" strokeWidth={3} />
                     SAVING...
                   </>
                 ) : (
                   <>
                     {currentIndex < deck.length - 1 ? "NEXT" : "FINISH"} <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                   </>
                 )}
               </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {process.env.NODE_ENV === 'development' && (
        <button onClick={() => {
          if (deck.length > 0 && results.length === 0) {
            setResults([{ id: deck[0].id, correct: true, word: deck[0].word, translationPrompt: deck[0].englishPrompt, xpGained: 15, newMastery: 50, level: "BEGINNER" }]);
          }
          useQuizStore.setState({ status: 'completed' });
        }} className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 text-xs sm:text-sm bg-red-500 text-white font-black px-4 py-2 uppercase border-[3px] border-black shadow-[4px_4px_0_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all">
          Skip
        </button>
      )}
    </div>
  );
}