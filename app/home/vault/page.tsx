"use client";

import { useState } from "react";
import { BookMarked, ChevronRight, Plus, Search, Tag } from "lucide-react";

// ─── Mock data ───────────────────────────────────────────────────────────────
const VAULT_WORDS = [
  { id: 1, word: "Pagmamahal", definition: "Love / Deep affection", tags: ["DAMDAMIN", "RELASYON"], pos: "PANGNGALAN", posColor: "#7C3AED", saved: "2 days ago" },
  { id: 2, word: "Kalayaan", definition: "Freedom / Liberty", tags: ["BANSA", "KASAYSAYAN"], pos: "PANGNGALAN", posColor: "#7C3AED", saved: "3 days ago" },
  { id: 3, word: "Maganda", definition: "Beautiful / Pretty", tags: ["KATANGIAN"], pos: "PANG-URI", posColor: "#0057FF", saved: "1 week ago" },
  { id: 4, word: "Kalikasan", definition: "Nature / Environment", tags: ["KAPALIGIRAN"], pos: "PANGNGALAN", posColor: "#7C3AED", saved: "1 week ago" },
  { id: 5, word: "Matatag", definition: "Strong / Resilient", tags: ["KATANGIAN", "KARAKTER"], pos: "PANG-URI", posColor: "#0057FF", saved: "2 weeks ago" },
  { id: 6, word: "Umibig", definition: "To fall in love", tags: ["DAMDAMIN", "KILOS"], pos: "PANDIWA", posColor: "#FF6D00", saved: "2 weeks ago" },
];

const ALL_TAGS = ["ALL", "DAMDAMIN", "RELASYON", "BANSA", "KASAYSAYAN", "KATANGIAN", "KAPALIGIRAN", "KARAKTER", "KILOS"];

export default function VaultPage() {
  const [activeTag, setActiveTag] = useState("ALL");
  const [vaultSearch, setVaultSearch] = useState("");

  const filteredVault = VAULT_WORDS.filter((w) => {
    const matchTag = activeTag === "ALL" || w.tags.includes(activeTag);
    const matchSearch =
      w.word.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      w.definition.toLowerCase().includes(vaultSearch.toLowerCase());
    return matchTag && matchSearch;
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
              {VAULT_WORDS.length} WORDS SAVED · ORGANIZED BY TAGS
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-[#7C3AED] text-white border-[2.5px] border-black shadow-[4px_4px_0_#000] uppercase tracking-widest text-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all hover:bg-[#6d28d9]" style={{ fontWeight: 900 }}>
            <Plus className="w-4 h-4" />
            ADD WORD
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" />
          <input
            type="text"
            value={vaultSearch}
            onChange={(e) => setVaultSearch(e.target.value)}
            placeholder="SEARCH YOUR VAULT..."
            className="w-full pl-11 pr-4 py-3 bg-white border-[2.5px] border-black outline-none focus:shadow-[4px_4px_0_#000] transition-shadow uppercase text-sm"
            style={{ fontWeight: 700 }}
          />
        </div>

        {/* Tags filter */}
        <div className="flex gap-2 flex-wrap">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border-[2px] border-black text-xs uppercase tracking-widest transition-all ${
                activeTag === tag
                  ? "bg-[#7C3AED] text-white shadow-[2px_2px_0_#000]"
                  : "bg-white text-black hover:bg-[#f0f0f0]"
              }`}
              style={{ fontWeight: 800 }}
            >
              {tag !== "ALL" && <Tag className="w-3 h-3" />}
              {tag}
            </button>
          ))}
        </div>

        {/* Word grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVault.map((w) => (
            <div
              key={w.id}
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
                    {w.definition}
                  </p>
                </div>
                <span
                  className="text-white text-[9px] uppercase tracking-wider px-2 py-1 border-[1.5px] border-black shrink-0"
                  style={{ fontWeight: 800, background: w.posColor }}
                >
                  {w.pos.slice(0, 4)}
                </span>
              </div>

              {/* Divider */}
              <div className="h-[2px] bg-black" />

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {w.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-0.5 bg-[#FFFBF0] border-[1.5px] border-black text-[9px] uppercase tracking-wider"
                    style={{ fontWeight: 800 }}
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t-[1.5px] border-[#eee]">
                <span className="text-[10px] text-[#aaa] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                  SAVED {w.saved}
                </span>
                <button className="flex items-center gap-1 text-[10px] text-black uppercase tracking-wider hover:text-[#7C3AED] transition-colors" style={{ fontWeight: 800 }}>
                  STUDY <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {/* Add new card */}
          <div className="border-[2.5px] border-dashed border-[#ccc] p-5 flex flex-col items-center justify-center gap-3 text-[#ccc] hover:border-black hover:text-black transition-all cursor-pointer min-h-[160px]">
            <Plus className="w-8 h-8" />
            <span className="text-xs uppercase tracking-widest" style={{ fontWeight: 800 }}>
              ADD NEW WORD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
