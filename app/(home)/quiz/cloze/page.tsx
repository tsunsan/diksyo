"use client";

import { useEffect, useState, useCallback, useRef, useTransition } from "react";
import { useQuizStore, QuizWord } from "@/store/quiz-store";
import { getVaultWords } from "@/app/actions/vault";
import { submitQuizAnswer } from "@/app/actions/quiz";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown
} from "lucide-react";
import Link from "next/link";

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
    resetQuiz 
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

  // --- Initializer ---
  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVaultWords(true);
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
          startQuiz(clozeWords.sort(() => 0.5 - Math.random()).slice(0, 10));
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
    if (status !== 'typing' || isPending) return;
    
    setSelectedOption(option);
    
    startTransition(async () => {
      const timeTakenMs = Date.now() - questionStartTime;
      const currentWord = deck[currentIndex];
      
      const res = await submitQuizAnswer({
        wordId: currentWord.id,
        userAnswer: option,
        gameMode: "cloze",
        timeTakenMs
      });
      
      const isCorrect = res.success ? (res.correct || false) : false;
      
      applyAnswerResult(isCorrect);

      if (isCorrect) {
        const xp = res.xpGained || 10;
        setTotalXP(prev => prev + xp);
        setStreak(prev => {
          const newStreak = prev + 1;
          setMaxStreak(max => (newStreak > max ? newStreak : max));
          return newStreak;
        });
      } else {
        setStreak(0);
      }
      
      setResults(prev => [...prev, {
        id: currentWord.id,
        word: currentWord.word,
        translationPrompt: currentWord.englishPrompt,
        correct: isCorrect,
        xpGained: res.xpGained || 0,
        newMastery: res.newMastery || 0,
        level: res.level || "BEGINNER"
      }]);
    });
  }, [status, isPending, questionStartTime, deck, currentIndex, applyAnswerResult]);

  const handleNext = useCallback(() => {
    if (status !== 'revealed') return;
    setSelectedOption("");
    nextCard();
  }, [status, nextCard]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status === 'revealed' && e.key === "Enter") {
        e.preventDefault();
        handleNext();
      }
      
      if (status === 'typing' && !isPending) {
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
            className="w-16 h-16 bg-[#FFE500] border-4 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center"
          >
            <RefreshCw className="w-8 h-8 text-black" strokeWidth={3} />
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

  if (status === 'completed') {
    const accuracy = Math.round((correctCount / deck.length) * 100);
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center py-12 px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl w-full mx-auto flex flex-col items-center text-center"
        >
           <div className="relative">
             <Zap className="w-20 h-20 text-[#FFE500] drop-shadow-[6px_6px_0_rgba(0,0,0,1)] mb-4 relative z-10" fill="#FFE500" />
           </div>
           
           <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-black leading-none mb-6 drop-shadow-[4px_4px_0_rgba(255,229,0,1)]">
              MISSION<br/>CLEARED
           </h1>
           
           <div className="bg-black text-white p-6 md:p-10 border-[4px] border-black shadow-[12px_12px_0_#FFE500] w-full transform -rotate-1 hover:rotate-0 transition-transform mb-6">
              <div className="text-7xl md:text-8xl font-black mb-0 italic tracking-tighter text-[#FFE500]">
                {accuracy}<span className="text-4xl md:text-5xl">%</span>
              </div>
              <p className="font-bold uppercase tracking-[0.3em] text-sm text-gray-400 mb-6">Overall Accuracy</p>
              
              <div className="flex justify-around items-center border-t-[4px] border-dashed border-gray-700 pt-6">
                <div className="flex flex-col items-center">
                   <p className="text-3xl md:text-4xl font-black text-[#00C853]">{correctCount}</p>
                   <p className="text-[10px] md:text-xs uppercase font-bold text-gray-400 tracking-widest mt-1">Correct</p>
                </div>
                <div className="h-10 w-[4px] bg-gray-700"></div>
                <div className="flex flex-col items-center">
                   <p className="text-3xl md:text-4xl font-black text-[#FF6D00]">{maxStreak}</p>
                   <p className="text-[10px] md:text-xs uppercase font-bold text-gray-400 tracking-widest mt-1">Streak</p>
                </div>
                <div className="h-10 w-[4px] bg-gray-700"></div>
                <div className="flex flex-col items-center">
                   <p className="text-3xl md:text-4xl font-black text-[#FFE500]">{totalXP}</p>
                   <p className="text-[10px] md:text-xs uppercase font-bold text-gray-400 tracking-widest mt-1">XP</p>
                </div>
              </div>
           </div>

           <div className="w-full mb-6">
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
                  className="overflow-hidden mt-4"
                >
                  <div className="bg-white border-[4px] border-black shadow-[8px_8px_0_#000] text-left max-h-[250px] overflow-y-auto">
                    {results.map((res, index) => (
                      <div key={index} className={`flex items-start justify-between p-4 border-b-[2px] border-black ${res.correct ? "bg-[#f0fdf4]" : "bg-[#fff1f2]"} last:border-b-0`}>
                        <div>
                          <p className="font-black uppercase text-lg text-black">{res.word}</p>
                          <p className="text-xs uppercase font-bold text-gray-500 italic mt-1">&quot;{res.translationPrompt}&quot;</p>
                          <p className="text-[10px] uppercase font-black text-black/60 mt-1">MASTERY: {res.newMastery}%</p>
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
           
           <div className="flex flex-col sm:flex-row gap-4 w-full mb-12">
              <button 
                onClick={() => { 
                  resetQuiz(); 
                  setTotalXP(0);
                  setStreak(0);
                  setMaxStreak(0);
                  setResults([]);
                  setShowDetails(false);
                  loadQuiz(); 
                }} 
                className="flex-1 bg-[#FFE500] text-black border-[4px] border-black py-4 font-black text-xl uppercase tracking-widest hover:translate-x-[4px] hover:translate-y-[4px] shadow-[8px_8px_0_#000] hover:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <RefreshCw className="w-6 h-6" strokeWidth={3}/> Replay
              </button>
              <Link 
                href="/dictionary" 
                className="flex-1 bg-white text-black border-[4px] border-black py-4 font-black text-xl uppercase tracking-widest hover:translate-x-[4px] hover:translate-y-[4px] shadow-[8px_8px_0_#000] hover:shadow-none transition-all flex items-center justify-center active:scale-95"
              >
                Exit
              </Link>
           </div>
        </motion.div>
      </div>
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
  const cardBg = status === 'revealed' ? (isCorrect ? 'bg-[#F0FDF4]' : 'bg-[#FFF1F2]') : 'bg-white';
  const cardShake = status === 'revealed' && !isCorrect ? { x: [-10, 10, -10, 10, 0] } : {};

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-4">
      
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#4361EE] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0_#000] transform -rotate-6">
            <Puzzle className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="uppercase font-black text-2xl md:text-3xl italic tracking-tighter leading-none text-black">Cloze Deletion</h2>
            <div className="flex items-center gap-2 mt-1">
              <Keyboard className="w-4 h-4 text-gray-500" />
              <p className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-gray-500">Press 1-4 to select</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-[#FFE500] text-black border-[3px] border-black px-5 py-3 shadow-[4px_4px_0_#000] flex items-center justify-center font-black italic text-xl">
            {currentIndex + 1} / {deck.length}
          </div>
          <div className="bg-black border-[3px] border-black px-5 py-3 flex items-center gap-3 shadow-[4px_4px_0_#FFE500] hidden sm:flex">
            <Star className="w-5 h-5 text-[#FFE500]" />
            <span className="text-[#FFE500] uppercase text-lg font-black"><AnimatedNumber value={totalXP} /></span>
          </div>
          <div className="bg-[#FF6D00] border-[3px] border-black px-5 py-3 flex items-center gap-3 shadow-[4px_4px_0_#000] hidden sm:flex">
            <Flame className="w-5 h-5 text-white" />
            <span className="text-white uppercase text-lg font-black"><AnimatedNumber value={streak} /></span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white h-4 border-[3px] border-black mb-10 shadow-[4px_4px_0_#000] overflow-hidden">
        <motion.div 
          className="h-full bg-black" 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex) / deck.length) * 100}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Main Flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
           key={currentWord.id}
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ ...cardShake, opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: -20 }}
           transition={{ duration: 0.3 }}
           className={`${cardBg} border-[4px] border-black shadow-[12px_12px_0_#000] p-6 md:p-12 mb-10 relative transition-colors duration-300`}
        >
           <div className="absolute -top-4 -right-4 bg-black text-white px-4 py-1 border-[3px] border-white font-black text-xs uppercase tracking-widest shadow-[4px_4px_0_#FFE500]">
              {currentWord.partOfSpeech}
           </div>

           {/* The Sentence */}
           <div className="min-h-[140px] flex items-center justify-center text-center my-8">
              <h3 className="text-2xl md:text-4xl font-black leading-snug text-black">
                 {sentenceParts.map((part, i) => {
                    // Even indices are regular text, odd indices are the cloze word
                    if (i % 2 === 0) return <span key={i}>{part}</span>;
                    
                    if (status === 'typing') {
                      return (
                        <span key={i} className="inline-block mx-3 px-6 py-1 bg-gray-200 border-b-[6px] border-black rounded-sm align-middle min-w-[120px]">
                           &nbsp;
                        </span>
                      );
                    }
                    
                    return (
                      <span 
                        key={i} 
                        className={`inline-block mx-3 px-4 py-1 border-[3px] border-black shadow-[4px_4px_0_0_#000] transform -rotate-2 ${
                          isCorrect ? 'bg-[#00C853] text-black' : 'bg-[#FF1744] text-white'
                        }`}
                      >
                         {currentWord.word}
                      </span>
                    );
                 })}
              </h3>
           </div>
           
           {/* Hint Footer */}
           <div className="flex justify-center">
             <div className="bg-white border-[3px] border-black px-6 py-3 shadow-[4px_4px_0_#000] transform rotate-1 inline-block">
                <p className="uppercase text-[10px] font-black tracking-[0.2em] text-gray-400 mb-1">Target Translation</p>
                <p className="italic text-black font-bold text-lg">"{translationHint}"</p>
             </div>
           </div>
        </motion.div>
      </AnimatePresence>

      {/* Multiple Choice Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-32">
        {options.map((option, idx) => {
          const isCorrectOption = option.toLowerCase() === currentWord.word.toLowerCase();
          const isSelected = option === selectedOption;
          
          let btnStateClasses = "bg-white text-black hover:bg-[#FFE500] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none cursor-pointer group";
          let badgeStateClasses = "bg-black text-[#FFE500] group-hover:bg-white group-hover:text-black";
          
          if (status === 'revealed') {
            if (isCorrectOption) {
               btnStateClasses = "bg-[#00C853] text-black translate-x-[4px] translate-y-[4px] shadow-none z-10 scale-[1.02]";
               badgeStateClasses = "bg-white text-black";
            } else if (isSelected && !isCorrectOption) {
               btnStateClasses = "bg-[#FF1744] text-white translate-x-[4px] translate-y-[4px] shadow-none";
               badgeStateClasses = "bg-black text-white border-white";
            } else {
               btnStateClasses = "bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed";
               badgeStateClasses = "bg-gray-300 text-gray-500 border-gray-400";
            }
          }

          if (isPending && isSelected) {
             btnStateClasses = "bg-[#FFE500] text-black translate-x-[4px] translate-y-[4px] shadow-none cursor-wait animate-pulse";
             badgeStateClasses = "bg-white text-black";
          } else if (isPending) {
             btnStateClasses = "bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed";
             badgeStateClasses = "bg-gray-300 text-gray-500 border-gray-400";
          }

          return (
            <button
              key={idx}
              disabled={status !== 'typing' || isPending}
              onClick={() => handleOptionClick(option)}
              className={`
                border-[4px] border-black p-4 md:p-6 text-xl md:text-2xl font-black shadow-[8px_8px_0_#000] 
                transition-all duration-200 flex items-center gap-5 text-left w-full
                active:scale-95 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
                ${btnStateClasses}
              `}
            >
              <span className={`w-12 h-12 flex items-center justify-center border-[3px] border-black flex-shrink-0 text-xl transition-colors ${badgeStateClasses}`}>
                {LETTERS[idx]}
              </span>
              <span className="uppercase truncate flex-1">{option}</span>
              {isPending && isSelected && <RefreshCw className="w-6 h-6 animate-spin" />}
            </button>
          );
        })}
      </div>

      {/* Results Banner (Fixed to Bottom for immediate access) */}
      <AnimatePresence>
        {status === 'revealed' && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 p-4 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto pointer-events-auto flex flex-col sm:flex-row gap-6 items-center justify-between bg-black p-6 border-[4px] border-black shadow-[0_-8px_0_0_rgba(0,0,0,0.1)] w-full">
               <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 text-white w-full sm:w-auto justify-center sm:justify-start">
                  {isCorrect ? (
                     <div className="bg-[#00C853] p-2 border-[3px] border-white flex-shrink-0">
                       <CheckCircle2 className="w-8 h-8 text-black" strokeWidth={3} />
                     </div>
                  ) : (
                     <div className="bg-[#FF1744] p-2 border-[3px] border-white flex-shrink-0">
                       <AlertOctagon className="w-8 h-8 text-white" strokeWidth={3} />
                     </div>
                  )}
                  <div className="flex flex-col items-center sm:items-start w-full mt-2 sm:mt-0">
                     <p className="font-black italic uppercase text-3xl md:text-4xl tracking-tighter leading-none mb-2 mt-1 sm:mt-0">
                       {isCorrect ? 'Flawless!' : 'Not Quite.'}
                     </p>
                     <p className="font-bold text-xs md:text-sm uppercase tracking-widest text-gray-400">
                       {isCorrect ? `+${results[results.length-1]?.xpGained} XP` : `Target: ${currentWord.word}`}
                     </p>
                  </div>
               </div>
               
               <button 
                 onClick={handleNext} 
                 className="w-full sm:w-auto bg-white text-black border-[4px] border-black font-black uppercase text-xl px-10 py-5 flex items-center justify-center gap-3 hover:bg-[#FFE500] hover:-translate-y-1 transition-transform active:translate-y-2 flex-shrink-0"
               >
                  Continue <ArrowRight className="w-6 h-6" strokeWidth={3} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}