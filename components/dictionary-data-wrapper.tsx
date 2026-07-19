import { searchWords, getUserSavedWordIds, getRandomDiscoverWords, getWordOfTheDay } from "@/app/actions/dictionary";
import { createClient } from "@/utils/supabase/server";
import DictionaryClient from "@/components/dictionary";

export default async function DictionaryDataWrapper({
    initialSearch = "",
    initialSaveWordId = "",
    matchedWord = null,
    showOnboarding = false
}: {
    initialSearch?: string;
    initialSaveWordId?: string;
    matchedWord?: any;
    showOnboarding?: boolean;
}) {
    // Execute queries sequentially to prevent connection pool exhaustion
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    const initialWords = await searchWords(initialSearch || "");
    const initialSavedWordIds = await getUserSavedWordIds();
    const discoverWordsList = await getRandomDiscoverWords();
    const dailyWord = await getWordOfTheDay();

    const initialDiscoverWords = matchedWord
        ? [matchedWord, ...discoverWordsList.filter((w: any) => w.id !== matchedWord.id)]
        : discoverWordsList;

    return (
        <DictionaryClient 
            initialWords={initialWords as any} 
            initialSavedWordIds={initialSavedWordIds} 
            initialDiscoverWords={initialDiscoverWords as any}
            initialWordOfTheDay={dailyWord as any}
            isAuthenticated={!!session}
            initialSearch={initialSearch}
            initialSaveWordId={initialSaveWordId}
            showOnboarding={showOnboarding}
        />
    );
}
