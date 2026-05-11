"use client";

import { useState, useEffect, useRef } from "react";
import { BookMarked, ChevronRight, Plus, Search, Tag, CheckCircle2, Clock, PlayCircle, Sparkles, Loader2, ArrowDownUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { searchWordBySlug } from "@/app/actions/dictionary";
import { addWordToVault } from "@/app/actions/vault";
import { toast } from "sonner";

// The shape of our fetched data
type VaultEntry = {
  id: string;
  nextReview: Date | string | null;
  lastReview: Date | string | null;
  mastery: number | null;
  stability: number | null;
  word: {
    id: string;
    word: string;
    translation: string;
    partOfSpeech: string | null;
    tags: string[] | null;
  };
};

function getMasteryStatus(entry: VaultEntry) {
  const percent = entry.mastery ?? 0;
  const suffix = ` (${percent}%)`;
  
  if (!entry.lastReview) {
    return { label: "NEW" + suffix, bg: "bg-[#3B82F6]", icon: Sparkles };
  }
  const now = new Date();
  const nextDate = entry.nextReview ? new Date(entry.nextReview) : null;
  if (nextDate && nextDate <= now) {
    return { label: "DUE" + suffix, bg: "bg-[#EF4444]", icon: Clock };
  }
  if (entry.stability && entry.stability > 50) {
    return { label: "MASTERED" + suffix, bg: "bg-[#10B981]", icon: CheckCircle2 };
  }
  return { label: "LEARNING" + suffix, bg: "bg-[#F59E0B]", icon: PlayCircle };
}

const ALL_TAGS = ["ALL", "DAMDAMIN", "RELASYON", "BANSA", "KASAYSAYAN", "KATANGIAN", "KAPALIGIRAN", "KARAKTER", "KILOS"];

export default function VaultClient({ initialWords }: { initialWords: VaultEntry[] }) {
  const [activeTag, setActiveTag] = useState("ALL");
  const [vaultSearch, setVaultSearch] = useState("");
  const [sortBy, setSortBy] = useState("DATE");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dialog Search State
  const [dialogQuery, setDialogQuery] = useState("");
  const [debouncedDialogQuery, setDebouncedDialogQuery] = useState("");
  const [dialogResults, setDialogResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingWordId, setAddingWordId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDialogQuery(dialogQuery), 300);
    return () => clearTimeout(timer);
  }, [dialogQuery]);

  useEffect(() => {
    async function fetchSuggestions() {
      if (!debouncedDialogQuery.trim()) {
        setDialogResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await searchWordBySlug(debouncedDialogQuery.toLowerCase());
        if (res.status === "FOUND") {
          setDialogResults([res.data]);
        } else if (res.status === "SIMILAR" && res.data) {
          setDialogResults(res.data);
        } else {
          setDialogResults([]);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }
    fetchSuggestions();
  }, [debouncedDialogQuery]);

  const handleAddWord = async (wordId: string, word: string) => {
    setAddingWordId(wordId);
    try {
      const res = await addWordToVault(wordId);
      if (res.success) {
        toast.success(`${word.toUpperCase()} ADDED TO VAULT!`);
        setIsDialogOpen(false);
        setDialogQuery("");
      } else {
        toast.error(res.error || "FAILED TO ADD WORD");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setAddingWordId(null);
    }
  };

  const sortedAndFilteredVault = initialWords
    .filter((entry) => {
      const w = entry.word;
      const wordTags = w.tags || [];
      const matchTag = activeTag === "ALL" || wordTags.includes(activeTag);
      const matchSearch =
        w.word.toLowerCase().includes(vaultSearch.toLowerCase()) ||
        w.translation.toLowerCase().includes(vaultSearch.toLowerCase());
      return matchTag && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "ALPHA") {
        return a.word.word.localeCompare(b.word.word);
      } else if (sortBy === "MASTERY") {
        return (b.mastery ?? 0) - (a.mastery ?? 0);
      } else {
        // DATE (Next Review)
        const dateA = a.nextReview ? new Date(a.nextReview).getTime() : 0;
        const dateB = b.nextReview ? new Date(b.nextReview).getTime() : 0;
        return dateB - dateA; // Most recently due/added first
      }
    });

  return (
    <div style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
      <div className="flex flex-col gap-5">
        {/* Vault Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <BookMarked className="w-5 h-5 text-[#7C3AED]" />
              <h2 className="uppercase tracking-tight text-black" style={{ fontWeight: 900, fontSize: "1.4rem" }}>
                PERSONAL VOCABULARY VAULT
              </h2>
            </div>
            <p className="text-[#888] text-xs uppercase tracking-widest" style={{ fontWeight: 600 }}>
              {initialWords.length} WORDS SAVED
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<button className="flex items-center gap-2 px-5 py-3 bg-[#7C3AED] text-white border-[2.5px] border-black shadow-[4px_4px_0_#000] uppercase tracking-widest text-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all hover:bg-[#6d28d9]" style={{ fontWeight: 900 }} />}>
              <Plus className="w-4 h-4" />
              ADD WORD
            </DialogTrigger>
            <DialogContent className="border-[3px] border-black rounded-none shadow-[8px_8px_0_#000] p-6 max-w-md w-full">
              <DialogHeader>
                <DialogTitle className="uppercase font-black text-xl tracking-tighter italic">
                  SEARCH & ADD WORDS
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" />
                  <input
                    type="text"
                    value={dialogQuery}
                    onChange={(e) => setDialogQuery(e.target.value)}
                    placeholder="SEARCH DICTIONARY..."
                    className="w-full pl-11 pr-4 py-3 bg-white border-[2.5px] border-black outline-none focus:shadow-[4px_4px_0_#000] transition-shadow uppercase text-sm font-bold"
                  />
                  {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-[#888]" />}
                </div>

                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  {dialogResults.length === 0 && debouncedDialogQuery && !isSearching && (
                     <div className="p-4 text-center text-xs font-bold uppercase text-[#888] border-[2.5px] border-dashed border-[#ccc]">
                       NO WORDS FOUND
                     </div>
                  )}
                  {dialogResults.map(res => {
                    const isAlreadyInVault = initialWords.some(entry => entry.word.id === res.id);
                    return (
                      <div key={res.id} className="flex flex-col gap-2 p-3 border-[2px] border-black hover:bg-[#FFFBF0] transition-colors">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0 flex-1 break-words">
                            <span className="font-black uppercase text-lg leading-tight block mb-1">{res.word}</span>
                            <p className="text-xs font-bold text-[#666] uppercase leading-snug">{res.translation}</p>
                          </div>
                          <button 
                            onClick={() => handleAddWord(res.id, res.word)}
                            disabled={addingWordId === res.id || isAlreadyInVault}
                            className="mt-0.5 px-3 py-1.5 shrink-0 bg-[#10B981] text-white font-black text-[10px] uppercase tracking-widest border-[2px] border-black shadow-[2px_2px_0_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
                          >
                            {addingWordId === res.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : isAlreadyInVault ? "ADDED" : "ADD"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-4 h-auto sm:h-12">
          <div className="relative flex-1 h-12 sm:h-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" />
            <input
              type="text"
              value={vaultSearch}
              onChange={(e) => setVaultSearch(e.target.value)}
              placeholder="SEARCH YOUR VAULT..."
              className="w-full h-full pl-11 pr-4 py-0 bg-white border-[2.5px] border-black outline-none focus:shadow-[4px_4px_0_#000] transition-shadow uppercase text-sm font-bold"
            />
          </div>
          <div className="relative shrink-0 h-12 sm:h-full w-full sm:w-[220px]" ref={sortRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center justify-between w-full h-full pl-11 pr-4 py-0 bg-white border-[2.5px] border-black outline-none focus:shadow-[4px_4px_0_#000] transition-shadow cursor-pointer"
            >
              <ArrowDownUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" />
              <span className="uppercase text-sm font-bold truncate">
                {sortBy === "DATE" ? "RECENTLY ADDED" : sortBy === "ALPHA" ? "A-Z" : "MASTERY LEVEL"}
              </span>
              <ChevronRight className={`w-4 h-4 text-[#888] transition-transform ${isSortOpen ? "-rotate-90" : "rotate-90"}`} />
            </button>

            {isSortOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-[2.5px] border-black shadow-[4px_4px_0_#000] z-50 flex flex-col">
                {[
                  { id: "DATE", label: "RECENTLY ADDED" },
                  { id: "ALPHA", label: "A-Z" },
                  { id: "MASTERY", label: "MASTERY LEVEL" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id);
                      setIsSortOpen(false);
                    }}
                    className={`text-left px-4 py-3 uppercase text-sm font-bold hover:bg-[#FFFBF0] transition-colors border-b-[2px] border-black last:border-b-0 ${
                      sortBy === option.id ? "bg-[#7C3AED] text-white hover:bg-[#6d28d9]" : "text-black"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tags filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mb-4 pt-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 border-[2px] border-black text-xs uppercase tracking-widest transition-all hover:-translate-y-0.5 ${
                activeTag === tag
                  ? "bg-[#7C3AED] text-white shadow-[3px_3px_0_#000] font-black"
                  : "bg-white text-black shadow-[2px_2px_0_transparent] hover:shadow-[3px_3px_0_#000] font-bold"
              }`}
            >
              {tag !== "ALL" && <Tag className="w-3 h-3" />}
              {tag}
            </button>
          ))}
        </div>

        {/* Word grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAndFilteredVault.map((entry) => {
            const w = entry.word;
            return (
              <div
                key={entry.id}
                className="bg-white border-[2.5px] border-black shadow-[4px_4px_0_#000] p-5 flex flex-col gap-3 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#000] transition-all cursor-pointer"
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="text-black uppercase"
                      style={{ fontWeight: 900, fontSize: "1.3rem", lineHeight: 1.2 }}
                    >
                      {w.word}
                    </span>
                    <p
                      className="text-[#666] text-xs uppercase tracking-wider mt-1"
                      style={{ fontWeight: 600 }}
                    >
                      {w.translation}
                    </p>
                  </div>
                  <span
                    className="text-white text-[9px] uppercase tracking-wider px-2 py-1 border-[1.5px] border-black shrink-0 bg-[#7C3AED]"
                    style={{ fontWeight: 800 }}
                  >
                    {w.partOfSpeech?.slice(0, 4) || "WORD"}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-[2px] bg-black" />

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {(w.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-0.5 bg-[#FFFBF0] border-[1.5px] border-black text-[9px] uppercase tracking-wider"
                      style={{ fontWeight: 800 }}
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                  {(!w.tags || w.tags.length === 0) && (
                    <span className="text-[#aaa] text-[9px] uppercase tracking-wider font-bold">
                      NO TAGS
                    </span>
                  )}
                </div>

                {/* Footer with Mastery Pill */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t-[2px] border-black">
                  {(() => {
                    const status = getMasteryStatus(entry);
                    const StatusIcon = status.icon;
                    return (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 border-[1.5px] border-black shadow-[2px_2px_0_#000] ${status.bg}`}>
                        <StatusIcon className="w-3 h-3 text-white" />
                        <span className="text-[10px] text-white uppercase tracking-widest font-black">
                          {status.label}
                        </span>
                      </div>
                    );
                  })()}
                  <button className="flex items-center gap-1 text-[11px] text-black uppercase tracking-wider hover:text-[#7C3AED] transition-colors border-b-[2px] border-transparent hover:border-[#7C3AED] pb-0.5" style={{ fontWeight: 800 }}>
                    STUDY <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add new card */}
          {sortedAndFilteredVault.length === 0 && (
            <div className="border-[2.5px] border-dashed border-[#ccc] p-5 flex flex-col items-center justify-center gap-3 text-[#ccc] col-span-full min-h-[160px]">
              <span className="text-xs uppercase tracking-widest" style={{ fontWeight: 800 }}>
                NO WORDS FOUND
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
