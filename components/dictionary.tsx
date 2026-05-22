"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  BookOpen,
  ChevronRight,
  Star,
  Tag,
  ArrowRight,
  Bookmark,
  BookMarked,
  Loader2,
  Check,
  BookmarkMinus,
  Volume2,
  ExternalLink,
  X
} from "lucide-react";
import { searchWords, saveWordToVault, removeWordFromVault } from "@/app/actions/dictionary";
import { toast } from "sonner";

const POS_COLORS: Record<string, { bg: string; text: string }> = {
  PANGNGALAN: { bg: "#7C3AED", text: "#fff" },
  "PANG-URI": { bg: "#0057FF", text: "#fff" },
  PANDIWA: { bg: "#FF6D00", text: "#fff" },
  "PANG-ABAY": { bg: "#00C853", text: "#000" },
  PANGHALIP: { bg: "#FF1744", text: "#fff" },
};

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "#00C853",
  INTERMEDIATE: "#FDE047",
  ADVANCED: "#FF6D00",
};

function highlightBold(text: string) {
  if (!text) return null;
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-[#7C3AED]" style={{ fontWeight: 900 }}>
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export default function DictionaryClient({ initialWords, initialSavedWordIds }: { initialWords: any[], initialSavedWordIds: string[] }) {
  const [words, setWords] = useState<any[]>(initialWords);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedWordIds));
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialWords.length > 0 ? initialWords[0].id : null);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [modalWord, setModalWord] = useState<any | null>(null);
  const [discoverWords, setDiscoverWords] = useState<any[]>([]);
  const [wordOfTheDay, setWordOfTheDay] = useState<any | null>(null);

  useEffect(() => {
    // Randomize discover words
    const shuffled = [...initialWords].sort(() => 0.5 - Math.random());
    setDiscoverWords(shuffled.slice(0, 5));
    
    // Stable Word of the Day based on the current date
    if (initialWords.length > 0) {
      const sortedWords = [...initialWords].sort((a, b) => a.word.localeCompare(b.word));
      const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      const stableIndex = daysSinceEpoch % sortedWords.length;
      setWordOfTheDay(sortedWords[stableIndex]);
    }
  }, [initialWords]);

  useEffect(() => {
    // Skip initial fetch on mount if search is empty
    if (!search && words === initialWords) return;

    const fetchWords = async () => {
      setIsLoading(true);
      try {
        const results = await searchWords(search);
        setWords(results);
        
        if (results.length > 0) {
            const exactMatch = results.find(w => w.word.toLowerCase() === search.toLowerCase());
            const hasSelected = selectedId && results.find(w => w.id === selectedId);
            
            if (exactMatch && exactMatch.id !== selectedId) {
                setSelectedId(exactMatch.id);
            } else if (!hasSelected) {
                setSelectedId(results[0].id);
            }
        } else if (results.length === 0) {
            setSelectedId(null);
        }
      } catch (error) {
        console.error("Failed to fetch words:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Add a small debounce if search isn't empty to prevent too many DB calls
    const timeoutId = setTimeout(() => {
      fetchWords();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const word = words.find((w) => w.id === selectedId) || null;
  const isSaved = word ? savedIds.has(word.id) : false;
  const posStyle = word && word.partOfSpeech ? (POS_COLORS[word.partOfSpeech.toUpperCase()] || { bg: "#333", text: "#fff" }) : { bg: "#333", text: "#fff" };

  const handleSaveToVault = async (id: string) => {
    try {
        setSavingId(id);
        const willSave = !savedIds.has(id);
        const result = willSave ? await saveWordToVault(id) : await removeWordFromVault(id);

        if (result?.success) {
            setSavedIds(prev => {
                const next = new Set(prev);
                if (willSave) next.add(id);
                else next.delete(id);
                return next;
            });
            
            if (willSave) {
              toast.success("ADDED TO VAULT", {
                description: `"${word?.word}" has been saved for review.`,
                duration: 3000,
                unstyled: true,
                classNames: {
                  toast: "flex items-center gap-4 w-full rounded-none border-4 border-black bg-green-400 p-4 text-black shadow-[8px_8px_0_0_#000]",
                  title: "text-lg font-black uppercase tracking-tighter",
                  description: "font-bold text-xs text-black/90 uppercase",
                  icon: "text-black w-6 h-6",
                },
              });
            } else {
              toast.success("REMOVED", {
                description: `"${word?.word}" was removed from your vault.`,
                duration: 3000,
                unstyled: true,
                classNames: {
                  toast: "flex items-center gap-4 w-full rounded-none border-4 border-black bg-yellow-400 p-4 text-black shadow-[8px_8px_0_0_#000]",
                  title: "text-lg font-black uppercase tracking-tighter",
                  description: "font-bold text-xs text-black/90 uppercase",
                  icon: "text-black w-6 h-6",
                },
              });
            }
        } else {
            toast.error(willSave ? "Failed to save word." : "Failed to remove word.");
        }
    } catch (e) {
        console.error("Vault action failed.", e);
        toast.error("An error occurred.");
    } finally {
        setSavingId(null);
    }
  };

  return (
    <div style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
      {/* Word Detail Modal */}
      <AnimatePresence>
        {modalWord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setModalWord(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-[4px] border-black shadow-[10px_10px_0_#FDE047]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-start justify-between gap-4 p-6 border-b-[3px] border-black bg-[#FFFBF0]">
                <div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span
                      className="px-2.5 py-1 border-[2px] border-black text-[10px] uppercase tracking-widest text-white shadow-[2px_2px_0_#000]"
                      style={{
                        background: (POS_COLORS[modalWord.partOfSpeech?.toUpperCase()] || { bg: "#333" }).bg,
                        fontWeight: 900,
                      }}
                    >
                      {modalWord.partOfSpeech} {modalWord.posEnglish ? `· ${modalWord.posEnglish}` : ''}
                    </span>
                    {modalWord.frequency && (
                        <span
                          className="px-2.5 py-1 border-[2px] border-black text-[10px] uppercase tracking-widest bg-white shadow-[2px_2px_0_#000]"
                          style={{ fontWeight: 900, color: "#000" }}
                        >
                          {modalWord.frequency}
                        </span>
                    )}
                    {(!modalWord.rootWordId && !modalWord.rootWordString) && (
                        <span
                          className="px-2.5 py-1 border-[2px] border-black text-[10px] uppercase tracking-widest bg-[#FF6D00] text-white shadow-[2px_2px_0_#000]"
                          style={{ fontWeight: 900 }}
                        >
                          ⭐ ROOT WORD
                        </span>
                    )}
                  </div>
                  <h2
                    className="text-black uppercase"
                    style={{ fontWeight: 900, fontSize: "3rem", lineHeight: 1, letterSpacing: "-0.02em" }}
                  >
                    {modalWord.word}
                  </h2>
                  {modalWord.pronunciation && (
                      <p
                        className="text-[#888] mt-1 text-sm uppercase tracking-widest"
                        style={{ fontWeight: 600 }}
                      >
                        {modalWord.pronunciation}
                      </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setModalWord(null)}
                    className="w-10 h-10 bg-black border-[2px] border-black flex items-center justify-center hover:bg-[#333] transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-6 flex flex-col gap-5">
                {/* Definition */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-5 bg-[#7C3AED]" />
                    <span className="text-xs uppercase tracking-widest text-[#888]" style={{ fontWeight: 800 }}>KAHULUGAN · DEFINITION</span>
                  </div>
                  {modalWord.meaningFilipino && (
                      <p className="text-black text-sm leading-relaxed mb-1.5" style={{ fontWeight: 600 }}>
                        <span className="text-[#7C3AED]" style={{ fontWeight: 900 }}>FIL: </span>{modalWord.meaningFilipino}
                      </p>
                  )}
                  {modalWord.translation && (
                      <p className="text-[#555] text-sm leading-relaxed" style={{ fontWeight: 500 }}>
                        <span className="text-[#0057FF]" style={{ fontWeight: 900 }}>EN: </span>{modalWord.translation}
                      </p>
                  )}
                </div>

                {/* Etymology */}
                {modalWord.etymology && (
                    <div className="bg-[#FFFBF0] border-[2px] border-black p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-[#FF6D00]" />
                        <span className="text-xs uppercase tracking-widest text-[#888]" style={{ fontWeight: 800 }}>ETYMOLOGY</span>
                      </div>
                      <p className="text-[#555] text-xs uppercase tracking-wider" style={{ fontWeight: 600 }}>{modalWord.etymology}</p>
                    </div>
                )}

                {/* Examples */}
                {modalWord.usageExamples && modalWord.usageExamples.length > 0 && (
                    <div>
                      <span className="text-sm uppercase tracking-widest text-black mb-3 block" style={{ fontWeight: 900 }}>EXAMPLE SENTENCES</span>
                      {modalWord.usageExamples.map((ex: any, i: number) => (
                        <div key={i} className="border-[2px] border-black p-3 mb-2" style={{ background: i % 2 === 0 ? "#FFFBF0" : "#fff" }}>
                          {ex.sentence && <p className="text-black text-sm mb-1" style={{ fontWeight: 600 }}>🇵🇭 {highlightBold(ex.sentence)}</p>}
                          {ex.translation && <p className="text-[#666] text-sm" style={{ fontWeight: 500 }}>🇺🇸 {highlightBold(ex.translation)}</p>}
                        </div>
                      ))}
                    </div>
                )}

                {/* Related words */}
                {modalWord.related && modalWord.related.length > 0 && (
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#888] mb-2 block" style={{ fontWeight: 800 }}>RELATED WORDS</span>
                      <div className="flex flex-wrap gap-2">
                        {modalWord.related.map((r: string) => (
                          <button key={r} onClick={() => { setSearch(r); setIsLoading(true); setModalWord(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="px-3 py-1.5 bg-white border-[2px] border-black text-xs uppercase tracking-wider hover:bg-black hover:text-[#FDE047] transition-colors shadow-[2px_2px_0_#000]" style={{ fontWeight: 800 }}>
                            {r} <ArrowRight className="inline-block w-3 h-3 ml-1" />
                          </button>
                        ))}
                      </div>
                    </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-[#7C3AED] border-[2px] border-black flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h1
            className="uppercase tracking-tight text-black"
            style={{ fontWeight: 900, fontSize: "1.6rem", lineHeight: 1.1 }}
          >
            DICTIONARY ENGINE
          </h1>
        </div>
        <p className="text-[#666] text-xs uppercase tracking-widest ml-11" style={{ fontWeight: 600 }}>
          EXPLORE FILIPINO WORDS IN DEPTH
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Search + Word List */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH WORDS..."
              className="w-full pl-11 pr-4 py-3 bg-white border-[2.5px] border-black outline-none focus:shadow-[4px_4px_0_#000] transition-shadow uppercase text-sm"
              style={{ fontWeight: 700 }}
            />
          </div>

          {/* Word list */}
          <div className="flex flex-col gap-2">
            {!search && (
              <div className="mb-1 text-center">
                <p className="text-[10px] text-black uppercase tracking-widest font-black bg-[#FDE047] border-[2px] border-black py-1.5 px-2 mb-1 shadow-[2px_2px_0_#000]">
                  DISCOVER THESE WORDS
                </p>
              </div>
            )}
            
            {isLoading ? (
                <div className="p-8 text-center text-sm font-bold uppercase text-[#888]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-black" />
                    SEARCHING...
                </div>
            ) : (!search ? discoverWords : words).length === 0 ? (
                <div className="p-8 text-center text-sm font-bold uppercase text-[#888]">
                    NO WORDS FOUND.
                </div>
            ) : (!search ? discoverWords : words.slice(0, 5)).map((w) => {
              const posText = w.partOfSpeech || 'UNKNOWN';
              const ps = POS_COLORS[posText.toUpperCase()] || { bg: "#333", text: "#fff" };
              return (
                <div
                  key={w.id}
                  onClick={() => setSelectedId(w.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(w.id);
                    }
                  }}
                  className={`flex items-start gap-3 p-4 text-left border-[2.5px] transition-all cursor-pointer ${
                    selectedId === w.id
                      ? "bg-[#FDE047] border-black shadow-[4px_4px_0_#000]"
                      : "bg-white border-black hover:shadow-[3px_3px_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-black uppercase"
                        style={{ fontWeight: 900, fontSize: "1rem" }}
                      >
                        {w.word}
                      </span>
                      {w.posEnglish ? (
                          <span
                            className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 border-[1.5px] border-black"
                            style={{
                              fontWeight: 800,
                              background: ps.bg,
                              color: ps.text,
                            }}
                          >
                            {w.posEnglish}
                          </span>
                      ) : null}
                      {(!w.rootWordId && !w.rootWordString) && (
                          <span
                            className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 border-[1.5px] border-black bg-[#FF6D00] text-white"
                            style={{ fontWeight: 800 }}
                          >
                            ROOT
                          </span>
                      )}
                    </div>
                    <p
                      className="text-[#555] text-xs uppercase tracking-wider truncate"
                      style={{ fontWeight: 600 }}
                    >
                      {w.translation ? w.translation.slice(0, 50) + "..." : ""}
                    </p>
                  </div>
                  {/* Open modal button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalWord(w);
                    }}
                    className="w-7 h-7 border-[1.5px] border-black flex items-center justify-center flex-shrink-0 hover:bg-[#7C3AED] hover:border-[#7C3AED] hover:text-white transition-all mt-0.5"
                    title="Quick view"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
          
          {!search && (
            <p className="text-center text-[10px] text-[#aaa] uppercase tracking-widest mt-2" style={{ fontWeight: 600 }}>CLICK 🔗 FOR QUICK VIEW</p>
          )}

          {/* Word of the Day Gradient Card */}
          {wordOfTheDay && !search && (
            <div className="mt-4 bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5 relative overflow-hidden flex flex-col justify-between cursor-pointer group active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all" onClick={() => setSelectedId(wordOfTheDay.id)}>
              {/* Decorative background shape */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#7C3AED] rounded-full opacity-30 blur-2xl group-hover:bg-[#FF6D00] transition-colors duration-700"></div>
              <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-[#FDE047] rounded-full opacity-40 blur-xl group-hover:bg-[#0057FF] transition-colors duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-black" style={{ fill: "#FF6D00" }} />
                  <span className="text-xs font-black uppercase tracking-widest text-black">WORD OF THE DAY</span>
                </div>
                
                <h3 className="text-black uppercase mb-1" style={{ fontWeight: 900, fontSize: "2rem", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {wordOfTheDay.word}
                </h3>
                
                <p className="text-[#333] text-xs uppercase tracking-wider mb-4" style={{ fontWeight: 600 }}>
                  {wordOfTheDay.partOfSpeech}
                </p>
                
                <div className="h-[2px] bg-black w-full mb-3 opacity-20"></div>
                
                <p className="text-[#555] text-sm leading-snug line-clamp-2" style={{ fontWeight: 500 }}>
                  {wordOfTheDay.meaningFilipino || wordOfTheDay.translation || "Tuklasin ang kahulugan ng salitang ito."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Main Word Card */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {!word ? (
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              {isLoading ? (
                <>
                  <Loader2 className="w-12 h-12 text-black animate-spin mb-4" />
                  <h2 className="uppercase font-black text-xl text-[#888]">LOADING WORD...</h2>
                </>
              ) : (
                <>
                  <Search className="w-12 h-12 text-[#ccc] mb-4" />
                  <h2 className="uppercase font-black text-xl text-[#888]">SELECT A WORD</h2>
                  <p className="uppercase font-bold text-xs text-[#aaa]">SEARCH AND CLICK ON A WORD TO VIEW ITS DETAILS</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Main Card */}
              <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-4">
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {/* POS Badge */}
                      <span
                        className="px-2.5 py-1 border-[2px] border-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0_#000]"
                        style={{
                          fontWeight: 900,
                          background: posStyle.bg,
                          color: posStyle.text,
                        }}
                      >
                        {word.partOfSpeech} {word.posEnglish ? `· ${word.posEnglish}` : ''}
                      </span>
                      {/* Frequency */}
                      {word.frequency && (
                          <span
                            className="px-2.5 py-1 border-[2px] border-black text-[10px] uppercase tracking-widest bg-white shadow-[2px_2px_0_#000]"
                            style={{ fontWeight: 900, color: "#000" }}
                          >
                            {word.frequency}
                          </span>
                      )}
                      {(!word.rootWordId && !word.rootWordString) && (
                          <span
                            className="px-2.5 py-1 border-[2px] border-black text-[10px] uppercase tracking-widest bg-[#FF6D00] text-white shadow-[2px_2px_0_#000]"
                            style={{ fontWeight: 900 }}
                          >
                            ⭐ ROOT WORD
                          </span>
                      )}
                    </div>

                    <h2
                      className="text-black uppercase"
                      style={{ fontWeight: 900, fontSize: "2.8rem", lineHeight: 1, letterSpacing: "-0.02em" }}
                    >
                      {word.word}
                    </h2>
                    {word.pronunciation && (
                        <p className="text-[#888] mt-1 text-sm uppercase tracking-widest" style={{ fontWeight: 600 }}>
                          {word.pronunciation}
                        </p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      className="w-10 h-10 bg-[#f0f0f0] border-[2px] border-black flex items-center justify-center transition-colors shadow-[2px_2px_0_#000] relative group cursor-not-allowed"
                      aria-label="Listen (Coming Soon)"
                    >
                      <Volume2 className="w-5 h-5 text-[#888]" />
                      <span className="absolute -bottom-10 z-50 bg-[#FDE047] text-black border-[2px] border-black font-black text-[10px] uppercase px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-[4px_4px_0_#000] whitespace-nowrap pointer-events-none">
                        Coming Soon
                      </span>
                    </button>
                    <button
                      onClick={() => handleSaveToVault(word.id)}
                      disabled={savingId === word.id}
                      className={`px-3 h-10 border-[2px] border-black flex items-center justify-center gap-1.5 transition-colors shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs font-black uppercase tracking-widest ${
                        isSaved ? "bg-[#7C3AED] text-white" : "bg-[#f0f0f0] hover:bg-[#7C3AED] hover:text-white text-black"
                      }`}
                      title={isSaved ? "Remove from Vault" : "Save to Vault"}
                    >
                      {savingId === word.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-current" />
                      ) : isSaved ? (
                        <BookMarked className="w-4 h-4 text-current" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-current" />
                      )}
                      <span>{savingId === word.id ? "UPDATING" : isSaved ? "SAVED" : "SAVE"}</span>
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-[3px] bg-black mb-3" />

                {/* Definition */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-6 bg-[#7C3AED]" />
                    <span className="text-xs uppercase tracking-widest text-[#888]" style={{ fontWeight: 800 }}>
                      KAHULUGAN · DEFINITION
                    </span>
                  </div>
                  {word.meaningFilipino && (
                      <p className="text-black text-sm leading-relaxed mb-2" style={{ fontWeight: 600 }}>
                        <span className="text-[#7C3AED]" style={{ fontWeight: 900 }}>FIL: </span>
                        {word.meaningFilipino}
                      </p>
                  )}
                  {word.translation && (
                      <p className="text-[#555] text-sm leading-relaxed" style={{ fontWeight: 500 }}>
                        <span className="text-[#0057FF]" style={{ fontWeight: 900 }}>EN: </span>
                        {word.translation}
                      </p>
                  )}
                </div>

                {/* Original Explanation / Witty Take */}
                {word.originalExplanation && (
                  <div className="bg-[#FDE047] border-[2px] border-black p-4 mb-4 shadow-[4px_4px_0_#000]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs uppercase tracking-widest text-black" style={{ fontWeight: 900 }}>
                        💡 THE REAL DEAL
                      </span>
                    </div>
                    <p className="text-black text-sm leading-relaxed" style={{ fontWeight: 700 }}>
                      {word.originalExplanation}
                    </p>
                  </div>
                )}

                {/* Etymology / Root Word */}
                {(word.etymology || word.rootWordId || word.rootWordString) && (
                  <div className="bg-[#FFFBF0] border-[2px] border-black p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-[#FF6D00]" />
                      <span className="text-xs uppercase tracking-widest text-[#888]" style={{ fontWeight: 800 }}>
                        {word.etymology && (word.rootWord?.word || word.rootWordString) ? "ETYMOLOGY & ROOT WORD" : word.etymology ? "ETYMOLOGY" : "ROOT WORD"}
                      </span>
                    </div>
                    {word.etymology && (
                      <p className="text-[#555] text-xs uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>
                        {word.etymology}
                      </p>
                    )}
                    {(word.rootWord?.word || word.rootWordString) && (
                      <div className="flex flex-col items-start gap-2">
                        <button
                          onClick={() => {
                            if (word.rootWordId) setSelectedId(word.rootWordId);
                            setSearch(word.rootWord?.word || word.rootWordString || "");
                            setIsLoading(true);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="inline-flex items-center gap-2 bg-[#FDE047] border-[2px] border-black px-3 py-1.5 text-xs uppercase tracking-widest shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:bg-[#FACC15]"
                          style={{ fontWeight: 800 }}
                        >
                          SALITANG-UGAT: {word.rootWord?.word || word.rootWordString}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        {word.rootWord?.translation && (
                          <p className="text-[#333] text-xs uppercase font-bold tracking-wide pl-1">
                            ROOT MEANING: <span className="text-[#0057FF]">{word.rootWord.translation}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Usage notes */}
                {word.usageNotes && (
                  <div className="bg-[#E8F0FF] border-[2px] border-black p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-[#0057FF]" />
                      <span className="text-xs uppercase tracking-widest text-[#0057FF]" style={{ fontWeight: 800 }}>
                        USAGE NOTES
                      </span>
                    </div>
                    <p className="text-[#333] text-xs leading-relaxed" style={{ fontWeight: 600 }}>
                      {word.usageNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Example Sentences */}
              {word.usageExamples && word.usageExamples.length > 0 && (
                <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-6 bg-[#FDE047] border-l-[2px] border-black" />
                    <span className="text-sm uppercase tracking-widest text-black" style={{ fontWeight: 900 }}>
                      HALIMBAWANG PANGUNGUSAP · EXAMPLE SENTENCES
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {word.usageExamples.map((ex: any, i: number) => (
                      <div
                        key={i}
                        className="border-[2px] border-black p-4"
                        style={{ background: i % 2 === 0 ? "#FFFBF0" : "#fff" }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="w-6 h-6 bg-black text-white flex items-center justify-center text-xs shrink-0 mt-0.5"
                            style={{ fontWeight: 900 }}
                          >
                            {i + 1}
                          </span>
                          <div>
                            {ex.sentence && (
                                <p className="text-black text-sm leading-relaxed mb-1.5" style={{ fontWeight: 600 }}>
                                  🇵🇭 {highlightBold(ex.sentence)}
                                </p>
                            )}
                            {ex.translation && (
                                <p className="text-[#666] text-sm leading-relaxed" style={{ fontWeight: 500 }}>
                                  🇺🇸 {highlightBold(ex.translation)}
                                </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Words + Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Related */}
                {word.related && word.related.length > 0 && (
                  <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5">
                    <span className="text-xs uppercase tracking-widest text-black mb-4 block" style={{ fontWeight: 900 }}>
                      RELATED WORDS
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {word.related.map((r: string) => (
                        <button
                          key={r}
                          onClick={() => {
                            setSearch(r);
                            setIsLoading(true);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="px-3 py-1.5 bg-white border-[2px] border-black text-xs uppercase tracking-wider hover:bg-black hover:text-[#FDE047] transition-colors shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                          style={{ fontWeight: 800 }}
                        >
                          {r}
                          <ArrowRight className="inline-block w-3 h-3 ml-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5">
                  {(word.tags && word.tags.length > 0) && (
                      <>
                        <span className="text-xs uppercase tracking-widest text-black mb-4 block" style={{ fontWeight: 900 }}>
                          CATEGORIES
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {word.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-3 py-1.5 bg-[#7C3AED] text-white border-[2px] border-black text-xs uppercase tracking-wider"
                              style={{ fontWeight: 800 }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </>
                  )}
                  {word.level && (
                    <div className={`pt-3 ${word.tags && word.tags.length > 0 ? "mt-4 border-t-[2px] border-black" : ""}`}>
                      <span
                        className="text-xs uppercase tracking-widest px-2 py-1 border-[2px] border-black inline-block"
                        style={{
                          fontWeight: 800,
                          background: LEVEL_COLORS[word.level] || "#ccc",
                          color: word.level === "ADVANCED" ? "#fff" : "#000",
                        }}
                      >
                        LEVEL: {word.level}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
