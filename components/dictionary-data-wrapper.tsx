import { searchWords, getUserSavedWordIds, getRandomDiscoverWords, getWordOfTheDay } from "@/app/actions/dictionary";
import { createClient } from "@/utils/supabase/server";
import DictionaryClient from "@/components/dictionary";

/**
 * Per-request dictionary shell for the signed-in /dictionary route.
 * It reads cookies, so any page that renders it cannot be cached. The public
 * /salita pages render DictionaryClient directly for that reason.
 */
export default async function DictionaryDataWrapper({
    initialSearch = "",
    initialSaveWordId = "",
    showOnboarding = false
}: {
    initialSearch?: string;
    initialSaveWordId?: string;
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

    return (
        <DictionaryClient
            initialWords={initialWords as any}
            initialSavedWordIds={initialSavedWordIds}
            initialDiscoverWords={discoverWordsList as any}
            initialWordOfTheDay={dailyWord as any}
            isAuthenticated={!!session}
            initialSearch={initialSearch}
            initialSaveWordId={initialSaveWordId}
            showOnboarding={showOnboarding}
        />
    );
}
