import { searchWords, getUserSavedWordIds, getRandomDiscoverWords, getWordOfTheDay } from "@/app/actions/dictionary";
import DictionaryClient from "@/components/dictionary";

export default async function DictionaryPage() {
  const initialWords = await searchWords("");
  const initialSavedWordIds = await getUserSavedWordIds();
  const discoverWordsList = await getRandomDiscoverWords();
  const dailyWord = await getWordOfTheDay();

  return <DictionaryClient 
            initialWords={initialWords as any} 
            initialSavedWordIds={initialSavedWordIds} 
            initialDiscoverWords={discoverWordsList as any}
            initialWordOfTheDay={dailyWord as any}
        />;
}
