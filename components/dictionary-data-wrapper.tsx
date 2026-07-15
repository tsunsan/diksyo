import { searchWords, getUserSavedWordIds, getRandomDiscoverWords, getWordOfTheDay } from "@/app/actions/dictionary";
import { createClient } from "@/utils/supabase/server";
import DictionaryClient from "@/components/dictionary";

export default async function DictionaryDataWrapper({
    initialSearch = "",
    matchedWord = null,
    showOnboarding = false
}: {
    initialSearch?: string;
    matchedWord?: any;
    showOnboarding?: boolean;
}) {
    // Execute all heavy queries concurrently to eliminate waterfall delays
    const supabase = await createClient();
    const [
        initialWords,
        initialSavedWordIds,
        discoverWordsList,
        dailyWord,
        { data: { user } }
    ] = await Promise.all([
        searchWords(""),
        getUserSavedWordIds(),
        getRandomDiscoverWords(),
        getWordOfTheDay(),
        supabase.auth.getUser()
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
            isAuthenticated={!!user}
            initialSearch={initialSearch}
            showOnboarding={showOnboarding}
        />
    );
}
