"use client"

import { useState } from "react";
import {
  Search,
  Volume2,
  BookOpen,
  ChevronRight,
  Star,
  Tag,
  ArrowRight,
  Bookmark,
  BookMarked,
} from "lucide-react";

const SAMPLE_WORDS = [
  {
    id: 1,
    word: "Pagmamahal",
    pronunciation: "/pag-ma-ma-HÁL/",
    partOfSpeech: "PANGNGALAN",
    posEnglish: "NOUN",
    definition:
      "Ang malalim na damdamin ng pagmamahal, pagtanggap, at pagmamalasakit sa isang tao, bagay, o konsepto.",
    definitionEn: "Deep feeling of love, affection, and care toward a person, thing, or concept.",
    etymology: "Mula sa salitang-ugat na MAHAL (precious/expensive) + pag- (verbal prefix)",
    rootWord: "MAHAL",
    rootWordId: 2,
    tags: ["DAMDAMIN", "RELASYON"],
    usageNotes:
      "Ginagamit upang ilarawan ang malalim na pagmamahal. Mas pormal kaysa sa 'pagmahal'.",
    examples: [
      {
        sentence: "Ang **pagmamahal** ng isang ina sa kanyang anak ay walang hanggan.",
        translation: "A mother's **love** for her child is eternal.",
      },
      {
        sentence: "Ipinakita niya ang kanyang **pagmamahal** sa pamamagitan ng mga simpleng kilos.",
        translation: "He showed his **love** through simple gestures.",
      },
      {
        sentence: "Ang **pagmamahal** sa bayan ay dapat na linangin mula sa pagkabata.",
        translation: "**Love** for the nation must be cultivated from childhood.",
      },
    ],
    related: ["PAGIBIG", "PAGMAHAL", "MALASAKIT", "PAGKALINGA"],
    level: "INTERMEDIATE",
    frequency: "COMMON",
  },
  {
    id: 2,
    word: "Mahal",
    pronunciation: "/MA-hal/",
    partOfSpeech: "PANG-URI",
    posEnglish: "ADJECTIVE",
    definition:
      "Ang isang bagay o tao na may mataas na halaga o presyo; mahalaga; pinahahalagahan.",
    definitionEn: "Something or someone of high value or price; precious; treasured.",
    etymology: "Mula sa Sanskrit na 'mahā' (great, large)",
    rootWord: "MAHAL",
    rootWordId: 2,
    tags: ["HALAGA", "DAMDAMIN"],
    usageNotes: "Maaaring tumukoy sa presyo (expensive) o damdamin (beloved/precious).",
    examples: [
      {
        sentence: "**Mahal** ang presyo ng mansyon sa lungsod.",
        translation: "The price of a mansion in the city is **expensive**.",
      },
      {
        sentence: "**Mahal** kita nang higit sa lahat.",
        translation: "I love you more than anything — you are **precious** to me.",
      },
    ],
    related: ["BAGO", "MURA", "HALAGA", "PRESYO"],
    level: "BEGINNER",
    frequency: "VERY COMMON",
  },
  {
    id: 3,
    word: "Kaliwanagan",
    pronunciation: "/ka-li-wa-NA-gan/",
    partOfSpeech: "PANGNGALAN",
    posEnglish: "NOUN",
    definition:
      "Ang katayuan ng pagkakaroon ng kaalaman, pag-unawa, o linaw tungkol sa isang bagay.",
    definitionEn: "The state of having knowledge, understanding, or clarity about something; enlightenment.",
    etymology: "Mula sa LIWANAG (light) + ka- -an (noun circumfix)",
    rootWord: "LIWANAG",
    rootWordId: 4,
    tags: ["KARUNUNGAN", "PILOSOPIYA"],
    usageNotes: "Kadalasang ginagamit sa pilosopikal o relihiyosong konteksto.",
    examples: [
      {
        sentence: "Hanapin natin ang **kaliwanagan** sa kaalaman at karunungan.",
        translation: "Let us seek **enlightenment** through knowledge and wisdom.",
      },
    ],
    related: ["LIWANAG", "KAALAMAN", "KARUNUNGAN", "DUNONG"],
    level: "ADVANCED",
    frequency: "UNCOMMON",
  },
];

const POS_COLORS: Record<string, { bg: string; text: string }> = {
  PANGNGALAN: { bg: "#7C3AED", text: "#fff" },
  "PANG-URI": { bg: "#0057FF", text: "#fff" },
  PANDIWA: { bg: "#FF6D00", text: "#fff" },
  "PANG-ABAY": { bg: "#00C853", text: "#000" },
  PANGHALIP: { bg: "#FF1744", text: "#fff" },
};

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "#00C853",
  INTERMEDIATE: "#FFE500",
  ADVANCED: "#FF6D00",
};

