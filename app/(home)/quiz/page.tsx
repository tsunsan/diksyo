"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

const QUIZ_WORDS = [
  {
    id: 1,
    word: "Maganda",
    partOfSpeech: "PANG-URI",
    answer: "beautiful",
    acceptedAnswers: ["beautiful", "pretty", "lovely", "gorgeous"],
    rootWord: "Ganda",
    rootDefinition: "Beauty; loveliness",
    example: "Maganda ang umaga ngayon.",
    hint: "Describes physical appearance or scenery",
    difficulty: "EASY",
    xp: 10,
  },
  {
    id: 2,
    word: "Kalayaan",
    partOfSpeech: "PANGNGALAN",
    answer: "freedom",
    acceptedAnswers: ["freedom", "liberty", "independence"],
    rootWord: "Laya",
    rootDefinition: "Free; unbound; liberated",
    example: "Ipinaglaban nila ang kalayaan ng bansa.",
    hint: "A fundamental human right",
    difficulty: "MEDIUM",
    xp: 20,
  },
  {
    id: 3,
    word: "Umibig",
    partOfSpeech: "PANDIWA",
    answer: "to fall in love",
    acceptedAnswers: ["to fall in love", "fell in love", "to love", "love"],
    rootWord: "Ibig",
    rootDefinition: "To desire; to want; to love",
    example: "Umibig siya nang walang kondisyon.",
    hint: "A feeling, not an action",
    difficulty: "MEDIUM",
    xp: 20,
  },
  {
    id: 4,
    word: "Kaliwanagan",
    partOfSpeech: "PANGNGALAN",
    answer: "enlightenment",
    acceptedAnswers: ["enlightenment", "clarity", "illumination", "light"],
    rootWord: "Liwanag",
    rootDefinition: "Light; brightness; clarity",
    example: "Hanapin natin ang kaliwanagan.",
    hint: "The state of understanding something deeply",
    difficulty: "HARD",
    xp: 30,
  },
  {
    id: 5,
    word: "Matatag",
    partOfSpeech: "PANG-URI",
    answer: "strong",
    acceptedAnswers: ["strong", "firm", "stable", "steadfast", "resilient"],
    rootWord: "Tatag",
    rootDefinition: "Strength; stability; firmness",
    example: "Matatag ang loob niya kahit sa pagsubok.",
    hint: "Describes stability of character",
    difficulty: "EASY",
    xp: 10,
  },
];

const POS_COLORS: Record<string, string> = {
  "PANGNGALAN": "#7C3AED",
  "PANG-URI": "#0057FF",
  "PANDIWA": "#FF6D00",
};

