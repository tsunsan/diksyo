"use client"

import { useState, useEffect } from "react";
import {
  Search,
  BookOpen,
  ChevronRight,
  Star,
  Tag,
  ArrowRight,
  Bookmark,
  BookMarked,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { searchWords, saveWordToVault } from "@/app/actions/dictionary";

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

export default function DictionaryPage() {
  const [words, setWords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWords = async () => {
      setIsLoading(true);
      try {
        const results = await searchWords(search);
        setWords(results);
        if (results.length > 0 && (!selectedId || !results.find(w => w.id === selectedId))) {
            setSelectedId(results[0].id);
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
  const posStyle = word && word.partOfSpeech ? (POS_COLORS[word.partOfSpeech.toUpperCase()] || { bg: "#333", text: "#fff" }) : { bg: "#333", text: "#fff" };

  const handleSaveToVault = async (id: string) => {
    try {
        setSavingId(id);
        const result = await saveWordToVault(id);
        if (result?.error) {
            toast.error(result.error);
        } else if (result?.success === false) {
            toast.info(result.message);
        } else {
            toast.success(result?.message || "Saved successfully");
        }
    } catch (e) {
        toast.error("Failed to save word.");
    } finally {
        setSavingId(null);
    }
  };

  return (
    <div style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
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
            {isLoading ? (
                <div className="p-8 text-center text-sm font-bold uppercase text-[#888]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-black" />
                    SEARCHING...
                </div>
            ) : words.length === 0 ? (
                <div className="p-8 text-center text-sm font-bold uppercase text-[#888]">
                    NO WORDS FOUND.
                </div>
            ) : words.map((w) => {
              const posText = w.partOfSpeech || 'UNKNOWN';
              const ps = POS_COLORS[posText.toUpperCase()] || { bg: "#333", text: "#fff" };
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedId(w.id)}
                  className={`flex items-start gap-3 p-4 text-left border-[2.5px] transition-all ${
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
                    </div>
                    <p
                      className="text-[#555] text-xs uppercase tracking-wider truncate"
                      style={{ fontWeight: 600 }}
                    >
                      {w.translation ? w.translation.slice(0, 50) + "..." : ""}
                    </p>
                  </div>
                  {w.level ? (
                      <div
                        className="text-[9px] px-1.5 py-0.5 border-[1.5px] border-black mt-0.5 shrink-0"
                        style={{
                          fontWeight: 800,
                          background: LEVEL_COLORS[w.level] || "#ccc",
                          color: w.level === "INTERMEDIATE" ? "#000" : w.level === "BEGINNER" ? "#000" : "#fff",
                        }}
                      >
                        {w.level}
                      </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Word Card */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {!word ? (
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-12 text-center flex flex-col items-center justify-center">
              <Search className="w-12 h-12 text-[#ccc] mb-4" />
              <h2 className="uppercase font-black text-xl text-[#888]">SELECT A WORD</h2>
              <p className="uppercase font-bold text-xs text-[#aaa]">SEARCH AND CLICK ON A WORD TO VIEW ITS DETAILS</p>
            </div>
          ) : (
            <>
              {/* Main Card */}
              <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-6">
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      {/* POS Badge */}
                      <span
                        className="px-3 py-1.5 border-[2px] border-black text-xs uppercase tracking-widest"
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
                            className="px-2 py-1 border-[2px] border-black text-[10px] uppercase tracking-widest bg-[#f5f5f5]"
                            style={{ fontWeight: 700 }}
                          >
                            {word.frequency}
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
                      onClick={() => handleSaveToVault(word.id)}
                      disabled={savingId === word.id}
                      className={`w-10 h-10 border-[2px] border-black flex items-center justify-center transition-colors shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                        savingId === word.id ? "opacity-50 cursor-not-allowed bg-[#7C3AED]" : "bg-[#f0f0f0] hover:bg-[#7C3AED] hover:text-white"
                      }`}
                      title="Save to Vault"
                    >
                      {savingId === word.id ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Bookmark className="w-5 h-5 text-black" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-[3px] bg-black mb-4" />

                {/* Definition */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
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
                  <div className="bg-[#FDE047] border-[2px] border-black p-4 mb-5 shadow-[4px_4px_0_#000]">
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
                {(word.etymology || word.rootId) && (
                  <div className="bg-[#FFFBF0] border-[2px] border-black p-4 mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-[#FF6D00]" />
                      <span className="text-xs uppercase tracking-widest text-[#888]" style={{ fontWeight: 800 }}>
                        ETYMOLOGY & ROOT WORD
                      </span>
                    </div>
                    {word.etymology && (
                      <p className="text-[#555] text-xs uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>
                        {word.etymology}
                      </p>
                    )}
                    {word.root?.name && (
                      <button
                        onClick={() => {
                          setSearch(word.root?.name || "");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="inline-flex items-center gap-2 bg-[#FDE047] border-[2px] border-black px-3 py-1.5 text-xs uppercase tracking-widest shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:bg-[#FACC15]"
                        style={{ fontWeight: 800 }}
                      >
                        SALITANG-UGAT: {word.root?.name}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Usage notes */}
                {word.usageNotes && (
                  <div className="bg-[#E8F0FF] border-[2px] border-black p-4 mb-5">
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
                <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-1.5 h-6 bg-[#FDE047] border-l-[2px] border-black" />
                    <span className="text-sm uppercase tracking-widest text-black" style={{ fontWeight: 900 }}>
                      HALIMBAWANG PANGUNGUSAP · EXAMPLE SENTENCES
                    </span>
                  </div>

                  <div className="flex flex-col gap-4">
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
