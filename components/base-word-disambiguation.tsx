import Link from "next/link";

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

const POS_ACCENTS: Record<string, string> = {
  PANGNGALAN: "bg-cyan-300",
  PANDIWA: "bg-green-300",
  "PANG-URI": "bg-pink-300",
  PANGHALIP: "bg-orange-300",
  PANGATNIG: "bg-lime-300",
  "PANG-ABAY": "bg-blue-300",
};

function getPosAccent(partOfSpeech: string | null) {
  if (!partOfSpeech) return "bg-zinc-200";
  return POS_ACCENTS[partOfSpeech.toUpperCase()] || "bg-zinc-200";
}

export default function BaseWordDisambiguation({
  baseWord,
  entries,
}: BaseWordDisambiguationProps) {
  const displayWord = baseWord.charAt(0).toUpperCase() + baseWord.slice(1);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#fde047_0%,#fff7d6_28%,#fffbf0_55%,#fff3c4_100%)] p-4 md:p-8">
      <div className="mx-auto max-w-4xl border-4 border-black bg-white p-5 shadow-[8px_8px_0_0_#000] md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4">
          <Link
            href="/salita"
            className="inline-flex items-center border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-black uppercase tracking-tight shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            ← Bumalik sa Salita
          </Link>
          <span className="border-2 border-black bg-black px-3 py-1 text-xs font-black uppercase tracking-widest text-yellow-300">
            {entries.length} na kahulugan
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-black md:text-5xl">
              Piliin ang tamang
              <span className="ml-2 inline-block border-2 border-black bg-yellow-300 px-2">{displayWord}</span>
            </h1>
            <p className="mt-3 border-l-4 border-black bg-yellow-100 p-3 text-sm font-bold uppercase leading-relaxed">
              Maramihang kahulugan ang nakita para sa salitang ito. Pumili ng eksaktong gamit para mapunta ka sa tamang entry.
            </p>
          </div>
          <div className="border-2 border-black bg-[#e8f0ff] p-4 shadow-[4px_4px_0_0_#000]">
            <p className="text-xs font-black uppercase tracking-widest text-[#0057ff]">Tip</p>
            <p className="mt-2 text-sm font-bold uppercase leading-relaxed text-black/80">
              Pare-pareho ang baybay pero magkaiba ang bahagi ng pananalita. Hanapin ang tumutugmang translation at uri.
            </p>
          </div>
        </div>

        <ul className="mt-7 grid gap-3 md:grid-cols-2">
          {entries.map((entry, index) => (
            <li key={entry.id}>
              <Link
                href={`/salita/${entry.slug}`}
                className="group block border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-yellow-50 hover:shadow-none"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-black/70">
                    option {index + 1}
                  </span>
                  <span className={`${getPosAccent(entry.partOfSpeech)} border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider`}>
                    {entry.partOfSpeech || "hindi tukoy"}
                  </span>
                </div>

                <p className="text-xl font-black uppercase tracking-tight text-black">{entry.word}</p>
                <p className="mt-1 text-sm font-semibold text-black/80">{entry.translation}</p>

                <div className="mt-3 flex items-center justify-between border-t-2 border-black pt-2">
                  <p className="text-[11px] font-black uppercase text-black/60">/salita/{entry.slug}</p>
                  <span className="text-xs font-black uppercase tracking-wider text-[#0057ff] group-hover:text-black">
                    Buksan →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
