import { searchWords, getUserSavedWordIds, getRandomDiscoverWords, getWordOfTheDay } from "@/app/actions/dictionary";
import DictionaryClient from "@/components/dictionary";
import { createClient } from "@/utils/supabase/server";

export default async function DictionaryPage() {
  const initialWords = await searchWords("");
  const initialSavedWordIds = await getUserSavedWordIds();
  const discoverWordsList = await getRandomDiscoverWords();
  const dailyWord = await getWordOfTheDay();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <DictionaryClient 
            initialWords={initialWords as any} 
            initialSavedWordIds={initialSavedWordIds} 
            initialDiscoverWords={discoverWordsList as any}
            initialWordOfTheDay={dailyWord as any}
            isAuthenticated={!!user}
        />;
}
