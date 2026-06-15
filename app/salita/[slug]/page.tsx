import { searchWords, getUserSavedWordIds, getRandomDiscoverWords, getWordOfTheDay, searchWordBySlug } from "@/app/actions/dictionary";
import DictionaryClient from "@/components/dictionary";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SalitaPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    
    // Check exact match
    const result = await searchWordBySlug(resolvedParams.slug);

    if (result.status === "SIMILAR" && (!result.data || result.data.length === 0)) {
        notFound();
    }
    
    const matchedWord = result.status === "FOUND" ? result.data : result.data[0];

    const initialWords = await searchWords("");
    const initialSavedWordIds = await getUserSavedWordIds();
    const discoverWordsList = await getRandomDiscoverWords();
    const dailyWord = await getWordOfTheDay();
    
    // Provide matchedWord at the top of discoverWords to pre-select it
    const initialDiscoverWords = matchedWord 
        ? [matchedWord, ...discoverWordsList.filter((w: any) => w.id !== matchedWord.id)]
        : discoverWordsList;

    return (
        <div className="min-h-screen bg-[#FFFBF0] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex gap-4">
                    <Link href="/" className="font-bold uppercase hover:underline border-b-2 border-transparent hover:border-black transition-all text-sm">
                        ← Back Home
                    </Link>
                </div>
                <DictionaryClient 
                    initialWords={initialWords as any} 
                    initialSavedWordIds={initialSavedWordIds} 
                    initialDiscoverWords={initialDiscoverWords as any}
                    initialWordOfTheDay={dailyWord as any}
                />
            </div>
        </div>
    );
}