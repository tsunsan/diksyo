import Link from "next/link";
import DictionaryClient from "@/components/dictionary";
import { searchWords, getRandomDiscoverWords, getWordOfTheDay } from "@/app/actions/dictionary";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse the Tagalog Dictionary",
  description: "Explore the full Diksyo Tagalog dictionary. Search for translations, discover new Tagalog words, and improve your Filipino vocabulary.",
};

// Cached and re-rendered at most hourly, so the daily words stay current.
// Keep cookies() and headers() out of this page; the client looks up the session.
export const revalidate = 3600;

export default async function DictionaryHubPage() {
  const [initialWords, discoverWords, dailyWord] = await Promise.all([
    searchWords(""),
    getRandomDiscoverWords(),
    getWordOfTheDay(),
  ]);

  return (
    <div className="min-h-screen bg-[#FFFBF0] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex gap-4">
                <Link href="/" className="inline-flex items-center gap-1 border-2 border-black bg-yellow-300 px-3 py-1.5 text-xs font-black uppercase tracking-tight shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                    ← Back Home
                </Link>
            </div>
            <DictionaryClient
                initialWords={initialWords}
                initialDiscoverWords={discoverWords}
                initialWordOfTheDay={dailyWord}
                resolveSessionOnClient
            />
        </div>
    </div>
  );
}
