import type { Metadata } from "next";
import {
    searchWords,
    getUserSavedWordIds,
    getRandomDiscoverWords,
    getWordOfTheDay,
    getWordByExactSlug,
    searchWordsByBaseWord,
} from "@/app/actions/dictionary";
import BaseWordDisambiguation from "@/components/base-word-disambiguation";
import DictionaryClient from "@/components/dictionary";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function toTitleCase(value: string) {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const slugLooksLikeBaseWord = !slug.includes("-");

    if (slugLooksLikeBaseWord) {
        const baseMatches = await searchWordsByBaseWord(slug);

        if (baseMatches.length > 1) {
            return {
                title: `Mga kahulugan ng ${toTitleCase(slug)}`,
                description: `Pumili ng tamang kahulugan para sa salitang '${slug}' mula sa maramihang entries sa Diksyo.`,
                alternates: {
                    canonical: `${siteUrl}/salita/${slug}`,
                },
            };
        }
    }

    const exactWord = await getWordByExactSlug(slug);

    if (exactWord) {
        const title = exactWord.partOfSpeech
            ? `Kahulugan ng ${toTitleCase(exactWord.word)} (${exactWord.partOfSpeech})`
            : `Kahulugan ng ${toTitleCase(exactWord.word)}`;

        const description = exactWord.partOfSpeech
            ? `Alamin ang kahulugan at paggamit ng salitang '${exactWord.word}' bilang ${exactWord.partOfSpeech}. May mga witty na halimbawa at pormal na definisyon.`
            : `Alamin ang kahulugan at paggamit ng salitang '${exactWord.word}'. May mga witty na halimbawa at pormal na definisyon.`;

        return {
            title,
            description,
            alternates: {
                canonical: `${siteUrl}/salita/${exactWord.slug}`,
            },
        };
    }

    const baseMatches = await searchWordsByBaseWord(slug);

    if (baseMatches.length > 1) {
        return {
            title: `Mga kahulugan ng ${toTitleCase(slug)}`,
            description: `Pumili ng tamang kahulugan para sa salitang '${slug}' mula sa maramihang entries sa Diksyo.`,
            alternates: {
                canonical: `${siteUrl}/salita/${slug}`,
            },
        };
    }

    return {
        title: "Salita Not Found",
        description: "Hindi natagpuan ang salitang hinahanap mo sa Diksyo.",
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function SalitaPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const slugLooksLikeBaseWord = !resolvedParams.slug.includes("-");

    if (slugLooksLikeBaseWord) {
        const baseMatches = await searchWordsByBaseWord(resolvedParams.slug);

        if (baseMatches.length > 1) {
            return (
                <BaseWordDisambiguation
                    baseWord={resolvedParams.slug}
                    entries={baseMatches.map((entry) => ({
                        id: entry.id,
                        slug: entry.slug,
                        word: entry.word,
                        partOfSpeech: entry.partOfSpeech,
                        translation: entry.translation,
                    }))}
                />
            );
        }

        if (baseMatches.length === 1 && baseMatches[0].slug !== resolvedParams.slug) {
            redirect(`/salita/${baseMatches[0].slug}`);
        }
    }

    const matchedWord = await getWordByExactSlug(resolvedParams.slug);

    if (!matchedWord) {
        const baseMatches = await searchWordsByBaseWord(resolvedParams.slug);

        if (baseMatches.length === 1) {
            redirect(`/salita/${baseMatches[0].slug}`);
        }

        if (baseMatches.length > 1) {
            return (
                <BaseWordDisambiguation
                    baseWord={resolvedParams.slug}
                    entries={baseMatches.map((entry) => ({
                        id: entry.id,
                        slug: entry.slug,
                        word: entry.word,
                        partOfSpeech: entry.partOfSpeech,
                        translation: entry.translation,
                    }))}
                />
            );
        }

        notFound();
    }

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