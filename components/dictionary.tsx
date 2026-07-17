"use client"

import { useState, useEffect, useActionState, useCallback, useRef, useMemo, useOptimistic, startTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
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
  Flame,
  History,
  Check,
  BookmarkMinus,
  Volume2,
  ExternalLink,
  X,
  SlidersHorizontal,
  AlertCircle,
  Lock,
  Mail,
  User,
  MousePointerClick,
  Sparkles,
  Send,
  Copy,
} from "lucide-react";
import { searchWords, saveWordToVault, removeWordFromVault, getLevenshteinSuggestions, getWordOfTheDay, getRandomDiscoverWords, getUserSavedWordIds } from "@/app/actions/dictionary";
import { login, signup, type AuthState } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { POS_COLORS, LEVEL_COLORS } from "@/lib/utils";
import { useDebounce } from "use-debounce";
import { Skeleton } from "@/components/ui/skeleton";

/* ─── Filter Constants ─── */
const FILTER_POS_OPTIONS: { key: string; label: string; labelEn: string }[] = [
  { key: "PANGNGALAN", label: "PANGNGALAN", labelEn: "NOUN" },
  { key: "PANDIWA", label: "PANDIWA", labelEn: "VERB" },
  { key: "PANG-URI", label: "PANG-URI", labelEn: "ADJ" },
  { key: "PANG-ABAY", label: "PANG-ABAY", labelEn: "ADV" },
  { key: "PANGHALIP", label: "PANGHALIP", labelEn: "PRON" },
  { key: "PANDAMDAM", label: "PANDAMDAM", labelEn: "INTJ" },
  { key: "PANGATNIG", label: "PANGATNIG", labelEn: "CONJ" },
  { key: "PANG-UKOL", label: "PANG-UKOL", labelEn: "PREP" },
  { key: "PANTUKOY", label: "PANTUKOY", labelEn: "ART" },
  { key: "PANLAPI", label: "PANLAPI", labelEn: "AFFIX" },
  { key: "DAGLAT", label: "DAGLAT", labelEn: "ABBR" },
  { key: "PARIRALA / IDYOMA", label: "PARIRALA", labelEn: "PHRASE" },
];

const FILTER_LEVEL_OPTIONS = [
  { key: "BEGINNER", label: "BEGINNER", emoji: "🟢" },
  { key: "INTERMEDIATE", label: "INTERMEDIATE", emoji: "🟡" },
  { key: "ADVANCED", label: "ADVANCED", emoji: "🟠" },
];

/* ─── Tour Step Definitions ─── */
const TOUR_STEPS = [
  {
    target: "data-tour-search",
    title: "SEARCH FOR WORDS",
    desc: "Type any Tagalog or English word to find it in the dictionary.",
    position: "bottom" as const,
  },
  {
    target: "data-tour-wordcard",
    title: "EXPLORE WORD DETAILS",
    desc: "Click on any word from the list to see its full definition, examples, and etymology.",
    position: "right" as const,
  },
  {
    target: "data-tour-save",
    title: "SAVE TO YOUR VAULT",
    desc: "Hit this button to add the word to your vault. Saved words power the Mastery quiz modes.",
    position: "bottom" as const,
  },
];

