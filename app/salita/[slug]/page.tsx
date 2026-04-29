import { searchWordBySlug } from "@/app/actions/dictionary";
import Link from "next/link";

// 1. Update the type of params to be a Promise
export default async function SalitaPage({ params }: { params: Promise<{ slug: string }> }) {
    // 2. Await the params to unwrap them before using
    const resolvedParams = await params;

    // 3. Now pass the correctly unwrapped slug
    const result = await searchWordBySlug(resolvedParams.slug);

    if (result.status === "SIMILAR") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
                <h1 className="font-mono text-3xl font-bold mb-4">
                    Oops! We don't have "{resolvedParams.slug}" yet.
                </h1>
                <p className="mb-6">Did you mean...</p>
                <div className="flex flex-col gap-4">
                    {result.data.map((similar: any) => (
                        <Link
                            key={similar.id}
                            href={`/salita/${similar.slug}`}
                            className="p-4 border-2 border-black shadow-[4px_4px_0_0_#000] bg-yellow-400 font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0_0_#000] transition-all"
                        >
                            {similar.word}
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    const wordData = result.data;

    // LOGIC: Check if the word is its own root word to hide the link
    const isSelfRoot = wordData.root && wordData.word.toLowerCase() === wordData.root.name.toLowerCase();

    return (
        <div className="min-h-screen bg-zinc-50 p-8 flex justify-center items-center">
            {/* Neo-brutalist Word Card: Solid black border, hard shadow */}
            <div className="w-full max-w-2xl border-2 border-black shadow-[8px_8px_0_0_#000] bg-white p-8">

                {/* Header Section with Badges */}
                <div className="flex justify-between items-start mb-6">
                    <h1 className="font-mono text-5xl font-black">{wordData.word}</h1>
                    <div className="flex gap-2">
                        {wordData.partOfSpeech && (
                            <span className="bg-purple-400 border-2 border-black px-3 py-1 font-mono text-sm font-bold uppercase">
                                {wordData.partOfSpeech}
                            </span>
                        )}
                        <span className="bg-yellow-400 border-2 border-black px-3 py-1 font-mono text-sm font-bold">
                            {wordData.translation}
                        </span>
                    </div>
                </div>

                {/* Conditionally Render Root Word */}
                {wordData.root && !isSelfRoot && (
                    <div className="mb-6 font-mono text-sm">
                        <span className="text-zinc-500">Root word: </span>
                        <Link href={`/salita/${wordData.root.name.toLowerCase()}`} className="underline hover:text-yellow-600 font-bold">
                            {wordData.root.name}
                        </Link>
                    </div>
                )}

                {/* Explicit Filipino Meaning */}
                {wordData.meaningFilipino && (
                    <div className="mb-6 border-l-4 border-black pl-4">
                        <h3 className="font-mono text-sm font-bold text-zinc-500 uppercase mb-1">Formal Meaning</h3>
                        <p className="text-lg italic text-zinc-700">{wordData.meaningFilipino}</p>
                    </div>
                )}

                {/* The "Usage First" Explanation */}
                {wordData.originalExplanation && (
                    <div className="mb-8 bg-zinc-100 border-2 border-black p-4">
                        <h2 className="font-mono text-xl font-bold mb-2">The Breakdown</h2>
                        <p className="text-lg leading-relaxed">
                            {wordData.originalExplanation}
                        </p>
                    </div>
                )}

                {/* Usage Examples */}
                <div>
                    <h3 className="font-mono text-lg font-bold mb-3">In the wild:</h3>
                    <ul className="space-y-4">
                        {wordData.usageExamples?.map((example: any, i: number) => (
                            <li key={i} className="bg-zinc-50 p-4 border-2 border-black border-dashed">
                                <p className="font-bold mb-1">"{example.s}"</p>
                                <p className="text-zinc-600 italic">"{example.t}"</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}