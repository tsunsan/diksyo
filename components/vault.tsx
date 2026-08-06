"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookMarked, History, ChevronRight, ChevronDown, Plus, Search, Tag, CheckCircle2, Clock, PlayCircle, Sparkles, Loader2, ArrowDownUp, Edit, Trash2, X, ExternalLink, Star, Filter, ArrowUp, ArrowDown, Layers, Zap, Type, Gem, Minimize, Maximize, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { searchWordSuggestions, removeWordFromVault, searchWords } from "@/app/actions/dictionary";
import { addWordToVault, getVaultWords } from "@/app/actions/vault";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { POS_COLORS } from "@/lib/utils";
import { useDebounce } from "use-debounce";


type VaultEntry = {
  id: string;
  createdAt: Date | string;
  nextReview: Date | string | null;
  lastReview: Date | string | null;
  mastery: number | null;
  stability: number | null;
  word: {
    id: string;
    word: string;
    pronunciation: string | null;
    translation: string;
    partOfSpeech: string | null;
    tags: string[] | null;
    level: string | null;
    frequency: string | null;
    rootWordId?: string | null;
    rootWordString?: string | null;
  };
};

function getMasteryStatus(entry: VaultEntry) {
  const percent = entry.mastery ?? 0;
  const suffix = ` (${percent}%)`;
  
  if (!entry.lastReview) {
    return { label: "NEW" + suffix, bg: "bg-[#3B82F6]", icon: Sparkles };
  }

  if (percent >= 90) {
    return { label: "MASTERED" + suffix, bg: "bg-[#10B981]", icon: CheckCircle2 };
  }

  const now = new Date();
  const nextDate = entry.nextReview ? new Date(entry.nextReview) : null;
  if (nextDate && nextDate <= now) {
    return { label: "DUE" + suffix, bg: "bg-[#EF4444]", icon: Clock };
  }
  
  if (percent >= 50) {
    return { label: "REVIEWING" + suffix, bg: "bg-[#8B5CF6]", icon: RefreshCw };
  }

  return { label: "LEARNING" + suffix, bg: "bg-[#F59E0B]", icon: PlayCircle };
}

const LEVEL_ORDER: Record<string, number> = { "BEGINNER": 1, "INTERMEDIATE": 2, "ADVANCED": 3 };
const FREQUENCY_ORDER: Record<string, number> = { "EVERYDAY": 1, "COMMON": 2, "OCCASIONAL": 3, "SLANG": 4, "RARE": 5, "OBSOLETE": 6 };

type FilterDropdownProps = {
  label: string;
  icon: React.ReactNode;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  accentColor: string;
  dropdownAlign?: "left" | "right";
};

