import SearchBar from "@/components/search-bar";
import { BookOpen, Flame } from "lucide-react";
import Link from "next/link";

export default function DictionaryHubPage() {
    return (
        <div className="min-h-screen bg-zinc-50 p-4 md:p-8 flex flex-col items-center">

            {/* Header Area */}
            <div className="w-full max-w-4xl mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-400 p-3 border-4 border-black shadow-[4px_4px_0_0_#000]">
                        <BookOpen className="h-8 w-8 text-black" />
                    </div>
                    <h1 className="font-mono text-4xl md:text-5xl font-black uppercase tracking-tight">
                        Diksyo Hub
                    </h1>
                </div>
                <Link href="/" className="font-bold uppercase hover:underline border-b-2 border-transparent hover:border-black transition-all">
                    ← Back Home
                </Link>
            </div>

            {/* Main Search Section */}
            <div className="w-full max-w-4xl border-4 border-black shadow-[8px_8px_0_0_#000] bg-cyan-300 p-6 md:p-12 flex flex-col items-center text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black uppercase mb-4">
                    Explore the Lexicon
                </h2>
                <p className="text-lg md:text-xl font-bold mb-8 max-w-2xl">
                    Search for any Filipino word to uncover its meaning, roots, and usage. Or roll the dice to discover something new.
                </p>

                <div className="w-full max-w-2xl">
                    <SearchBar />
                </div>
            </div>

            {/* Placeholder for Quick Links / Popular Words */}
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
                <div className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-white p-6">
                    <div className="flex items-center gap-2 mb-4 border-b-4 border-black pb-2">
                        <Flame className="h-6 w-6 text-red-500 fill-red-500" />
                        <h3 className="text-xl font-black uppercase">Trending Words</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {/* You can map actual database data here later */}
                        <Link href="/salita/kain" className="bg-gray-100 border-2 border-black px-3 py-1 font-bold hover:bg-yellow-400 transition-colors">Kain</Link>
                        <Link href="/salita/aral" className="bg-gray-100 border-2 border-black px-3 py-1 font-bold hover:bg-yellow-400 transition-colors">Aral</Link>
                        <Link href="/salita/lakad" className="bg-gray-100 border-2 border-black px-3 py-1 font-bold hover:bg-yellow-400 transition-colors">Lakad</Link>
                    </div>
                </div>

                <div className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-purple-400 p-6">
                    <h3 className="text-xl font-black uppercase mb-2 text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Can't find a word?</h3>
                    <p className="font-bold mb-4">Our dictionary is expanding every day. Save words to your vault to study them later!</p>
                    <Link href="/lists" className="inline-block bg-white border-4 border-black px-4 py-2 font-black uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_0_#000] transition-all">
                        Go to Vault
                    </Link>
                </div>
            </div>
        </div>
    );
}