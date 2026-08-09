"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GitBranch,
  ChevronRight,
  Loader2,
  TreePine,
} from "lucide-react";
import { getRootWordFamily } from "@/app/actions/dictionary";
import { POS_COLORS } from "@/lib/utils";
import Image from "next/image";

type WordFamily = {
  rootWord: any;
  derivedWords: any[];
  currentWordId: string;
};

/**
 * Extracts the affix from a derived word by comparing it to the root word.
 * Returns a label like "MAG-", "-IN-", "-AN", etc.
 */
function extractAffix(derivedWord: string, rootWord: string): string {
  const derived = derivedWord.toLowerCase();
  const root = rootWord.toLowerCase();

  if (!derived.includes(root)) {
    // Fuzzy: root may have been modified (e.g., vowel change)
    // Just return the full word difference
    return "~";
  }

  const rootIndex = derived.indexOf(root);
  const prefix = derived.substring(0, rootIndex);
  const suffix = derived.substring(rootIndex + root.length);

  const parts: string[] = [];
  if (prefix) parts.push(prefix.toUpperCase() + "-");
  if (suffix) parts.push("-" + suffix.toUpperCase());

  if (parts.length === 0) return "=";
  return parts.join(" + ");
}

/**
 * Groups derived words by their affix pattern.
 */
