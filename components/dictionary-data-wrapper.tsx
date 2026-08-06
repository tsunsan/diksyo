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
    // Execute queries concurrently to slash load times
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    const [initialWords, initialSavedWordIds, discoverWordsList, dailyWord] = await Promise.all([
        searchWords(initialSearch || ""),
        getUserSavedWordIds(),
        getRandomDiscoverWords(),
        getWordOfTheDay()
    ]);

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
