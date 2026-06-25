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

export default function BaseWordDisambiguation({
  baseWord,
  entries,
}: BaseWordDisambiguationProps) {
  const displayWord = baseWord.charAt(0).toUpperCase() + baseWord.slice(1);

  return (
    <div className="min-h-screen bg-[#FFFBF0] p-4 md:p-8">
      <div className="mx-auto max-w-3xl border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] md:p-8">
        <Link
          href="/salita"
          className="inline-block border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-black uppercase tracking-tight shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
        >
          ← Bumalik sa Salita
        </Link>

        <h1 className="mt-5 text-3xl font-black uppercase italic tracking-tighter text-black md:text-4xl">
          Did you mean {displayWord}?
        </h1>
        <p className="mt-2 border-l-4 border-black bg-yellow-100 p-3 text-sm font-bold uppercase">
          Maramihang kahulugan ang nakita para sa salitang ito. Pumili ng eksaktong salita sa ibaba.
        </p>

        <ul className="mt-6 space-y-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/salita/${entry.slug}`}
                className="block border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-yellow-50 hover:shadow-none"
              >
                <p className="text-lg font-black uppercase tracking-tight">
                  {entry.word}
                  {entry.partOfSpeech ? ` (${entry.partOfSpeech})` : ""}
                </p>
                <p className="mt-1 text-sm font-semibold">{entry.translation}</p>
                <p className="mt-2 text-xs font-black uppercase text-black/60">/salita/{entry.slug}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