function groupByAffix(derivedWords: any[], rootWord: string) {
  const groups: Record<string, any[]> = {};

  for (const word of derivedWords) {
    const affix = extractAffix(word.word, rootWord);
    if (!groups[affix]) groups[affix] = [];
    groups[affix].push(word);
  }

  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

/* ─── Affix Badge Color Palette ─── */
const AFFIX_COLORS = [
  { bg: "#7C3AED", text: "#fff" }, // violet
  { bg: "#FF6D00", text: "#fff" }, // orange
  { bg: "#0057FF", text: "#fff" }, // blue
  { bg: "#00C853", text: "#000" }, // green
  { bg: "#FF007F", text: "#fff" }, // pink
  { bg: "#06B6D4", text: "#fff" }, // cyan
  { bg: "#EAB308", text: "#000" }, // yellow
  { bg: "#F43F5E", text: "#fff" }, // rose
];

export default function RootWordTree({
  wordId,
  onSelectWord,
}: {
  wordId: string;
  onSelectWord: (wordId: string, wordText: string, wordObj: any) => void;
}) {
  const [family, setFamily] = useState<WordFamily | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState(false);

  const fetchFamily = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(false);
    try {
      const result = await getRootWordFamily(id);
      setFamily(result);
      if (result && result.derivedWords.length > 0) {
        setIsExpanded(true);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setFamily(null);
    setIsExpanded(false);
    fetchFamily(wordId);
  }, [wordId, fetchFamily]);

  // Fallback state
  if (!isLoading && (!family || family.derivedWords.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 gap-4">
        <div className="relative w-32 h-32 opacity-100">
          <Image
            src="/images/Feliz.svg"
            alt="Feliz Mascot"
            fill
            className="object-contain"
          />
        </div>
        <div className="text-center max-w-[220px]">
          <p
            className="text-black text-xs uppercase tracking-wider leading-relaxed"
            style={{ fontWeight: 900 }}
          >
            WALANG PAMILYA PA!
          </p>
          <p
            className="text-[#999] text-[10px] uppercase tracking-wider leading-relaxed mt-1"
            style={{ fontWeight: 600 }}
          >
            This word&apos;s flying solo — for now.
          </p>
        </div>
      </div>
    );
  }

  const groups = family
    ? groupByAffix(family.derivedWords, family.rootWord.word)
    : [];

  return (
    <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000]">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-[#FFFBF0] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF007F] border-[2px] border-black flex items-center justify-center shadow-[2px_2px_0_#000]">
            <TreePine className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <span
              className="text-xs uppercase tracking-widest text-black block leading-tight"
              style={{ fontWeight: 900 }}
            >
              PAMILYA NG SALITA
            </span>
            <span
              className="text-[10px] uppercase tracking-widest text-[#888] block"
              style={{ fontWeight: 600 }}
            >
              WORD FAMILY TREE
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[#888] animate-spin" />
          )}
          {family && (
            <span
              className="px-2 py-0.5 bg-[#FF007F] border-[1.5px] border-black text-white text-[9px] uppercase tracking-wider shadow-[1px_1px_0_#000]"
              style={{ fontWeight: 900 }}
            >
              {family.derivedWords.length} DERIVED
            </span>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <ChevronRight className="w-5 h-5 text-black" />
          </motion.div>
        </div>
      </button>

      {/* Tree Content */}
      <AnimatePresence>
        {isExpanded && family && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="overflow-hidden"
          >
            {/* Separator */}
            <div className="h-[3px] bg-black" />

            <div className="p-4">
              {/* Root Word Node */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-[3px] h-8 bg-[#FF007F]" />
                <button
                  onClick={() =>
                    onSelectWord(family.rootWord.id, family.rootWord.word, family.rootWord)
                  }
                  className={`flex items-center gap-2 px-4 py-2.5 border-[2.5px] border-black transition-all ${
                    family.currentWordId === family.rootWord.id
                      ? "bg-[#FDE047] shadow-[4px_4px_0_#000]"
                      : "bg-white shadow-[3px_3px_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                  }`}
                >
                  <span className="text-[10px]">⭐</span>
                  <span
                    className="text-black uppercase"
                    style={{ fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-0.01em" }}
                  >
                    {family.rootWord.word}
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-widest text-[#888]"
                    style={{ fontWeight: 700 }}
                  >
                    UGAT
                  </span>
                </button>
              </div>

              {/* Derived Word Groups */}
              <div className="flex flex-col gap-4 ml-2">
                {groups.map(([affix, words], groupIdx) => {
                  const colorScheme =
                    AFFIX_COLORS[groupIdx % AFFIX_COLORS.length];
                  return (
                    <div key={affix} className="relative">
                      {/* Vertical connector line */}
                      <div
                        className="absolute left-[10px] top-0 bottom-0 w-[2px]"
                        style={{ background: colorScheme.bg + "40" }}
                      />

                      {/* Affix label */}
                      <div className="flex items-center gap-2 mb-2 relative z-10">
                        <div
                          className="w-[22px] h-[22px] border-[2px] border-black flex items-center justify-center"
                          style={{ background: colorScheme.bg }}
                        >
                          <GitBranch
                            className="w-3 h-3"
                            style={{ color: colorScheme.text }}
                          />
                        </div>
                        <span
                          className="px-2 py-0.5 border-[1.5px] border-black text-[10px] uppercase tracking-widest shadow-[1px_1px_0_#000]"
                          style={{
                            fontWeight: 900,
                            background: colorScheme.bg,
                            color: colorScheme.text,
                          }}
                        >
                          {affix}
                        </span>
                      </div>

                      {/* Word cards in this group */}
                      <div className="flex flex-wrap gap-2 ml-8 relative z-10">
                        {words.map((w: any, wIdx: number) => {
                          const posStyle = w.partOfSpeech
                            ? POS_COLORS[w.partOfSpeech.toUpperCase()] || {
                                bg: "#333",
                                text: "#fff",
                              }
                            : { bg: "#333", text: "#fff" };
                          const isActive =
                            family.currentWordId === w.id;

                          return (
                            <motion.button
                              key={w.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                                delay: groupIdx * 0.05 + wIdx * 0.03,
                              }}
                              onClick={() =>
                                onSelectWord(w.id, w.word, w)
                              }
                              className={`flex items-center gap-1.5 px-2 py-1 border-[2px] border-black text-left transition-all ${
                                isActive
                                  ? "bg-[#FDE047] shadow-[3px_3px_0_#000]"
                                  : "bg-white shadow-[2px_2px_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                              }`}
                            >
                              <span
                                className="text-black uppercase"
                                style={{
                                  fontWeight: 800,
                                  fontSize: "0.75rem",
                                }}
                              >
                                {w.word}
                              </span>
                              {w.posEnglish && (
                                <span
                                  className="inline-flex items-center h-[14px] px-1 border-[1px] border-black text-[6px] uppercase tracking-wider"
                                  style={{
                                    fontWeight: 800,
                                    background: posStyle.bg,
                                    color: posStyle.text,
                                  }}
                                >
                                  {w.posEnglish}
                                </span>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-5 flex items-center justify-center gap-2 bg-[#FFFBF0] border-[1.5px] border-black/15 px-3 py-2">
                <TreePine className="w-3 h-3 text-[#aaa]" />
                <p
                  className="text-[9px] uppercase tracking-widest text-[#aaa]"
                  style={{ fontWeight: 800 }}
                >
                  {family.derivedWords.length} WORDS FROM ROOT &ldquo;
                  {family.rootWord.word.toUpperCase()}&rdquo;
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {error && (
        <div className="p-4 border-t-[3px] border-black">
          <p
            className="text-[10px] uppercase tracking-widest text-[#FF1744] text-center"
            style={{ fontWeight: 800 }}
          >
            FAILED TO LOAD WORD TREE
          </p>
        </div>
      )}
    </div>
  );
}