const DIFF_COLORS: Record<string, string> = {
  EASY: "#00C853",
  MEDIUM: "#FFE500",
  HARD: "#FF1744",
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [flipped, setFlipped] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [results, setResults] = useState<{ id: number; correct: boolean; timeBonus: boolean }[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimation();
  const timerControls = useAnimation();

  const current = QUIZ_WORDS[currentIndex];

  // --- Timer Logic ---
  useEffect(() => {
    if (feedback !== "idle" || quizDone) return;

    if (timeLeft <= 0) {
      setFeedback("timeout");
      setResults((prev) => [...prev, { id: current.id, correct: false, timeBonus: false }]);
      setStreak(0);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, feedback, quizDone, current.id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || feedback !== "idle") return;

    const isCorrect = current.acceptedAnswers.some(
      (a) => a.toLowerCase() === answer.trim().toLowerCase()
    );

    if (!isCorrect) {
      await controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      });
    }

    const timeBonus = isCorrect && timeLeft > 10;
    setFeedback(isCorrect ? "correct" : "incorrect");
    setResults((prev) => [...prev, { id: current.id, correct: isCorrect, timeBonus }]);

    if (isCorrect) {
      setTotalXP((prev) => prev + current.xp + (timeBonus ? 5 : 0));
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < QUIZ_WORDS.length - 1) {
      setCurrentIndex((i) => i + 1);
      setAnswer("");
      setFeedback("idle");
      setFlipped(false);
      setTimeLeft(15);
    } else {
      setQuizDone(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswer("");
    setFeedback("idle");
    setFlipped(false);
    setTotalXP(0);
    setStreak(0);
    setResults([]);
    setQuizDone(false);
    setTimeLeft(15);
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
                { label: "STREAK", value: streak, color: "#FF6D00" },
                { label: "XP", value: totalXP, color: "#FFE500" },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8 + i * 0.1, type: "spring" }} className="bg-[#111] border-[2px] border-[#333] p-4 relative">
                  <div className="text-3xl mb-1 font-black" style={{ color: stat.color }}><AnimatedNumber value={stat.value} /></div>
                  <div className="text-[#666] text-[10px] uppercase tracking-widest font-bold">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRestart} className="w-full py-6 bg-[#FFE500] border-[4px] border-black shadow-[8px_8px_0_#000] uppercase font-black tracking-widest text-xl transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
            <RefreshCw className="w-6 h-6 inline mr-2" /> TRY AGAIN
          </motion.button>
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
            <h1 className="uppercase tracking-tighter text-black font-black text-[2rem]">DIKSYO <span className="text-[#666]">QUIZ</span></h1>
          </div>
          <div className="flex gap-2 ml-14">
             {QUIZ_WORDS.map((_, i) => (
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
          <motion.span key={currentIndex} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-black">WORD {currentIndex + 1} / {QUIZ_WORDS.length}</motion.span>
          <span className="text-2xl uppercase tracking-tighter text-black font-black">{Math.round(((currentIndex) / QUIZ_WORDS.length) * 100)}%</span>
        </div>
        <div className="h-6 bg-white border-[3px] border-black p-1 relative overflow-hidden">
          <motion.div className="h-full bg-[#FFE500] border-r-[3px] border-black" initial={{ width: 0 }} animate={{ width: `${((currentIndex) / QUIZ_WORDS.length) * 100}%` }} transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }} />
          <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-y-0 w-20 bg-white/30 skew-x-[-20deg]" />
        </div>
      </div>

      <div className="relative">
        <motion.div animate={controls}>
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex + (flipped ? "-flipped" : "")} initial={{ y: 100, opacity: 0, rotateX: 45, scale: 0.8 }} animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }} exit={{ y: -100, opacity: 0, rotateX: -45, scale: 0.8 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="border-[4px] border-black shadow-[15px_15px_0_#000] p-12 mb-8 relative overflow-hidden min-h-[400px] flex flex-col justify-center" style={{ background: cardBg, perspective: "1000px", transformStyle: "preserve-3d" }}>
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "20px 20px" }} />
            {timeLeft <= 3 && feedback === "idle" && <motion.div animate={{ opacity: [0, 0.2, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="absolute inset-0 bg-red-600 pointer-events-none" />}
            
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
              <span className="px-4 py-2 border-[2.5px] border-black text-xs uppercase tracking-widest shadow-[4px_4px_0_#000] font-black" style={{ background: POS_COLORS[current.partOfSpeech] || "#333", color: "#fff" }}>{current.partOfSpeech}</span>
              <span className="px-4 py-2 border-[2.5px] border-black text-xs uppercase tracking-widest shadow-[4px_4px_0_#000] font-black" style={{ background: DIFF_COLORS[current.difficulty], color: current.difficulty === "MEDIUM" || current.difficulty === "EASY" ? "#000" : "#fff" }}>+{current.xp} XP</span>
            </div>

            {!flipped ? (
              <div className="text-center mt-8">
                <p className="uppercase tracking-[0.3em] text-[10px] mb-6 font-black" style={{ color: cardTextColor + "cc" }}>TRANSLATE THIS WORD</p>
                <div className="relative inline-block mb-8">
                  <motion.div className="uppercase tracking-tighter font-black text-[5.5rem] leading-[0.8]" style={{ color: cardTextColor }}>
                    {current.word.split("").map((char, i) => (
                      <motion.span key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.05, type: "spring" }} className="inline-block">{char}</motion.span>
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
                            <div className="bg-black text-white px-6 py-2 mt-4 inline-block border-[2px] border-white font-black text-xs">ANSWER: {current.answer.toUpperCase()}</div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} className="text-center mt-8">
                <div className="relative inline-block mb-10">
                  <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -inset-4 bg-[#FFE500] border-[4px] border-black -z-10 shadow-[8px_8px_0_#000]" />
                  <div className="px-10 py-6">
                    <p className="text-[10px] uppercase font-black text-black/40 mb-2">ROOT WORD</p>
                    <h2 className="uppercase tracking-tighter text-black font-black text-[4rem] leading-[0.9]">{current.rootWord}</h2>
                  </div>
                </div>
                <p className="text-xl text-black/70 uppercase tracking-widest px-10 mb-8 font-black">{current.rootDefinition}</p>
                <div className="inline-block bg-white/50 border-[2px] border-black p-4"><p className="text-xs text-black uppercase font-bold">"{current.word}" is derived from "{current.rootWord}"</p></div>
              </motion.div>
            )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -right-12 top-1/2 -z-10 opacity-10"><Star className="w-32 h-32 text-black" /></motion.div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input ref={inputRef} type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={feedback !== "idle"} placeholder={feedback !== "idle" ? "" : "TYPE IN ENGLISH..."} className="flex-1 px-8 py-6 bg-white border-[4px] border-black outline-none shadow-[8px_8px_0_#000] focus:shadow-[12px_12px_0_#000] transition-all uppercase text-xl placeholder:text-[#ccc] disabled:bg-[#eee] font-black" />
          <motion.button whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }} type="submit" disabled={feedback !== "idle" || !answer.trim()} className="px-10 py-6 bg-black text-[#FFE500] border-[4px] border-black shadow-[8px_8px_0_#FFE500] uppercase font-black transition-all disabled:opacity-40 hover:bg-[#111] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">CHECK</motion.button>
        </div>
      </form>

      <div className="flex gap-4 flex-wrap items-center">
        <motion.button whileHover={{ y: -4, boxShadow: "6px 6px 0 #000" }} whileTap={{ y: 0, boxShadow: "none" }} onClick={() => setFlipped(!flipped)} className="flex items-center gap-3 px-6 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0_#000] uppercase font-black text-sm transition-all"><RotateCcw className={`w-5 h-5 transition-transform duration-500 ${flipped ? "rotate-180" : ""}`} />{flipped ? "HIDE ROOT" : "VIEW ROOT"}</motion.button>
        <motion.button whileHover={{ y: -4, boxShadow: "6px 6px 0 #000" }} whileTap={{ y: 0, boxShadow: "none" }} className="flex items-center gap-3 px-6 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0_#000] uppercase font-black text-sm transition-all"><Volume2 className="w-5 h-5" />PRONOUNCE</motion.button>
        <AnimatePresence>
          {feedback !== "idle" && (
            <motion.button initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }} whileHover={{ x: 10, backgroundColor: "#000", color: "#fff" }} onClick={handleNext} className="ml-auto flex items-center gap-4 px-10 py-4 bg-[#FFE500] text-black border-[4px] border-black shadow-[6px_6px_0_#000] uppercase font-black transition-all">
              {currentIndex < QUIZ_WORDS.length - 1 ? "NEXT CHALLENGE" : "FINISH"} <ChevronRight className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