function FilterDropdown({ label, icon, options, value, onChange, accentColor, dropdownAlign = "left" }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = value !== "ALL";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-1.5 px-2.5 py-2 w-full border-[2.5px] border-black text-xs uppercase tracking-widest transition-all ${
          isActive
            ? `text-white shadow-[3px_3px_0_#000]`
            : "bg-white text-black shadow-[2px_2px_0_transparent] hover:shadow-[3px_3px_0_#000]"
        } hover:-translate-y-0.5`}
        style={isActive ? { background: accentColor, fontWeight: 900 } : { fontWeight: 700 }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {icon}
          <span className="hidden sm:inline shrink-0">{label}:</span>
          <span className="truncate" style={{ fontWeight: 900 }}>{value}</span>
        </div>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-2 ${dropdownAlign === 'right' ? 'right-0' : 'left-0'} min-w-[140px] sm:min-w-[160px] bg-white border-[2.5px] border-black shadow-[4px_4px_0_#000] z-[60] flex flex-col max-h-[280px] overflow-y-auto`} style={{ scrollbarWidth: "thin" }}>
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`text-left px-4 py-2.5 uppercase text-xs tracking-wider hover:bg-[#FFFBF0] transition-colors border-b-[2px] border-black last:border-b-0 ${
                value === option ? "text-white hover:opacity-90" : "text-black"
              }`}
              style={value === option ? { background: accentColor, fontWeight: 900 } : { fontWeight: 700 }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

export default function VaultClient({ initialData = [] }: { initialData?: VaultEntry[] }) {
  const [initialWords, setInitialWords] = useState<VaultEntry[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const masteredCount = initialWords.filter(w => w.mastery && w.mastery >= 90).length;

  const [activeRoot, setActiveRoot] = useState("ALL");
  const [activeLevel, setActiveLevel] = useState("ALL");
  const [activeFrequency, setActiveFrequency] = useState("ALL");
  const [activePOS, setActivePOS] = useState("ALL");
  const [vaultSearch, setVaultSearch] = useState("");
  const [sortBy, setSortBy] = useState("DATE");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Root word filter options
  const rootOptions = ["ALL", "ROOT WORDS", "DERIVED"];

  const uniqueLevels = useMemo(() => {
    const levels = new Set<string>();
    initialWords.forEach(e => {
      if (e.word.level) levels.add(e.word.level.toUpperCase());
    });
    return ["ALL", ...Array.from(levels).sort((a, b) => (LEVEL_ORDER[a] ?? 99) - (LEVEL_ORDER[b] ?? 99))];
  }, [initialWords]);

  const uniqueFrequencies = useMemo(() => {
    const freqs = new Set<string>();
    initialWords.forEach(e => {
      if (e.word.frequency) freqs.add(e.word.frequency.toUpperCase());
    });
    return ["ALL", ...Array.from(freqs).sort((a, b) => (FREQUENCY_ORDER[a] ?? 99) - (FREQUENCY_ORDER[b] ?? 99))];
  }, [initialWords]);

  const uniquePOS = useMemo(() => {
    const pos = new Set<string>();
    initialWords.forEach(e => {
      if (e.word.partOfSpeech) pos.add(e.word.partOfSpeech.toUpperCase());
    });
    return ["ALL", ...Array.from(pos).sort()];
  }, [initialWords]);

  const activeFilterCount = [activeRoot, activeLevel, activeFrequency, activePOS].filter(v => v !== "ALL").length;

  // Edit Mode & Deletion
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick View / Modal
  const [modalWord, setModalWord] = useState<any | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

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
  const [debouncedDialogQuery] = useDebounce(dialogQuery, 300);
  const [dialogResults, setDialogResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingWordId, setAddingWordId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!isDialogOpen) {
      setDialogQuery("");
      setDialogResults([]);
    }
  }, [isDialogOpen]);

  useEffect(() => {
    async function fetchSuggestions() {
      if (!debouncedDialogQuery.trim()) {
        setDialogResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const suggestions = await searchWordSuggestions(debouncedDialogQuery.toLowerCase(), 8);
        setDialogResults(suggestions);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }
    fetchSuggestions();
  }, [debouncedDialogQuery]);

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        await removeWordFromVault(id);
      }
      toast.success(`${ids.length} WORDS REMOVED`);
      setSelectedIds(new Set());
      setEditMode(false);
      // Optional: Refresh page to get updated words
      window.location.reload();
    } catch (e) {
      toast.error("An error occurred during deletion");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = async (entry: VaultEntry) => {
    if (editMode) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(entry.word.id)) next.delete(entry.word.id);
        else next.add(entry.word.id);
        return next;
      });
      return;
    }

    // Normal Click - Open Modal
    setIsModalLoading(true);
    try {
      const results = await searchWords(entry.word.word);
      const match = results.find(w => w.id === entry.word.id);
      if (match) {
        setModalWord(match);
      } else {
        toast.error("Could not fetch full details.");
      }
    } catch (e) {
       toast.error("Failed to open word details.");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleAddWord = async (wordId: string, word: string) => {
    setAddingWordId(wordId);
    try {
      const res = await addWordToVault(wordId);
      if (res.success) {
        toast.success(`${word.toUpperCase()} ADDED TO VAULT!`);
        const updatedVault = await getVaultWords();
        if (updatedVault.success && updatedVault.data) {
          setInitialWords(updatedVault.data as any);
        }
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
      const isRoot = !w.rootWordId && !w.rootWordString;
      const matchRoot = activeRoot === "ALL" || (activeRoot === "ROOT WORDS" ? isRoot : !isRoot);
      const matchLevel = activeLevel === "ALL" || (w.level && w.level.toUpperCase() === activeLevel);
      const matchFrequency = activeFrequency === "ALL" || (w.frequency && w.frequency.toUpperCase() === activeFrequency);
      const matchPOS = activePOS === "ALL" || (w.partOfSpeech && w.partOfSpeech.toUpperCase() === activePOS);
      const matchSearch =
        w.word.toLowerCase().includes(vaultSearch.toLowerCase()) ||
        w.translation.toLowerCase().includes(vaultSearch.toLowerCase());
      return matchRoot && matchLevel && matchFrequency && matchPOS && matchSearch;
    })
    .sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      if (sortBy === "ALPHA") {
        return dir * a.word.word.localeCompare(b.word.word);
      } else if (sortBy === "MASTERY") {
        return dir * ((b.mastery ?? 0) - (a.mastery ?? 0));
      } else {
        // DATE (Recently Added)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dir * (dateB - dateA);
      }
    });

  return (
    <div style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>

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
                <div className="min-w-0 break-words flex-1">
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
                          className="px-2.5 py-1 border-[2px] border-black text-[10px] uppercase tracking-widest bg-[#FF007F] text-white shadow-[2px_2px_0_#000]"
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
                        className="text-[#888] mt-1 text-sm tracking-widest"
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
                        <History className="w-4 h-4 text-[#FF6D00]" />
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="text-[#888] text-xs uppercase tracking-widest mt-1 flex items-center gap-2 h-4" style={{ fontWeight: 800 }}>
              {isLoading ? (
                  <>
                    <Skeleton className="h-3 w-20" /> <span className="opacity-50">•</span> <Skeleton className="h-3 w-24" />
                  </>
              ) : (
                  <>
                    {initialWords.length} WORDS SAVED <span className="opacity-50">•</span> <span className="text-[#10B981]">{masteredCount} MASTERED</span>
                  </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {editMode && selectedIds.size > 0 && (
              <button
                onClick={handleBatchDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-3 bg-[#EF4444] text-white border-[2.5px] border-black shadow-[4px_4px_0_#000] uppercase tracking-widest text-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all hover:bg-[#DC2626]" style={{ fontWeight: 900 }}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                DELETE ({selectedIds.size})
              </button>
            )}
            <button
              onClick={() => {
                setEditMode(!editMode);
                if (editMode) setSelectedIds(new Set());
              }}
              className={`flex items-center gap-2 px-5 py-3 text-black border-[2.5px] border-black uppercase tracking-widest text-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all font-black
                ${editMode ? "bg-yellow-400 shadow-none translate-x-[4px] translate-y-[4px]" : "bg-white shadow-[4px_4px_0_#000] hover:bg-[#FFFBF0]"}`}
            >
              <Edit className="w-4 h-4" />
              {editMode ? "CANCEL" : "MANAGE"}
            </button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger className="flex items-center gap-2 px-5 py-3 bg-[#7C3AED] text-white border-[2.5px] border-black shadow-[4px_4px_0_#000] uppercase tracking-widest text-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all hover:bg-[#6d28d9]" style={{ fontWeight: 900 }}>
                <Plus className="w-4 h-4" />
                ADD WORD
              </DialogTrigger>
            <DialogContent className="border-[3px] border-black rounded-none shadow-[4px_4px_0_#000] sm:shadow-[8px_8px_0_#000] p-4 sm:p-6 max-w-md w-[92vw] sm:w-full mx-auto">
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

                <div className="flex flex-col gap-2 max-h-[50vh] sm:max-h-[300px] overflow-y-auto overscroll-contain" style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}>
                  {dialogResults.length === 0 && debouncedDialogQuery && !isSearching && dialogQuery === debouncedDialogQuery && (
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
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-4 h-auto sm:h-12">
          <div className="relative flex-1 h-14 sm:h-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" />
            <input
              type="text"
              value={vaultSearch}
              onChange={(e) => setVaultSearch(e.target.value)}
              placeholder="SEARCH YOUR VAULT..."
              className="w-full h-full pl-11 pr-4 py-3 sm:py-0 bg-white border-[2.5px] border-black outline-none focus:shadow-[4px_4px_0_#000] transition-shadow uppercase text-sm font-bold"
            />
          </div>
          <div className="flex shrink-0 h-14 sm:h-full w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:w-[220px] h-full" ref={sortRef}>
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
            <button
              onClick={() => setSortDirection(d => d === "asc" ? "desc" : "asc")}
              className="flex items-center justify-center w-12 h-full border-[2.5px] border-l-0 border-black bg-white hover:bg-[#FFFBF0] transition-all active:bg-[#7C3AED] active:text-white"
              title={sortDirection === "asc" ? "Ascending — click to reverse" : "Descending — click to reverse"}
            >
              {sortDirection === "asc" ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col gap-3">
          {/* Header Row: Filters Label and Maximize Button */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="w-4 h-4 text-[#888]" />
              <span className="text-[10px] uppercase tracking-widest text-[#888]" style={{ fontWeight: 800 }}>FILTERS</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-[#7C3AED] text-white text-[10px] border-[1.5px] border-black" style={{ fontWeight: 900 }}>
                  {activeFilterCount}
                </span>
              )}
            </div>

            <button
              onClick={() => setIsCompactMode(!isCompactMode)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 border-[2px] border-black bg-white text-black text-[10px] uppercase tracking-widest transition-all hover:-translate-y-0.5 shadow-[2px_2px_0_transparent] hover:shadow-[3px_3px_0_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none shrink-0"
              style={{ fontWeight: 900 }}
            >
              {isCompactMode ? <Maximize className="w-3.5 h-3.5" /> : <Minimize className="w-3.5 h-3.5" />}
              <span>{isCompactMode ? "MAXIMIZE" : "MINIMIZE"}</span>
            </button>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:items-center gap-2 w-full">
            <FilterDropdown
              label="ROOT"
              icon={<Gem className="w-3.5 h-3.5" />}
              options={rootOptions}
              value={activeRoot}
              onChange={setActiveRoot}
              accentColor="#FF007F"
              dropdownAlign="left"
            />

            <FilterDropdown
              label="POS"
              icon={<Type className="w-3.5 h-3.5" />}
              options={uniquePOS}
              value={activePOS}
              onChange={setActivePOS}
              accentColor="#FF1744"
              dropdownAlign="right"
            />

            <FilterDropdown
              label="LEVEL"
              icon={<Layers className="w-3.5 h-3.5" />}
              options={uniqueLevels}
              value={activeLevel}
              onChange={setActiveLevel}
              accentColor="#0057FF"
              dropdownAlign="left"
            />

            <FilterDropdown
              label="FREQ"
              icon={<Zap className="w-3.5 h-3.5" />}
              options={uniqueFrequencies}
              value={activeFrequency}
              onChange={setActiveFrequency}
              accentColor="#FF6D00"
              dropdownAlign="right"
            />

            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setActiveRoot("ALL");
                  setActiveLevel("ALL");
                  setActiveFrequency("ALL");
                  setActivePOS("ALL");
                }}
                className="flex items-center justify-center col-span-2 lg:col-span-1 gap-1.5 px-3 py-2 border-[2.5px] border-black bg-[#EF4444] text-white text-xs uppercase tracking-widest transition-all hover:-translate-y-0.5 shadow-[3px_3px_0_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                style={{ fontWeight: 900 }}
              >
                <X className="w-3.5 h-3.5" />
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* Word grid */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border-[2.5px] border-black shadow-[4px_4px_0_#000] p-5 gap-3 flex flex-col min-h-[160px]"
              >
                <div className="flex items-start justify-between gap-2">
                   <div className="flex flex-col gap-2 w-full">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-3 w-48" />
                   </div>
                   <Skeleton className="h-5 w-12 border-[1.5px] border-black shrink-0" />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto mb-2">
                   <Skeleton className="h-4 w-16 border-[1.5px] border-black" />
                   <Skeleton className="h-4 w-20 border-[1.5px] border-black" />
                </div>
                <div className="flex items-end justify-between pt-4 border-t-[2px] border-black">
                   <Skeleton className="h-6 w-24 border-[1.5px] border-black" />
                   <Skeleton className="h-3 w-20" />
                </div>
              </motion.div>
            ))
          ) : sortedAndFilteredVault.map((entry) => {
            const w = entry.word;
            const isSelected = selectedIds.has(w.id);
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                key={entry.id}
                onClick={() => handleCardClick(entry)}
                className={`group relative bg-white border-[2.5px] border-black shadow-[4px_4px_0_#000] ${isCompactMode ? "p-3 gap-1.5" : "p-5 gap-3"} flex flex-col transition-all cursor-pointer 
                  ${editMode ? "hover:-translate-y-0.5" : "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000]"}
                  ${isSelected && editMode ? "border-[#EF4444] bg-[#FEF2F2] ring-4 ring-[#EF4444] ring-opacity-20" : ""}
                `}
              >
                {editMode && (
                  <div className={`absolute top-4 right-4 w-6 h-6 border-2 border-black flex items-center justify-center transition-colors ${isSelected ? 'bg-[#EF4444]' : 'bg-white'}`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                )}
                {/* Top */}
                <div className={`flex items-start justify-between gap-2 ${editMode ? 'pr-8' : ''}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-black uppercase"
                        style={{ fontWeight: 900, fontSize: isCompactMode ? "1.1rem" : "1.3rem", lineHeight: 1.2 }}
                      >
                        {w.word}
                      </span>
                      {(!w.rootWordId && !w.rootWordString) && (
                         <span
        className="inline-flex items-center justify-center h-[16px] w-[16px] border-[1.5px] border-black bg-[#FF007F] text-[8px]"
        title="Root Word"
      >
        ⭐
      </span>
                      )}
                    </div>
                    {w.pronunciation && !isCompactMode && (
                      <p
                        className="text-[#888] text-xs mt-0.5 mb-1"
                        style={{ fontWeight: 600 }}
                      >
                        {w.pronunciation.startsWith("/") ? w.pronunciation : `/${w.pronunciation}/`}
                      </p>
                    )}
                    <p
                      className={`text-[#333] text-xs uppercase tracking-wider ${isCompactMode ? "mt-0.5" : "mt-1"}`}
                      style={{ fontWeight: 600 }}
                    >
                      {w.translation}
                    </p>
                  </div>
                  <span
                    className="text-white text-[9px] uppercase tracking-wider px-2 py-1 border-[1.5px] border-black shrink-0"
                    style={{ background: (POS_COLORS[w.partOfSpeech?.toUpperCase() || ""] || { bg: "#7C3AED" }).bg, fontWeight: 800 }}
                  >
                    {w.partOfSpeech?.slice(0, 4) || "WORD"}
                  </span>
                </div>

                {/* Tags */}
                {!isCompactMode && (
                  <div className="flex flex-wrap gap-1.5 mt-auto mb-2">
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
                )}

                {/* Footer with Mastery Pill */}
                <div className={`flex items-end justify-between mt-auto ${isCompactMode ? "pt-2" : "pt-4"} border-t-[2px] border-black`}>
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
                  
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[#aaa] text-[9px] uppercase tracking-wider font-bold">
                      {entry.lastReview ? `LEARNED ${new Date(entry.lastReview).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : `SAVED ${entry.createdAt ? new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "RECENTLY"}`}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-[#888] uppercase tracking-wider font-bold shrink-0">
                      {editMode ? "CLICK TO SELECT" : (
                        <span className="flex items-center gap-1 group-hover:text-black transition-colors">
                          VIEW DETAILS <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Add new card */}
          {!isLoading && sortedAndFilteredVault.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-[2.5px] border-dashed border-[#ccc] p-5 flex flex-col items-center justify-center gap-3 text-[#ccc] col-span-full min-h-[160px]"
            >
              <span className="text-xs uppercase tracking-widest" style={{ fontWeight: 800 }}>
                NO WORDS FOUND
              </span>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
