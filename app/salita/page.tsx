import { searchWords, getUserSavedWordIds, getRandomDiscoverWords, getWordOfTheDay } from "@/app/actions/dictionary";
import DictionaryClient from "@/components/dictionary";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse the Tagalog Dictionary",
  description: "Explore the full Diksyo Tagalog dictionary. Search for translations, discover new Tagalog words, and improve your Filipino vocabulary.",
};

export default async function DictionaryHubPage() {
  const initialWords = await searchWords("");
  const initialSavedWordIds = await getUserSavedWordIds();
  const discoverWordsList = await getRandomDiscoverWords();
  const dailyWord = await getWordOfTheDay();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#FFFBF0] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <Link href="/" className="font-bold uppercase hover:underline border-b-2 border-transparent hover:border-black transition-all text-sm">
                    ← Back Home
                </Link>
            </div>
            <DictionaryClient 
                initialWords={initialWords as any} 
                initialSavedWordIds={initialSavedWordIds} 
                initialDiscoverWords={discoverWordsList as any}
                initialWordOfTheDay={dailyWord as any}
                isAuthenticated={!!user}
            />
        </div>
    </div>
  );
}