function highlightBold(text: string) {
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
  const [selectedId, setSelectedId] = useState(1);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<number[]>([]);

  const word = SAMPLE_WORDS.find((w) => w.id === selectedId) || SAMPLE_WORDS[0];
  const posStyle = POS_COLORS[word.partOfSpeech] || { bg: "#333", text: "#fff" };

  const filtered = SAMPLE_WORDS.filter(
    (w) =>
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.definitionEn.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSave = (id: number) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
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
            {filtered.map((w) => {
              const ps = POS_COLORS[w.partOfSpeech] || { bg: "#333", text: "#fff" };
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedId(w.id)}
                  className={`flex items-start gap-3 p-4 text-left border-[2.5px] transition-all ${
                    selectedId === w.id
                      ? "bg-[#FFE500] border-black shadow-[4px_4px_0_#000]"
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
                    </div>
                    <p
                      className="text-[#555] text-xs uppercase tracking-wider truncate"
                      style={{ fontWeight: 600 }}
                    >
                      {w.definitionEn.slice(0, 50)}...
                    </p>
                  </div>
                  <div
                    className="text-[9px] px-1.5 py-0.5 border-[1.5px] border-black mt-0.5 shrink-0"
                    style={{
                      fontWeight: 800,
                      background: LEVEL_COLORS[w.level],
                      color: w.level === "INTERMEDIATE" ? "#000" : w.level === "BEGINNER" ? "#000" : "#fff",
                    }}
                  >
                    {w.level}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Word Card */}
        <div className="lg:col-span-2 flex flex-col gap-4">
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
                    {word.partOfSpeech} · {word.posEnglish}
                  </span>
                  {/* Frequency */}
                  <span
                    className="px-2 py-1 border-[2px] border-black text-[10px] uppercase tracking-widest bg-[#f5f5f5]"
                    style={{ fontWeight: 700 }}
                  >
                    {word.frequency}
                  </span>
                </div>

                <h2
                  className="text-black uppercase"
                  style={{ fontWeight: 900, fontSize: "2.8rem", lineHeight: 1, letterSpacing: "-0.02em" }}
                >
                  {word.word}
                </h2>
                <p className="text-[#888] mt-1 text-sm uppercase tracking-widest" style={{ fontWeight: 600 }}>
                  {word.pronunciation}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  className="w-10 h-10 bg-[#f0f0f0] border-[2px] border-black flex items-center justify-center hover:bg-[#FFE500] transition-colors shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  title="Listen"
                >
                  <Volume2 className="w-5 h-5 text-black" />
                </button>
                <button
                  onClick={() => toggleSave(word.id)}
                  className={`w-10 h-10 border-[2px] border-black flex items-center justify-center transition-colors shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                    saved.includes(word.id) ? "bg-[#7C3AED]" : "bg-[#f0f0f0] hover:bg-[#7C3AED] hover:text-white"
                  }`}
                  title="Save to Vault"
                >
                  {saved.includes(word.id) ? (
                    <BookMarked className="w-5 h-5 text-white" />
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
              <p className="text-black text-sm leading-relaxed mb-2" style={{ fontWeight: 600 }}>
                <span className="text-[#7C3AED]" style={{ fontWeight: 900 }}>FIL: </span>
                {word.definition}
              </p>
              <p className="text-[#555] text-sm leading-relaxed" style={{ fontWeight: 500 }}>
                <span className="text-[#0057FF]" style={{ fontWeight: 900 }}>EN: </span>
                {word.definitionEn}
              </p>
            </div>

            {/* Etymology / Root Word */}
            <div className="bg-[#FFFBF0] border-[2px] border-black p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-[#FF6D00]" />
                <span className="text-xs uppercase tracking-widest text-[#888]" style={{ fontWeight: 800 }}>
                  ETYMOLOGY & ROOT WORD
                </span>
              </div>
              <p className="text-[#555] text-xs uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>
                {word.etymology}
              </p>
              <button
                onClick={() => {
                  const root = SAMPLE_WORDS.find((w) => w.id === word.rootWordId);
                  if (root) setSelectedId(root.id);
                }}
                className="inline-flex items-center gap-2 bg-[#FFE500] border-[2px] border-black px-3 py-1.5 text-xs uppercase tracking-widest shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:bg-[#f5d800]"
                style={{ fontWeight: 800 }}
              >
                SALITANG-UGAT: {word.rootWord}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

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
          <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1.5 h-6 bg-[#FFE500] border-l-[2px] border-black" />
              <span className="text-sm uppercase tracking-widest text-black" style={{ fontWeight: 900 }}>
                HALIMBAWANG PANGUNGUSAP · EXAMPLE SENTENCES
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {word.examples.map((ex, i) => (
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
                      <p className="text-black text-sm leading-relaxed mb-1.5" style={{ fontWeight: 600 }}>
                        🇵🇭 {highlightBold(ex.sentence)}
                      </p>
                      <p className="text-[#666] text-sm leading-relaxed" style={{ fontWeight: 500 }}>
                        🇺🇸 {highlightBold(ex.translation)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Words + Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Related */}
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5">
              <span className="text-xs uppercase tracking-widest text-black mb-4 block" style={{ fontWeight: 900 }}>
                RELATED WORDS
              </span>
              <div className="flex flex-wrap gap-2">
                {word.related.map((r) => (
                  <button
                    key={r}
                    className="px-3 py-1.5 bg-white border-[2px] border-black text-xs uppercase tracking-wider hover:bg-black hover:text-[#FFE500] transition-colors shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    style={{ fontWeight: 800 }}
                  >
                    {r}
                    <ArrowRight className="inline-block w-3 h-3 ml-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0_#000] p-5">
              <span className="text-xs uppercase tracking-widest text-black mb-4 block" style={{ fontWeight: 900 }}>
                CATEGORIES
              </span>
              <div className="flex flex-wrap gap-2">
                {word.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-[#7C3AED] text-white border-[2px] border-black text-xs uppercase tracking-wider"
                    style={{ fontWeight: 800 }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t-[2px] border-black">
                <span
                  className="text-xs uppercase tracking-widest px-2 py-1 border-[2px] border-black"
                  style={{
                    fontWeight: 800,
                    background: LEVEL_COLORS[word.level],
                    color: word.level === "ADVANCED" ? "#fff" : "#000",
                  }}
                >
                  LEVEL: {word.level}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
