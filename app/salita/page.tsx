import { searchWords, getUserSavedWordIds, getRandomDiscoverWords, getWordOfTheDay } from "@/app/actions/dictionary";
import DictionaryClient from "@/components/dictionary";
import Link from "next/link";

export default async function DictionaryHubPage() {
  const initialWords = await searchWords("");
  const initialSavedWordIds = await getUserSavedWordIds();
  const discoverWordsList = await getRandomDiscoverWords();
  const dailyWord = await getWordOfTheDay();

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
            />
        </div>
    </div>
  );
}