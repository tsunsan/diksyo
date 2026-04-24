import { db } from "@/db";

export default async function LexiconPage() {
    // Fetch all roots and include their derived words
    const allRoots = await db.query.roots.findMany({
        with: {
            words: true,
        },
    });

    return (
        <main className="min-h-screen bg-zinc-50 p-8 font-mono">
            <h1 className="text-5xl font-black uppercase mb-12 tracking-tighter italic">
                Diksyo Lexicon
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {allRoots.map((root) => (
                    <div
                        key={root.id}
                        className="bg-white border-4 border-black p-6 rounded-2xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col"
                    >
                        {/* Root Section */}
                        <div className="mb-6">
              <span className="text-[10px] font-black uppercase bg-yellow-400 px-2 py-1 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Root / Ugat
              </span>
                            <h2 className="text-4xl font-black mt-3 uppercase tracking-tight">{root.name}</h2>
                            <p className="text-zinc-500 italic text-sm mt-1 border-l-4 border-zinc-200 pl-3">
                                {root.definition}
                            </p>
                        </div>

                        {/* Derived Words List */}
                        <div className="space-y-6 pt-6 border-t-4 border-black">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                                Derived Words
                            </h3>

                            {root.words.map((word) => (
                                <div
                                    key={word.id}
                                    className="p-4 bg-zinc-50 border-2 border-black rounded-xl hover:bg-yellow-50 transition-colors group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-black text-xl leading-none group-hover:underline uppercase italic">
                                            {word.word}
                                        </p>
                                        {/* Mastery Dot Placeholder */}
                                        <div className="w-3 h-3 bg-green-400 border-2 border-black rounded-full" title="Mastery Level" />
                                    </div>

                                    {/* Kahulugan (Tagalog Meaning) */}
                                    <div className="mt-3 mb-2">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Kahulugan:</p>
                                        <p className="text-md font-bold leading-tight">
                                            {word.meaningFilipino || "Wala pang kahulugan."}
                                        </p>
                                    </div>

                                    {/* English Translation */}
                                    <div className="pt-2 border-t-2 border-dashed border-zinc-300">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Translation:</p>
                                        <p className="text-sm italic text-zinc-600">
                                            {word.translation}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}