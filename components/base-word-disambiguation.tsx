import Link from "next/link";
import { POS_COLORS } from "@/lib/utils";

type WordEntry = {
  id: string;
  slug: string;
  word: string;
  partOfSpeech: string | null;
  translation: string;
};

type BaseWordDisambiguationProps = {
  baseWord: string;
  entries: WordEntry[];
};

/* Map Tagalog POS → short English label */
const POS_EN: Record<string, string> = {
  PANGNGALAN: "Noun",
  PANDIWA: "Verb",
  "PANG-URI": "Adjective",
  "PANG-ABAY": "Adverb",
  PANGHALIP: "Pronoun",
  PANDAMDAM: "Interjection",
  PANGATNIG: "Conjunction",
  "PANG-UKOL": "Preposition",
  PANTUKOY: "Article",
  PANLAPI: "Affix",
  DAGLAT: "Abbreviation",
  "PARIRALA / IDYOMA": "Phrase / Idiom",
};



function getEnglishPos(partOfSpeech: string | null): string | null {
  if (!partOfSpeech) return null;
  const upper = partOfSpeech.toUpperCase();
  if (POS_EN[upper]) return POS_EN[upper];
  // Handle compound POS like "PANDIWA / PANGNGALAN"
  const parts = upper.split(" / ");
  const mapped = parts.map((p) => POS_EN[p.trim()] || p.trim());
  return mapped.join(" / ");
}

function getPosStyle(partOfSpeech: string | null) {
  if (!partOfSpeech) return { bg: "#64748B", text: "#fff" };
  return (
    POS_COLORS[partOfSpeech.toUpperCase()] || { bg: "#64748B", text: "#fff" }
  );
}

export default function BaseWordDisambiguation({
  baseWord,
  entries,
}: BaseWordDisambiguationProps) {
  const displayWord = baseWord.charAt(0).toUpperCase() + baseWord.slice(1);

  return (
    <div className="min-h-screen bg-[#FFFBF0] p-4 md:p-8">
      {/* Decorative background shapes */}
      <div
        className="pointer-events-none fixed left-[-80px] top-[10%] h-40 w-40 border-[3px] border-black/5"
        style={{ transform: "rotate(12deg)" }}
      />
      <div
        className="pointer-events-none fixed right-[-40px] top-[30%] h-24 w-24 border-[3px] border-black/5"
        style={{
          background:
            "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(236,72,153,0.06))",
          transform: "rotate(-8deg)",
        }}
      />
      <div
        className="pointer-events-none fixed bottom-[15%] left-[10%] h-16 w-16 border-[3px] border-black/5"
        style={{
          background: "rgba(253,224,71,0.1)",
          transform: "rotate(20deg)",
        }}
      />

      <div className="relative mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href="/salita"
          className="mb-6 inline-flex items-center gap-1 border-2 border-black bg-yellow-300 px-3 py-1.5 text-xs font-black uppercase tracking-tight shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
        >
          ← Back to Dictionary
        </Link>

        {/* Header card */}
        <div className="border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
          {/* Colored top strip */}
          <div
            className="h-2 w-full border-b-2 border-black bg-yellow-300"
          />

          <div className="p-5 md:p-6">
            {/* Title section — word on its own line to prevent overflow */}
            <div className="mb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                Multiple meanings found
              </p>
              <h1 className="mt-2 text-2xl font-black uppercase italic tracking-tighter text-black md:text-4xl">
                Which did you mean?
              </h1>
              <div
                className="mt-2 inline-block border-2 border-black px-3 py-1 text-2xl font-black uppercase tracking-tighter text-black shadow-[3px_3px_0_0_#000] md:text-4xl"
                style={{
                  background:
                    "linear-gradient(135deg, #FDE047 0%, #fef08a 100%)",
                }}
              >
                {displayWord}
              </div>
            </div>

            <p className="mt-4 text-xs font-bold leading-relaxed text-black/50 md:text-sm">
              This word has{" "}
              <span className="font-black text-black">{entries.length}</span>{" "}
              different entries. Pick the one that matches the meaning
              you&apos;re looking for.
            </p>

            {/* Entry cards */}
            <ul className="mt-6 grid gap-3">
              {entries.map((entry, index) => {
                const posStyle = getPosStyle(entry.partOfSpeech);
                const englishPos = getEnglishPos(entry.partOfSpeech);

                return (
                  <li key={entry.id}>
                    <Link
                      href={`/salita/${entry.slug}`}
                      className="group flex items-stretch border-2 border-black bg-white shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    >
                      {/* Gradient number indicator */}
                      <div
                        className="flex w-14 flex-shrink-0 flex-col items-center justify-center border-r-2 border-black md:w-16"
                        style={{ background: posStyle.bg, color: posStyle.text }}
                      >
                        <span className="text-2xl font-black md:text-3xl">
                          {index + 1}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col gap-1.5 p-3 md:p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-black uppercase tracking-tight text-black md:text-xl">
                            {entry.word}
                          </p>
                          <span
                            className="border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0_0_#000]"
                            style={{
                              background: posStyle.bg,
                              color: posStyle.text,
                            }}
                          >
                            {entry.partOfSpeech || "Unknown"}
                            {englishPos ? ` · ${englishPos}` : ""}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-black/55">
                          {entry.translation}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="flex flex-shrink-0 items-center pr-3 md:pr-5">
                        <span className="text-lg font-black text-black/15 transition-all group-hover:translate-x-1 group-hover:text-black">
                          →
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