/* ─── Spotlight Tour Overlay ─── */
function SpotlightTour({ step, totalSteps, onNext, onSkip }: {
  step: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tourStep = TOUR_STEPS[step];

  const updateRect = useCallback(() => {
    const el = document.querySelector(`[${tourStep.target}]`);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, [tourStep.target]);

  useEffect(() => {
    // Small delay to let DOM settle
    const timer = setTimeout(updateRect, 300);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [updateRect]);

  if (!rect) return null;

  const pad = 8;
  const isLast = step === totalSteps - 1;

  // Calculate tooltip position
  let tooltipStyle: React.CSSProperties = {};
  if (tourStep.position === "bottom") {
    tooltipStyle = {
      top: rect.bottom + pad + 12,
      left: Math.min(Math.max(16, rect.left + rect.width / 2 - 160), window.innerWidth - 336),
    };
  } else if (tourStep.position === "right") {
    tooltipStyle = {
      top: rect.top + rect.height / 2 - 60,
      left: Math.min(rect.right + pad + 12, window.innerWidth - 340),
    };
  }

  return (
    <div className="fixed inset-0 z-[200]" onClick={onSkip}>
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={rect.left - pad}
              y={rect.top - pad}
              width={rect.width + pad * 2}
              height={rect.height + pad * 2}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0" y="0" width="100%" height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight border */}
      <div
        className="absolute border-[3px] border-[#FFE500] pointer-events-none transition-all duration-300"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: "0 0 0 4px rgba(255,229,0,0.3), 0 0 20px rgba(255,229,0,0.2)",
        }}
      />

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={step}
        className="absolute w-[320px] bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-0 overflow-hidden"
        style={{ ...tooltipStyle, pointerEvents: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tooltip header */}
        <div className="bg-[#FFE500] border-b-[2px] border-black px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black" />
            <span className="text-[10px] uppercase tracking-widest text-black" style={{ fontWeight: 900 }}>
              Step {step + 1} of {totalSteps}
            </span>
          </div>
          <button onClick={onSkip} className="text-[10px] uppercase tracking-wider text-black/50 hover:text-black transition-colors" style={{ fontWeight: 800 }}>
            Skip
          </button>
        </div>

        {/* Tooltip body */}
        <div className="px-4 py-3">
          <h4 className="text-black uppercase text-sm mb-1" style={{ fontWeight: 900 }}>{tourStep.title}</h4>
          <p className="text-[#555] text-xs leading-relaxed" style={{ fontWeight: 600 }}>{tourStep.desc}</p>
        </div>

        {/* Tooltip footer */}
        <div className="px-4 pb-3">
          <button
            onClick={onNext}
            className="w-full py-2.5 bg-black text-white border-[2px] border-black text-xs uppercase tracking-widest shadow-[3px_3px_0_#FFE500] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
            style={{ fontWeight: 900 }}
          >
            {isLast ? "GOT IT!" : "NEXT →"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const authInitialState: AuthState = {
  error: undefined,
  errorTitle: undefined,
  success: undefined,
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

/* ─── Shared inline input component ─── */
function AuthInput({ id, name, type, placeholder, label, icon: Icon, required = true }: {
  id: string; name: string; type: string; placeholder?: string; label: string;
  icon: React.ElementType; required?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-black">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-4 py-2.5 bg-white border-[2px] border-black text-sm outline-none focus:bg-yellow-50 focus:shadow-[3px_3px_0_#000] transition-all placeholder:text-zinc-400 placeholder:uppercase placeholder:text-xs"
          style={{ fontWeight: 600 }}
        />
      </div>
    </div>
  );
}

export default function DictionaryClient({ 
  initialWords, 
  initialSavedWordIds,
  initialDiscoverWords,
  initialWordOfTheDay,
  isAuthenticated = false,
  showOnboarding = false,
  initialSearch = "",
  initialSaveWordId = ""
}: { 
  initialWords?: any[], 
  initialSavedWordIds?: string[],
  initialDiscoverWords?: any[],
  initialWordOfTheDay?: any,
  isAuthenticated?: boolean,
  showOnboarding?: boolean,
  initialSearch?: string,
  initialSaveWordId?: string
}) {
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [pendingSaveWordId, setPendingSaveWordId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [words, setWords] = useState<any[]>(initialWords || []);
  const [isInitialLoad, setIsInitialLoad] = useState(!initialWords);

  useEffect(() => {
    async function loadDictionary() {
      if (initialWords) return;
      try {
        const [w, s, d, dw] = await Promise.all([
          searchWords(""),
          isAuthenticated ? getUserSavedWordIds() : Promise.resolve([]),
          getRandomDiscoverWords(),
          getWordOfTheDay()
        ]);
        setWords(w as any);
        setSavedIds(new Set(s));
        setDiscoverWords(d as any);
        setWordOfTheDay(dw);
      } catch (err) {
        console.error("Failed to fetch dictionary", err);
      } finally {
        setIsInitialLoad(false);
      }
    }
    loadDictionary();
  }, [initialWords, isAuthenticated]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedWordIds));
  const [optimisticSavedIds, addOptimisticSavedId] = useOptimistic(
    savedIds,
    (state, { id, action }: { id: string, action: "add" | "remove" }) => {
      const next = new Set(state);
      if (action === "add") next.add(id);
      else next.delete(id);
      return next;
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [fuzzySuggestions, setFuzzySuggestions] = useState<any[]>([]);
  const [isFuzzyLoading, setIsFuzzyLoading] = useState(false);
  
  const defaultSelectedId = (initialDiscoverWords && initialDiscoverWords.length > 0) 
    ? initialDiscoverWords[0].id 
    : (initialWords && initialWords.length > 0 ? initialWords[0].id : null);
    
  const [selectedId, setSelectedId] = useState<string | null>(initialSaveWordId || defaultSelectedId);
  
  const [search, setSearch] = useState(initialSearch || "");
  const [debouncedSearch] = useDebounce(search, 100);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [modalWord, setModalWord] = useState<any | null>(null);
  const [shareWord, setShareWord] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  /* ─── Filter State ─── */
  const [showFilters, setShowFilters] = useState(false);
  const [filterPos, setFilterPos] = useState<Set<string>>(new Set());
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [filterRootOnly, setFilterRootOnly] = useState(false);
  const [discoverWords, setDiscoverWords] = useState<any[]>(initialDiscoverWords || []);
  const [wordOfTheDay, setWordOfTheDay] = useState<any | null>(initialWordOfTheDay || null);
  const [tourStep, setTourStep] = useState(showOnboarding ? 0 : -1);
  const tourRouter = useRouter();

  // Auth form states
  const [loginState, loginAction, loginPending] = useActionState(login, authInitialState);
  const [signupState, signupAction, signupPending] = useActionState(signup, authInitialState);

  useEffect(() => {
    if (signupState?.success) {
      toast.success("ACCOUNT CREATED", {
        description: signupState.success,
        duration: 3000,
      });
      setShowAuthOverlay(false);
      setTourStep(0);
      
      if (signupState.nextUrl && signupState.nextUrl !== '/dictionary') {
          window.location.href = signupState.nextUrl;
      }
    }
  }, [signupState?.success, signupState?.nextUrl]);

  const pendingWord = useMemo(() => {
    if (!pendingSaveWordId) return null;
    return words.find(w => w.id === pendingSaveWordId) || discoverWords.find(w => w.id === pendingSaveWordId) || (wordOfTheDay?.id === pendingSaveWordId ? wordOfTheDay : null);
  }, [pendingSaveWordId, words, discoverWords, wordOfTheDay]);

  useEffect(() => {
    if (initialSaveWordId && isAuthenticated) {
      setTimeout(() => {
        handleSaveToVault(initialSaveWordId, true);
        const url = new URL(window.location.href);
        url.searchParams.delete('saveWordId');
        window.history.replaceState({}, '', url.toString());
      }, 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSaveWordId, isAuthenticated]);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const nextUrl = pendingWord 
      ? `/dictionary?search=${encodeURIComponent(pendingWord.word)}&saveWordId=${pendingSaveWordId}`
      : `/dictionary`;
      
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
      },
    });
  };



  useEffect(() => {
    if (!initialDiscoverWords || initialDiscoverWords.length === 0) {
      if (initialWords && initialWords.length > 0) {
        const shuffled = [...initialWords].sort(() => 0.5 - Math.random());
        setDiscoverWords(shuffled.slice(0, 3));
      }
    }

    if (!initialWordOfTheDay && initialWords && initialWords.length > 0) {
      const sortedWords = [...initialWords].sort((a, b) => a.word.localeCompare(b.word));
      setWordOfTheDay(sortedWords[0]);
    }
  }, [initialWords, initialDiscoverWords, initialWordOfTheDay]);

  useEffect(() => {
    // Skip initial fetch on mount if search is empty
    if (!debouncedSearch && words === (initialWords || [])) return;

    const fetchWords = async () => {
      setIsLoading(true);
      try {
        const results = await searchWords(debouncedSearch);
        setWords(results);
        
        if (debouncedSearch === "" && discoverWords.length > 0) {
            const hasSelected = selectedId && discoverWords.find(w => w.id === selectedId);
            if (!hasSelected) {
                setSelectedId(discoverWords[0].id);
            }
        } else if (results.length > 0) {
            const exactMatch = results.find(w => w.word.toLowerCase() === debouncedSearch.toLowerCase());
            const hasSelected = selectedId && results.find(w => w.id === selectedId);
            
            if (exactMatch && exactMatch.id !== selectedId) {
                setSelectedId(exactMatch.id);
            } else if (!hasSelected) {
                setSelectedId(results[0].id);
            }
        } else if (results.length === 0) {
            setSelectedId(null);
            if (debouncedSearch && debouncedSearch.length >= 3) {
                setIsFuzzyLoading(true);
                try {
                    const fuzzy = await getLevenshteinSuggestions(debouncedSearch);
                    setFuzzySuggestions(fuzzy);
                } catch (err) {
                    console.error("Fuzzy search error:", err);
                } finally {
                    setIsFuzzyLoading(false);
                }
            } else {
                setFuzzySuggestions([]);
            }
        }
      } catch (error) {
        console.error("Failed to fetch words:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWords();
  }, [debouncedSearch]);

  const word = words.find((w) => w.id === selectedId) || 
               discoverWords.find((w) => w.id === selectedId) || 
               (wordOfTheDay && wordOfTheDay.id === selectedId ? wordOfTheDay : null) || 
               null;
  const isSaved = word ? optimisticSavedIds.has(word.id) : false;
  const posStyle = word && word.partOfSpeech ? (POS_COLORS[word.partOfSpeech.toUpperCase()] || { bg: "#333", text: "#fff" }) : { bg: "#333", text: "#fff" };

  /* ─── Filtered Words (client-side) ─── */
  const filteredWords = useMemo(() => {
    let source = !debouncedSearch ? discoverWords : words;
    if (filterPos.size > 0) {
      source = source.filter((w: any) => {
        const pos = (w.partOfSpeech || "").toUpperCase();
        // Match exact or compound POS containing the filter key
        return Array.from(filterPos).some(fp => pos === fp || pos.startsWith(fp + " /") || pos.includes("/ " + fp));
      });
    }
    if (filterLevel) {
      source = source.filter((w: any) => w.level === filterLevel);
    }
    if (filterRootOnly) {
      source = source.filter((w: any) => !w.rootWordId && !w.rootWordString);
    }
    return source;
  }, [words, discoverWords, debouncedSearch, filterPos, filterLevel, filterRootOnly]);

  const activeFilterCount = (filterPos.size > 0 ? 1 : 0) + (filterLevel ? 1 : 0) + (filterRootOnly ? 1 : 0);

  const clearAllFilters = () => {
    setFilterPos(new Set());
    setFilterLevel(null);
    setFilterRootOnly(false);
  };

  const togglePosFilter = (key: string) => {
    setFilterPos(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSaveToVault = async (id: string, forceSave = false) => {
    if (!isAuthenticated) {
      setPendingSaveWordId(id);
      setShowAuthOverlay(true);
      return;
    }
    
    const targetWord = words.find(w => w.id === id) || discoverWords.find(w => w.id === id) || (wordOfTheDay?.id === id ? wordOfTheDay : null);
    const willSave = forceSave ? true : !savedIds.has(id);
    
    // 1. Optimistic Update instantly
    startTransition(() => {
        addOptimisticSavedId({ id, action: willSave ? "add" : "remove" });
    });
    
    try {
        setSavingId(id);
        // 2. Perform background mutation
        const result = willSave ? await saveWordToVault(id) : await removeWordFromVault(id);

        if (result?.success) {
            if ('alreadySaved' in result && result.alreadySaved) {
                toast("ALREADY SAVED", {
                    description: `"${targetWord?.word || word?.word}" is already in your vault.`,
                    duration: 3000,
                    style: { background: "#FFE500", color: "#000", border: "2px solid #000" }
                });
                return;
            }

            setSavedIds(prev => {
                const next = new Set(prev);
                if (willSave) next.add(id);
                else next.delete(id);
                return next;
            });
            
            if (willSave) {
              toast.success("ADDED TO VAULT", {
                description: `"${targetWord?.word || word?.word}" has been saved for review.`,
                duration: 3000,
              });
            } else {
              toast.success("REMOVED", {
                description: `"${targetWord?.word || word?.word}" was removed from your vault.`,
                duration: 3000,
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

  // Current auth error state
  const currentAuthState = authMode === "login" ? loginState : signupState;
  const currentPending = authMode === "login" ? loginPending : signupPending;

  return (
    <div style={{ fontFamily: "'Geist', 'Inter', sans-serif" }} className="relative">
      
      <AnimatePresence>
      {showAuthOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowAuthOverlay(false)}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="w-full max-w-[420px] relative bg-white border-[4px] border-black shadow-[10px_10px_0_#000] max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#FDE047] border-b-[3px] border-black px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-[#FDE047]" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-tight text-black leading-none">
                    {authMode === "signup" ? "JOIN DIKSYO" : "WELCOME BACK"}
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/60 mt-0.5">
                    {authMode === "signup" ? "Create your account" : "Log in to continue"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthOverlay(false)}
                className="w-8 h-8 flex items-center justify-center bg-black hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b-[3px] border-black">
              <button
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-all relative ${
                  authMode === "signup"
                    ? "bg-white text-black"
                    : "bg-zinc-100 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                Sign Up
                {authMode === "signup" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#7C3AED]" />
                )}
              </button>
              <div className="w-[3px] bg-black" />
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-all relative ${
                  authMode === "login"
                    ? "bg-white text-black"
                    : "bg-zinc-100 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                Log In
                {authMode === "login" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#7C3AED]" />
                )}
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6">
              {/* Error Alert */}
              {currentAuthState?.error && (
                <div className="flex items-start gap-3 bg-red-400 border-[2px] border-black p-3 mb-5 shadow-[3px_3px_0_#000]">
                  <AlertCircle className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight text-black">
                      {currentAuthState.errorTitle || "ERROR"}
                    </p>
                    <p className="text-[10px] font-bold uppercase text-white/90 mt-0.5">
                      {currentAuthState.error}
                    </p>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {authMode === "signup" ? (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    action={signupAction}
                    className="flex flex-col gap-4"
                  >
                    {pendingSaveWordId && <input type="hidden" name="saveWordId" value={pendingSaveWordId} />}
                    <input type="hidden" name="next" value={pendingWord ? `/dictionary?search=${encodeURIComponent(pendingWord.word)}&saveWordId=${pendingSaveWordId}` : '/dictionary'} />
                    <AuthInput id="modal-full-name" name="full-name" type="text" label="Full Name" placeholder="Juan Dela Cruz" icon={User} />
                    <AuthInput id="modal-username" name="username" type="text" label="Username" placeholder="juandelacruz" icon={User} />
                    <AuthInput id="modal-signup-email" name="email" type="email" label="Email Address" placeholder="alamat@diksyo.app" icon={Mail} />
                    <div className="grid grid-cols-2 gap-3">
                      <AuthInput id="modal-password" name="password" type="password" label="Password" icon={Lock} />
                      <AuthInput id="modal-confirm-password" name="confirm-password" type="password" label="Confirm" icon={Lock} />
                    </div>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase italic -mt-2">
                      Min. 8 characters
                    </p>

                    <button
                      type="submit"
                      disabled={signupPending}
                      className="w-full py-3 bg-[#7C3AED] border-[2px] border-black text-white text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {signupPending ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    action={loginAction}
                    className="flex flex-col gap-4"
                  >
                    {pendingSaveWordId && <input type="hidden" name="saveWordId" value={pendingSaveWordId} />}
                    <input type="hidden" name="next" value={pendingWord ? `/dictionary?search=${encodeURIComponent(pendingWord.word)}&saveWordId=${pendingSaveWordId}` : '/dictionary'} />
                    <AuthInput id="modal-login-username" name="username" type="text" label="Username" placeholder="juandelacruz" icon={User} />
                    <AuthInput id="modal-login-password" name="password" type="password" label="Password" icon={Lock} />

                    <button
                      type="submit"
                      disabled={loginPending}
                      className="w-full py-3 bg-[#7C3AED] border-[2px] border-black text-white text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loginPending ? "LOGGING IN..." : "LOG IN"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div className="relative text-center my-5 after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t-[2px] after:border-black/20">
                <span className="relative z-10 bg-white px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  or
                </span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 bg-white border-[2px] border-black text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Modal Footer */}
            <div className="border-t-[2px] border-black/10 px-6 py-3 text-center">
              <p className="text-[10px] font-bold uppercase text-zinc-400">
                {authMode === "signup" ? (
                  <>Already have an account?{" "}
                    <button onClick={() => setAuthMode("login")} className="text-black underline decoration-[#7C3AED] decoration-2 underline-offset-4 hover:bg-[#7C3AED] hover:text-white transition-all px-1">
                      Log in
                    </button>
                  </>
                ) : (
                  <>Don&apos;t have an account?{" "}
                    <button onClick={() => setAuthMode("signup")} className="text-black underline decoration-[#7C3AED] decoration-2 underline-offset-4 hover:bg-[#7C3AED] hover:text-white transition-all px-1">
                      Sign up
                    </button>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Main search and header */}
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
                    style={{ fontWeight: 900, fontSize: "clamp(2rem, 8vw, 3rem)", lineHeight: 1, letterSpacing: "-0.02em", wordBreak: "break-word" }}
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

                {/* Related words */}
                {modalWord.related && modalWord.related.length > 0 && (
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#888] mb-2 block" style={{ fontWeight: 800 }}>RELATED WORDS</span>
                      <div className="flex flex-wrap gap-2">
                        {modalWord.related.map((r: string) => (
                          <button key={r} onClick={() => { if (search !== r) { setSearch(r); setIsLoading(true); } setModalWord(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="px-3 py-1.5 bg-white border-[2px] border-black text-xs uppercase tracking-wider hover:bg-black hover:text-[#FDE047] transition-colors shadow-[2px_2px_0_#000]" style={{ fontWeight: 800 }}>
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

      <AnimatePresence>
        {shareWord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShareWord(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="w-full max-w-[540px] bg-white border-[4px] border-black shadow-[10px_10px_0_#000] rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#FDE047] border-b-[4px] border-black px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0057FF] border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0_#000] rounded-full">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-black uppercase tracking-tight text-black leading-none">
                      SHARE WORD
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/70 mt-1">
                      Spread the knowledge
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShareWord(null)}
                  className="w-10 h-10 flex items-center justify-center bg-[#FF007F] border-[3px] border-black hover:bg-black transition-colors shadow-[3px_3px_0_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none rounded-full"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-6 bg-[#FFFBF0]">
                {/* Opengraph Image Preview */}
                <div className="flex flex-col gap-3">
                  <p className="text-center text-[11px] font-black uppercase tracking-widest text-black bg-white border-[2px] border-black shadow-[2px_2px_0_#000] py-1.5 px-4 self-center rounded-full">
                    LINK PREVIEW
                  </p>
                  <div className="w-full aspect-[1200/630] bg-[radial-gradient(circle_at_center,_#000_2px,_transparent_2px)] bg-[size:16px_16px] bg-[#FFE500]/20 border-[4px] border-black flex items-center justify-center relative shadow-[6px_6px_0_#000] rounded-3xl p-4 sm:p-6">
                    <div className="w-full h-full rounded-2xl overflow-hidden border-[3px] border-black shadow-[4px_4px_0_#000] relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={`${typeof window !== 'undefined' ? window.location.origin : ''}/salita/${shareWord.slug}/opengraph-image`} 
                        alt="Opengraph Preview" 
                        className="absolute inset-0 w-full h-full object-cover scale-[1.06]" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="w-full flex gap-3">
                  <div className="flex-1 bg-white border-[3px] border-black px-4 py-3 text-sm font-bold text-black truncate flex items-center shadow-[4px_4px_0_#000] rounded-xl">
                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/salita/${shareWord.slug}`}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/salita/${shareWord.slug}`);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                      toast.success("LINK COPIED", { description: "Link has been copied to your clipboard.", duration: 3000 });
                    }}
                    className={`shrink-0 px-5 py-3 border-[3px] border-black text-white font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex items-center justify-center gap-2 rounded-xl w-[140px] ${
                      isCopied ? "bg-[#00C853]" : "bg-[#7C3AED]"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-5 h-5" />
                        COPIED!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        COPY
                      </>
                    )}
                  </button>
                </div>
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
          {/* Search + Filter Deck (unified container) */}
          <div
            className={`border-[2.5px] border-black bg-white transition-shadow ${
              showFilters ? "shadow-[4px_4px_0_#000]" : ""
            }`}
            data-tour-search
          >
            {/* Search Input Row */}
            <div className="relative">
              {isLoading ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888] animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" />
              )}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH WORDS..."
                className="w-full pl-11 pr-14 py-3 bg-transparent outline-none uppercase text-sm"
                style={{ fontWeight: 700 }}
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 border-[2px] border-black flex items-center justify-center transition-all ${
                  showFilters || activeFilterCount > 0
                    ? "bg-black text-[#FDE047]"
                    : "bg-white text-black hover:bg-[#FDE047] shadow-[2px_2px_0_#000]"
                }`}
                title="Toggle filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFilterCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 bg-[#FF007F] border-[1.5px] border-black text-white flex items-center justify-center text-[9px]"
                    style={{ fontWeight: 900 }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* ─── Filter Deck (expands within the same container) ─── */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="overflow-hidden"
                >
                  {/* Separator between search and filters */}
                  <div className="h-[2.5px] bg-black" />

                  {/* Panel Header */}
                  <div className="bg-[#FDE047] border-b-[2px] border-black px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-black" />
                      <span className="text-[10px] uppercase tracking-widest text-black" style={{ fontWeight: 900 }}>
                        FILTER DECK
                      </span>
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-black/60 hover:text-black transition-colors"
                        style={{ fontWeight: 800 }}
                      >
                        <X className="w-3 h-3" />
                        CLEAR ALL
                      </button>
                    )}
                  </div>

                  <div className="p-3 flex flex-col gap-3">
                    {/* ── Part of Speech Pills ── */}
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#888] mb-1.5 block" style={{ fontWeight: 800 }}>
                        BAHAGI NG PANANALITA
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {FILTER_POS_OPTIONS.map((pos) => {
                          const isActive = filterPos.has(pos.key);
                          const color = POS_COLORS[pos.key] || { bg: "#333", text: "#fff" };
                          return (
                            <button
                              key={pos.key}
                              onClick={() => togglePosFilter(pos.key)}
                              className={`px-2 py-1 border-[1.5px] border-black text-[9px] uppercase tracking-wider transition-all ${
                                isActive
                                  ? "shadow-[2px_2px_0_#000] scale-[1.02]"
                                  : "hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0_#000]"
                              }`}
                              style={{
                                fontWeight: 800,
                                background: isActive ? color.bg : "#fff",
                                color: isActive ? color.text : "#000",
                              }}
                            >
                              {pos.labelEn}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="h-[2px] bg-black/10" />

                    {/* ── Level Badges ── */}
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#888] mb-1.5 block" style={{ fontWeight: 800 }}>
                        ANTAS · LEVEL
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {FILTER_LEVEL_OPTIONS.map((lvl) => {
                          const isActive = filterLevel === lvl.key;
                          const color = LEVEL_COLORS[lvl.key] || "#ccc";
                          return (
                            <button
                              key={lvl.key}
                              onClick={() => setFilterLevel(isActive ? null : lvl.key)}
                              className={`flex-auto min-w-[80px] px-2 py-1.5 border-[1.5px] border-black text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                                isActive
                                  ? "shadow-[2px_2px_0_#000] scale-[1.02]"
                                  : "hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0_#000]"
                              }`}
                              style={{
                                fontWeight: 800,
                                background: isActive ? color : "#fff",
                                color: isActive ? (lvl.key === "ADVANCED" ? "#fff" : "#000") : "#000",
                              }}
                            >
                              <span>{lvl.emoji}</span>
                              <span className="hidden sm:inline">{lvl.label}</span>
                              <span className="sm:hidden">{lvl.label.slice(0, 3)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="h-[2px] bg-black/10" />

                    {/* ── Root Words Only Toggle ── */}
                    <button
                      onClick={() => setFilterRootOnly(!filterRootOnly)}
                      className={`w-full px-3 py-2 border-[1.5px] border-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        filterRootOnly
                          ? "bg-[#FF007F] text-white shadow-[2px_2px_0_#000]"
                          : "bg-white text-black hover:bg-[#FFF0F5] hover:shadow-[2px_2px_0_#000]"
                      }`}
                      style={{ fontWeight: 900 }}
                    >
                      <span>⭐</span>
                      ROOT WORDS ONLY
                      {filterRootOnly && <Check className="w-3.5 h-3.5" />}
                    </button>

                    {/* ── Active Filter Summary ── */}
                    {activeFilterCount > 0 && (
                      <div className="flex items-center justify-between bg-[#FFFBF0] border-[1.5px] border-black/20 px-3 py-1.5">
                        <span className="text-[9px] uppercase tracking-widest text-[#888]" style={{ fontWeight: 800 }}>
                          {activeFilterCount} {activeFilterCount === 1 ? "FILTER" : "FILTERS"} ACTIVE
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-[#888]" style={{ fontWeight: 700 }}>
                          {filteredWords.length} {filteredWords.length === 1 ? "RESULT" : "RESULTS"}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Word list */}
          <div className="flex flex-col gap-2">
            {!search && (
              <div className="mb-1 pb-1 border-b-[2px] border-black/10 flex items-center justify-center gap-1">
                <span className="text-[12px]">🎲</span>
                <span className="text-[11px] uppercase tracking-widest text-black" style={{ fontWeight: 900 }}>
                  DISCOVER THESE WORDS
                </span>
              </div>
            )}
            
            {isInitialLoad || isLoading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 border-[2.5px] border-black bg-white"
                  >
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="w-7 h-7 shrink-0" />
                  </div>
                ))}
              </div>
            ) : filteredWords.length === 0 ? (
                <div className="p-8 text-center text-sm font-bold uppercase text-[#888]">
                    {activeFilterCount > 0 ? "NO WORDS MATCH YOUR FILTERS." : "NO WORDS FOUND."}
                </div>
            ) : (search ? filteredWords.slice(0, 12) : filteredWords.slice(0, 3)).map((w, idx) => {
              const posText = w.partOfSpeech || 'UNKNOWN';
              const ps = POS_COLORS[posText.toUpperCase()] || { bg: "#333", text: "#fff" };
              return (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: idx * 0.05 }}
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
                  {...(filteredWords.indexOf(w) === 0 ? { "data-tour-wordcard": true } : {})}
                  className={`${(!search && idx >= 2) ? 'hidden lg:flex' : 'flex'} items-start gap-3 p-4 text-left border-[2.5px] transition-all cursor-pointer ${
                    selectedId === w.id
                      ? "bg-[#FDE047] border-black shadow-[4px_4px_0_#000]"
                      : "bg-white border-black hover:shadow-[3px_3px_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                  }`}
                >
<div className="flex-1 min-w-0">
  <div className="flex items-center flex-wrap gap-1 mb-1">
    <span
      className="text-black uppercase"
      style={{ fontWeight: 900, fontSize: "1rem" }}
    >
      {w.word}
    </span>
    
    {/* POS Badge */}
    {w.posEnglish ? (
      <span
        className="inline-flex items-center justify-center h-[20px] px-1.5 border-[1.5px] border-black text-[9px] uppercase tracking-wider whitespace-nowrap"
        style={{
          fontWeight: 800,
          background: ps.bg,
          color: ps.text,
        }}
      >
        {w.posEnglish}
      </span>
    ) : null}

    {/* Root Word Emoji Badge */}
    {(!w.rootWordId && !w.rootWordString) && (
      <span
        className="inline-flex items-center justify-center h-[20px] w-[20px] border-[1.5px] border-black bg-[#FF007F] text-[10px]"
        title="Root Word"
      >
        ⭐
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
                </motion.div>
              );
            })}
          </div>
          
        {!search && (
  <div className="text-center mt-0.5">
    <span 
      className="inline-flex items-center justify-center gap-1 text-[10px] text-[#aaa] uppercase tracking-widest" 
      style={{ fontWeight: 600 }}
    >
      CLICK <ExternalLink className="w-3.5 h-3.5" /> FOR QUICK VIEW
    </span>
  </div>
)}

          {/* Word of the Day Gradient Card */}
          {wordOfTheDay && !search && (
            <div className="hidden lg:flex mt-4 bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5 relative overflow-hidden flex-col justify-between cursor-pointer group active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all" onClick={() => setSelectedId(wordOfTheDay.id)}>
              {/* Decorative background shape */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#7C3AED] rounded-full opacity-30 blur-2xl group-hover:bg-[#FF6D00] transition-colors duration-700"></div>
              <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-[#FDE047] rounded-full opacity-40 blur-xl group-hover:bg-[#0057FF] transition-colors duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-black" style={{ fill: "#FF6D00" }} />
                  <span className="text-xs font-black uppercase tracking-widest text-black">WORD OF THE DAY</span>
                </div>
                
                <h3 className="text-black uppercase mb-1" style={{ fontWeight: 900, fontSize: "2rem", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {wordOfTheDay.word}
                </h3>
                
                <p className="text-[#333] text-xs uppercase tracking-wider mb-4" style={{ fontWeight: 600 }}>
                  {wordOfTheDay.partOfSpeech}
                </p>
                
                <div className="h-[2px] bg-black w-full mb-3 opacity-20"></div>
                
                <p className="text-[#555] text-sm leading-relaxed overflow-hidden break-words hyphens-auto" style={{ fontWeight: 500 }}>
                  {wordOfTheDay.meaningFilipino || wordOfTheDay.translation || "Tuklasin ang kahulugan ng salitang ito."}
                </p>
              </div>
            </div>
          )}

          {/* Suggest a Word Card */}
          {!isInitialLoad && (!search || (!isLoading && search && words.length === 0)) && (
            <div className="hidden lg:flex mt-4 bg-[#E8F0FF] border-[3px] border-black shadow-[6px_6px_0_#000] p-5 flex-col items-center text-center group transition-all">
              <div className="w-10 h-10 bg-[#FF007F] border-[2px] border-black flex items-center justify-center rounded-full mb-3 shadow-[2px_2px_0_#000] group-hover:bg-[#7C3AED] transition-colors">
                <span className="text-white font-black text-lg">?</span>
              </div>
              <h3 className="text-black uppercase mb-2" style={{ fontWeight: 900, fontSize: "1.2rem", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                MISSING A WORD?
              </h3>
              <p className="text-[#555] text-xs uppercase mb-4 leading-relaxed" style={{ fontWeight: 700 }}>
                Can't find what you're looking for? Help us grow our dictionary!
              </p>
              <button 
                className="w-full bg-[#0057FF] border-[2px] border-black py-3 text-white text-xs uppercase tracking-widest shadow-[4px_4px_0_#000] relative group/btn transition-all hover:bg-black cursor-not-allowed" style={{ fontWeight: 900 }}
              >
                SUGGEST A WORD
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-[#FDE047] text-black border-[2px] border-black font-black text-[10px] uppercase px-3 py-1.5 opacity-0 group-hover/btn:opacity-100 transition-all shadow-[4px_4px_0_#000] whitespace-nowrap pointer-events-none">
                  Coming Soon
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Main Word Card */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {isInitialLoad ? (
             <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-6 lg:p-8 flex flex-col gap-6 min-h-[500px]">
                {/* Top row */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex gap-2">
                       <Skeleton className="h-6 w-20" />
                       <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-12 w-3/4 sm:w-1/2 mt-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Skeleton className="w-10 h-10" />
                    <Skeleton className="w-10 h-10" />
                    <Skeleton className="w-24 h-10" />
                  </div>
                </div>

                <div className="h-[3px] bg-black opacity-10" />

                {/* Definition Blocks */}
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-6 bg-zinc-200" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6 mt-2" />
                </div>

                {/* Extra Box Skeleton */}
                <div className="mt-4 border-[2px] border-black p-4 flex flex-col gap-3">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                
                {/* Examples Skeleton */}
                <div className="mt-4 flex flex-col gap-3">
                    <Skeleton className="h-5 w-48 mb-2" />
                    {[1, 2].map(i => (
                        <div key={i} className="border-[2px] border-black p-3">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-4/5" />
                        </div>
                    ))}
                </div>
              </div>
          ) : !word ? (
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              {isLoading ? (
                <>
                  <Loader2 className="w-12 h-12 text-black animate-spin mb-4" />
                  <h2 className="uppercase font-black text-xl text-[#888]">LOADING WORD...</h2>
                </>
              ) : (search && words.length === 0) ? (
                <>
                  <div className="w-16 h-16 bg-[#FF007F] border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_#000] mb-6">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="uppercase font-black text-xl text-black mb-2">NO EXACT MATCHES FOUND</h2>
                  
                  {isFuzzyLoading ? (
                    <div className="mt-6 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#FDE047] border-[2.5px] border-black flex items-center justify-center shadow-[3px_3px_0_#000]">
                            <Loader2 className="w-6 h-6 animate-spin text-black" />
                        </div>
                        <p className="uppercase font-black text-xs text-black tracking-widest">FINDING SIMILAR WORDS...</p>
                        <p className="uppercase font-bold text-[10px] text-[#888] tracking-wider">USING LEVENSHTEIN DISTANCE MATCHING</p>
                    </div>
                  ) : fuzzySuggestions.length > 0 ? (
                    <div className="mt-8 w-full max-w-lg">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 bg-[#7C3AED] border-[2px] border-black flex items-center justify-center shadow-[2px_2px_0_#000]">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase tracking-tight text-black leading-none">
                                    DID YOU MEAN?
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#888] mt-0.5">
                                    CLOSEST MATCHES FOR &ldquo;<span className="text-[#FF007F]">{debouncedSearch}</span>&rdquo;
                                </p>
                            </div>
                        </div>

                        {/* Suggestion Cards */}
                        <div className="flex flex-col gap-3">
                            {fuzzySuggestions.map((fw, idx) => {
                                const fwPosStyle = fw.partOfSpeech ? (POS_COLORS[fw.partOfSpeech.toUpperCase()] || { bg: "#333", text: "#fff" }) : { bg: "#333", text: "#fff" };
                                const dist = fw.distance ?? 0;
                                // Color gradient: 1 = green (close), 2 = yellow, 3 = orange
                                const distColor = dist <= 1 ? "#00C853" : dist <= 2 ? "#FFB300" : "#FF6D00";
                                const distLabel = dist <= 1 ? "VERY CLOSE" : dist <= 2 ? "CLOSE" : "SIMILAR";

                                return (
                                    <motion.button
                                        key={fw.id}
                                        initial={{ opacity: 0, y: 12, x: -8 }}
                                        animate={{ opacity: 1, y: 0, x: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25, delay: idx * 0.08 }}
                                        onClick={() => {
                                            setSearch(fw.word);
                                            setIsLoading(true);
                                        }}
                                        className="group flex items-stretch bg-white border-[2.5px] border-black shadow-[5px_5px_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0_#000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all text-left overflow-hidden"
                                    >
                                        {/* Distance indicator stripe */}
                                        <div
                                            className="w-[6px] flex-shrink-0"
                                            style={{ background: distColor }}
                                        />

                                        {/* Card content */}
                                        <div className="flex-1 p-3.5 min-w-0">
                                            <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
                                                {/* Word */}
                                                <span
                                                    className="text-black uppercase group-hover:text-[#7C3AED] transition-colors"
                                                    style={{ fontWeight: 900, fontSize: "1.15rem", lineHeight: 1, letterSpacing: "-0.01em" }}
                                                >
                                                    {fw.word}
                                                </span>

                                                {/* POS Badge */}
                                                <span
                                                    className="inline-flex items-center h-[18px] px-1.5 border-[1.5px] border-black text-[8px] uppercase tracking-wider"
                                                    style={{ fontWeight: 800, background: fwPosStyle.bg, color: fwPosStyle.text }}
                                                >
                                                    {fw.partOfSpeech}
                                                </span>

                                                {/* Root word indicator */}
                                                {(!fw.rootWordString) && (
                                                    <span
                                                        className="inline-flex items-center h-[18px] w-[18px] border-[1.5px] border-black bg-[#FF007F] text-[9px] justify-center"
                                                        title="Root Word"
                                                    >
                                                        ⭐
                                                    </span>
                                                )}

                                                {/* Distance badge */}
                                                <span
                                                    className="inline-flex items-center gap-1 h-[18px] px-1.5 border-[1.5px] text-[8px] uppercase tracking-wider ml-auto"
                                                    style={{ fontWeight: 800, background: distColor + "20", color: distColor, borderColor: distColor }}
                                                >
                                                    {/* Distance dots */}
                                                    <span className="flex items-center gap-[2px]">
                                                        {[1, 2, 3].map(d => (
                                                            <span
                                                                key={d}
                                                                className="w-[5px] h-[5px] rounded-full"
                                                                style={{ background: d <= (3 - dist) ? distColor : distColor + "30" }}
                                                            />
                                                        ))}
                                                    </span>
                                                    {distLabel}
                                                </span>
                                            </div>

                                            {/* Translation preview */}
                                            {fw.translation && (
                                                <p
                                                    className="text-[#666] text-[11px] uppercase tracking-wider truncate"
                                                    style={{ fontWeight: 600 }}
                                                >
                                                    {fw.translation.length > 60 ? fw.translation.slice(0, 60) + "..." : fw.translation}
                                                </p>
                                            )}
                                        </div>

                                        {/* Arrow indicator */}
                                        <div className="flex items-center px-3 bg-black/[0.03] group-hover:bg-[#FDE047] transition-colors border-l-[2px] border-black">
                                            <ArrowRight className="w-5 h-5 text-black/40 group-hover:text-black transition-colors" />
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Footer hint */}
                        <div className="mt-4 flex items-center justify-center gap-2 bg-[#FFFBF0] border-[1.5px] border-black/15 px-3 py-2">
                            <AlertCircle className="w-3 h-3 text-[#aaa]" />
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#aaa]">
                                RESULTS RANKED BY SPELLING SIMILARITY
                            </p>
                        </div>
                    </div>
                  ) : (
                    <div className="mt-6 flex flex-col items-center gap-3">
                        <p className="uppercase font-black text-xs text-black tracking-wider">NO SIMILAR WORDS FOUND</p>
                        <p className="uppercase font-bold text-[10px] text-[#888] tracking-wider max-w-xs text-center leading-relaxed">
                            TRY A DIFFERENT SPELLING OR USE THE SUGGEST A WORD FEATURE
                        </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[#FDE047] border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_#000] mb-6">
                    <Search className="w-8 h-8 text-black" />
                  </div>
                  <h2 className="uppercase font-black text-xl text-black">SELECT A WORD</h2>
                  <p className="uppercase font-bold text-xs text-[#555]">SEARCH AND CLICK ON A WORD TO VIEW ITS DETAILS</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Main Card */}
              <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-4">
                {/* Top row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div className="min-w-0 break-words flex-1 w-full">
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
                            className="px-2.5 py-1 border-[2px] border-black text-[10px] uppercase tracking-widest bg-[#FF007F] text-white shadow-[2px_2px_0_#000]"
                            style={{ fontWeight: 900 }}
                          >
                            ⭐ ROOT WORD
                          </span>
                      )}
                    </div>

                    <h2
                      className="text-black uppercase"
                      style={{ fontWeight: 900, fontSize: "clamp(2rem, 8vw, 2.8rem)", lineHeight: 1, letterSpacing: "-0.02em", wordBreak: "break-word" }}
                    >
                      {word.word}
                    </h2>
                    {word.pronunciation && (
                        <p className="text-[#888] mt-1 text-sm tracking-widest" style={{ fontWeight: 600 }}>
                          {word.pronunciation}
                        </p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-start sm:justify-end">
                    <button
                      onClick={() => setShareWord(word)}
                      className="w-10 h-10 bg-white border-[2px] border-black flex items-center justify-center hover:bg-[#0057FF] hover:text-white transition-colors shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                      aria-label="Share word"
                    >
                      <Send className="w-5 h-5" />
                    </button>
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
                      data-tour-save
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
                      <History className="w-4 h-4 text-[#FF6D00]" />
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
                            const newSearch = word.rootWord?.word || word.rootWordString || "";
                            if (search !== newSearch) {
                              setSearch(newSearch);
                              setIsLoading(true);
                            }
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
              {((word.related && word.related.length > 0) || (word.tags && word.tags.length > 0) || word.level) && (
                <div className={`grid grid-cols-1 gap-4 ${((word.related && word.related.length > 0) && ((word.tags && word.tags.length > 0) || word.level)) ? 'sm:grid-cols-2' : ''}`}>
                  {/* Related */}
                  {word.related && word.related.length > 0 && (
                    <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5 h-full">
                      <span className="text-xs uppercase tracking-widest text-black mb-4 block" style={{ fontWeight: 900 }}>
                        RELATED WORDS
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {word.related.map((r: string) => (
                          <button
                            key={r}
                            onClick={() => {
                              if (search !== r) {
                                setSearch(r);
                                setIsLoading(true);
                              }
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
                  {((word.tags && word.tags.length > 0) || word.level) && (
                    <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5 h-full">
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
                  )}
                </div>
              )}
            </>
          )}

          {/* Word of the Day Gradient Card (Mobile Only) */}
          {wordOfTheDay && !search && (
            <div className="flex lg:hidden mt-4 bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5 relative overflow-hidden flex-col justify-between cursor-pointer group active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all" onClick={() => setSelectedId(wordOfTheDay.id)}>
              {/* Decorative background shape */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#7C3AED] rounded-full opacity-30 blur-2xl group-hover:bg-[#FF6D00] transition-colors duration-700"></div>
              <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-[#FDE047] rounded-full opacity-40 blur-xl group-hover:bg-[#0057FF] transition-colors duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-black" style={{ fill: "#FF6D00" }} />
                  <span className="text-xs font-black uppercase tracking-widest text-black">WORD OF THE DAY</span>
                </div>
                
                <h3 className="text-black uppercase mb-1" style={{ fontWeight: 900, fontSize: "2rem", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {wordOfTheDay.word}
                </h3>
                
                <p className="text-[#333] text-xs uppercase tracking-wider mb-4" style={{ fontWeight: 600 }}>
                  {wordOfTheDay.partOfSpeech}
                </p>
                
                <div className="h-[2px] bg-black w-full mb-3 opacity-20"></div>
                
                <p className="text-[#555] text-sm leading-relaxed overflow-hidden break-words hyphens-auto" style={{ fontWeight: 500 }}>
                  {wordOfTheDay.meaningFilipino || wordOfTheDay.translation || "Tuklasin ang kahulugan ng salitang ito."}
                </p>
              </div>
            </div>
          )}

          {/* Suggest a Word Card (Mobile Only) */}
          {!isInitialLoad && (!search || (!isLoading && search && words.length === 0)) && (
            <div className="flex lg:hidden mt-4 bg-[#E8F0FF] border-[3px] border-black shadow-[6px_6px_0_#000] p-5 flex-col items-center text-center group transition-all">
              <div className="w-10 h-10 bg-[#FF007F] border-[2px] border-black flex items-center justify-center rounded-full mb-3 shadow-[2px_2px_0_#000] group-hover:bg-[#7C3AED] transition-colors">
                <span className="text-white font-black text-lg">?</span>
              </div>
              <h3 className="text-black uppercase mb-2" style={{ fontWeight: 900, fontSize: "1.2rem", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                MISSING A WORD?
              </h3>
              <p className="text-[#555] text-xs uppercase mb-4 leading-relaxed" style={{ fontWeight: 700 }}>
                Can't find what you're looking for? Help us grow our dictionary!
              </p>
              <button 
                className="w-full bg-[#0057FF] border-[2px] border-black py-3 text-white text-xs uppercase tracking-widest shadow-[4px_4px_0_#000] relative group/btn transition-all hover:bg-black cursor-not-allowed" style={{ fontWeight: 900 }}
              >
                SUGGEST A WORD
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-[#FDE047] text-black border-[2px] border-black font-black text-[10px] uppercase px-3 py-1.5 opacity-0 group-hover/btn:opacity-100 transition-all shadow-[4px_4px_0_#000] whitespace-nowrap pointer-events-none">
                  Coming Soon
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Spotlight Tour ─── */}
      <AnimatePresence>
        {tourStep >= 0 && tourStep < TOUR_STEPS.length && (
          <SpotlightTour
            step={tourStep}
            totalSteps={TOUR_STEPS.length}
            onNext={() => {
              if (tourStep < TOUR_STEPS.length - 1) {
                setTourStep(tourStep + 1);
              } else {
                setTourStep(-1);
                tourRouter.replace("/dictionary", { scroll: false });
              }
            }}
            onSkip={() => {
              setTourStep(-1);
              tourRouter.replace("/dictionary", { scroll: false });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
