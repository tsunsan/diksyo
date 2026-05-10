"use client"

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
} from "lucide-react";

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

type FeedbackState = "idle" | "correct" | "incorrect";

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [flipped, setFlipped] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [results, setResults] = useState<{ id: number; correct: boolean }[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = QUIZ_WORDS[currentIndex];

  useEffect(() => {
    if (feedback === "idle" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [feedback, currentIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || feedback !== "idle") return;

    const isCorrect = current.acceptedAnswers.some(
      (a) => a.toLowerCase() === answer.trim().toLowerCase()
    );

    setFeedback(isCorrect ? "correct" : "incorrect");
    setResults((prev) => [...prev, { id: current.id, correct: isCorrect }]);

    if (isCorrect) {
      setTotalXP((prev) => prev + current.xp);
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
  };

  const correctCount = results.filter((r) => r.correct).length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  const cardBg =
    feedback === "correct"
      ? "#00C853"
      : feedback === "incorrect"
      ? "#FF1744"
      : "#fff";

  const cardTextColor =
    feedback === "correct" ? "#fff" : feedback === "incorrect" ? "#fff" : "#000";

  // Quiz Done screen
  if (quizDone) {
    return (
      <div style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-[#FFE500] border-[2px] border-black flex items-center justify-center">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <h1 className="uppercase tracking-tight text-black" style={{ fontWeight: 900, fontSize: "1.6rem" }}>
                QUIZ COMPLETE!
              </h1>
            </div>
          </div>

          {/* Results card */}
          <div className="bg-black border-[3px] border-black shadow-[8px_8px_0_#FFE500] p-8 text-center mb-6">
            <div className="text-[#FFE500] text-7xl mb-4" style={{ fontWeight: 900 }}>
              {accuracy}%
            </div>
            <p className="text-white uppercase tracking-widest text-sm mb-6" style={{ fontWeight: 700 }}>
              ACCURACY RATE
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#111] border-[2px] border-[#333] p-4">
                <div className="text-[#00C853] text-2xl mb-1" style={{ fontWeight: 900 }}>
                  {correctCount}
                </div>
                <div className="text-[#666] text-xs uppercase tracking-widest" style={{ fontWeight: 700 }}>
                  CORRECT
                </div>
              </div>
              <div className="bg-[#111] border-[2px] border-[#333] p-4">
                <div className="text-[#FF1744] text-2xl mb-1" style={{ fontWeight: 900 }}>
                  {QUIZ_WORDS.length - correctCount}
                </div>
                <div className="text-[#666] text-xs uppercase tracking-widest" style={{ fontWeight: 700 }}>
                  INCORRECT
                </div>
              </div>
              <div className="bg-[#111] border-[2px] border-[#333] p-4">
                <div className="text-[#FFE500] text-2xl mb-1" style={{ fontWeight: 900 }}>
                  +{totalXP}
                </div>
                <div className="text-[#666] text-xs uppercase tracking-widest" style={{ fontWeight: 700 }}>
                  XP EARNED
                </div>
              </div>
            </div>
          </div>

          {/* Word results */}
          <div className="flex flex-col gap-2 mb-6">
            {results.map((r, i) => {
              const w = QUIZ_WORDS.find((q) => q.id === r.id)!;
              return (
                <div
                  key={r.id}
                  className={`flex items-center gap-4 p-4 border-[2.5px] border-black ${r.correct ? "bg-[#00C853]/10" : "bg-[#FF1744]/10"}`}
                >
                  <div
                    className={`w-8 h-8 border-[2px] border-black flex items-center justify-center shrink-0 ${r.correct ? "bg-[#00C853]" : "bg-[#FF1744]"}`}
                  >
                    {r.correct ? <Check className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <span className="text-black uppercase" style={{ fontWeight: 900 }}>
                      {w.word}
                    </span>
                    <span className="text-[#888] text-xs ml-2 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      → {w.answer}
                    </span>
                  </div>
                  <span className={`text-xs uppercase tracking-wider px-2 py-1 border-[1.5px] border-black ${r.correct ? "bg-[#00C853] text-black" : "bg-[#FF1744] text-white"}`} style={{ fontWeight: 800 }}>
                    {r.correct ? `+${w.xp} XP` : "MISS"}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRestart}
            className="w-full py-4 bg-[#FFE500] border-[3px] border-black shadow-[5px_5px_0_#000] uppercase tracking-widest flex items-center justify-center gap-2 active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all hover:bg-[#f5d800]"
            style={{ fontWeight: 900 }}
          >
            <RefreshCw className="w-5 h-5" />
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-[#FFE500] border-[2px] border-black flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <h1 className="uppercase tracking-tight text-black" style={{ fontWeight: 900, fontSize: "1.6rem" }}>
              QUICK QUIZ
            </h1>
          </div>
          <p className="text-[#666] text-xs uppercase tracking-widest ml-11" style={{ fontWeight: 600 }}>
            TYPE THE ENGLISH MEANING OF EACH WORD
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="bg-black border-[2px] border-black px-4 py-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-[#FFE500]" />
            <span className="text-[#FFE500] uppercase text-sm" style={{ fontWeight: 900 }}>
              {totalXP} XP
            </span>
          </div>
          <div className="bg-[#FF6D00] border-[2px] border-black px-4 py-2 flex items-center gap-2">
            <Flame className="w-4 h-4 text-white" />
            <span className="text-white uppercase text-sm" style={{ fontWeight: 900 }}>
              {streak} STREAK
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest text-[#888]" style={{ fontWeight: 700 }}>
            WORD {currentIndex + 1} OF {QUIZ_WORDS.length}
          </span>
          <span className="text-xs uppercase tracking-widest text-[#888]" style={{ fontWeight: 700 }}>
            {Math.round(((currentIndex) / QUIZ_WORDS.length) * 100)}% COMPLETE
          </span>
        </div>
        <div className="h-4 bg-white border-[2px] border-black">
          <div
            className="h-full bg-[#FFE500] transition-all duration-500"
            style={{ width: `${((currentIndex) / QUIZ_WORDS.length) * 100}%` }}
          />
        </div>
        <div className="flex gap-1 mt-1">
          {QUIZ_WORDS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1"
              style={{
                background:
                  i < results.length
                    ? results[i].correct
                      ? "#00C853"
                      : "#FF1744"
                    : i === currentIndex
                    ? "#FFE500"
                    : "#ddd",
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Main Card */}
        <div
          className="border-[3px] border-black shadow-[8px_8px_0_#000] p-8 mb-6 transition-all duration-300 relative"
          style={{ background: cardBg }}
        >
          {/* Difficulty badge */}
          <div className="flex items-center justify-between mb-6">
            <span
              className="px-3 py-1.5 border-[2px] border-black text-xs uppercase tracking-widest"
              style={{
                fontWeight: 800,
                background: POS_COLORS[current.partOfSpeech] || "#333",
                color: "#fff",
              }}
            >
              {current.partOfSpeech}
            </span>
            <span
              className="px-3 py-1.5 border-[2px] border-black text-xs uppercase tracking-widest"
              style={{
                fontWeight: 800,
                background: DIFF_COLORS[current.difficulty],
                color: current.difficulty === "MEDIUM" ? "#000" : current.difficulty === "EASY" ? "#000" : "#fff",
              }}
            >
              +{current.xp} XP
            </span>
          </div>

          {/* Word display */}
          {!flipped ? (
            <div className="text-center">
              <p
                className="uppercase tracking-widest text-xs mb-3"
                style={{ fontWeight: 700, color: feedback === "idle" ? "#888" : cardTextColor + "cc" }}
              >
                WHAT DOES THIS WORD MEAN?
              </p>
              <div
                className="uppercase tracking-tight mb-4"
                style={{
                  fontWeight: 900,
                  fontSize: "4rem",
                  lineHeight: 1,
                  color: cardTextColor,
                }}
              >
                {current.word}
              </div>
              <p
                className="text-sm uppercase tracking-widest mb-6 italic"
                style={{ fontWeight: 600, color: feedback === "idle" ? "#888" : cardTextColor + "99" }}
              >
                "{current.example}"
              </p>

              {feedback === "idle" && (
                <p
                  className="text-xs uppercase tracking-wider px-4 py-2 border-[2px] border-black/20 inline-block"
                  style={{ fontWeight: 600, color: "#888" }}
                >
                  HINT: {current.hint}
                </p>
              )}

              {/* Feedback overlay */}
              {feedback !== "idle" && (
                <div className="text-center">
                  {feedback === "correct" ? (
                    <div>
                      <div className="w-16 h-16 bg-white border-[3px] border-black flex items-center justify-center mx-auto mb-3 shadow-[4px_4px_0_#000]">
                        <Check className="w-10 h-10 text-[#00C853]" />
                      </div>
                      <p className="text-white uppercase tracking-widest" style={{ fontWeight: 900, fontSize: "1.4rem" }}>
                        TAMA! CORRECT!
                      </p>
                      <p className="text-white/80 text-sm uppercase tracking-widest mt-1" style={{ fontWeight: 700 }}>
                        +{current.xp} XP EARNED
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-16 h-16 bg-white border-[3px] border-black flex items-center justify-center mx-auto mb-3 shadow-[4px_4px_0_#000]">
                        <X className="w-10 h-10 text-[#FF1744]" />
                      </div>
                      <p className="text-white uppercase tracking-widest" style={{ fontWeight: 900, fontSize: "1.4rem" }}>
                        MALI! WRONG!
                      </p>
                      <p className="text-white/80 text-sm uppercase tracking-widest mt-1" style={{ fontWeight: 700 }}>
                        CORRECT ANSWER: {current.answer.toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Flipped: show root word */
            <div className="text-center">
              <p
                className="uppercase tracking-widest text-xs mb-3"
                style={{ fontWeight: 700, color: "#888" }}
              >
                SALITANG-UGAT · ROOT WORD
              </p>
              <div className="bg-[#FFE500] border-[3px] border-black p-6 inline-block shadow-[4px_4px_0_#000] mb-4">
                <div
                  className="uppercase tracking-tight text-black"
                  style={{ fontWeight: 900, fontSize: "3rem", lineHeight: 1 }}
                >
                  {current.rootWord}
                </div>
              </div>
              <p className="text-[#555] text-sm uppercase tracking-wider" style={{ fontWeight: 600 }}>
                {current.rootDefinition}
              </p>
              <div className="mt-4 pt-4 border-t-[2px] border-black/20">
                <p className="text-[#333] text-sm" style={{ fontWeight: 600 }}>
                  "{current.word}" comes from "{current.rootWord}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={feedback !== "idle"}
              placeholder={feedback !== "idle" ? "" : "TYPE YOUR ANSWER IN ENGLISH..."}
              className="flex-1 px-5 py-4 bg-white border-[3px] border-black outline-none focus:shadow-[4px_4px_0_#000] transition-shadow uppercase text-sm disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
              style={{ fontWeight: 700 }}
            />
            <button
              type="submit"
              disabled={feedback !== "idle" || !answer.trim()}
              className="px-6 py-4 bg-black text-[#FFE500] border-[3px] border-black shadow-[4px_4px_0_#FFE500] uppercase tracking-widest active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#111]"
              style={{ fontWeight: 900 }}
            >
              CHECK
            </button>
          </div>
        </form>

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFlipped(!flipped)}
            className="flex items-center gap-2 px-4 py-3 bg-white border-[2.5px] border-black shadow-[3px_3px_0_#000] uppercase tracking-widest text-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all hover:bg-[#f5f5f5]"
            style={{ fontWeight: 800 }}
          >
            <RotateCcw className="w-4 h-4" />
            {flipped ? "HIDE ROOT" : "SHOW ROOT"}
          </button>

          <button
            className="flex items-center gap-2 px-4 py-3 bg-white border-[2.5px] border-black shadow-[3px_3px_0_#000] uppercase tracking-widest text-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all hover:bg-[#f5f5f5]"
            style={{ fontWeight: 800 }}
          >
            <Volume2 className="w-4 h-4" />
            LISTEN
          </button>

          {feedback !== "idle" && (
            <button
              onClick={handleNext}
              className="ml-auto flex items-center gap-2 px-6 py-3 bg-black text-white border-[2.5px] border-black shadow-[4px_4px_0_#FFE500] uppercase tracking-widest text-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all hover:bg-[#111]"
              style={{ fontWeight: 900 }}
            >
              {currentIndex < QUIZ_WORDS.length - 1 ? "NEXT WORD" : "SEE RESULTS"}
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
