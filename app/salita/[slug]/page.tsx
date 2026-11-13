import type { Metadata } from "next";
import {
    getWordByExactSlug,
    searchWordsByBaseWord,
    searchWords,
} from "@/app/actions/dictionary";
import BaseWordDisambiguation from "@/components/base-word-disambiguation";
import DictionaryClient from "@/components/dictionary";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { decodeSlug } from "@/lib/utils";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diksyo.app";

function toTitleCase(value: string) {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

// Each word is rendered on its first visit, then served from cache (ISR).
// This page must stay free of cookies(), headers() and searchParams: any of
// them makes it render on every request again, which is what exhausted the
// Vercel free tier once crawlers started walking the sitemap.
//
// The window is long on purpose. Hits on any one word are weeks apart, so a
// short window would have nearly every crawler hit trigger a re-render.
// A new deployment starts with an empty cache, so redeploy to publish edits
// to the words table sooner.
export const revalidate = 2592000; // 30 days

// Without this, `revalidate` is ignored for a dynamic segment.
export async function generateStaticParams() {
    return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const slug = decodeSlug((await params).slug);
    const slugLooksLikeBaseWord = !slug.includes("-");

    if (slugLooksLikeBaseWord) {
        const baseMatches = await searchWordsByBaseWord(slug);

        if (baseMatches.length > 1) {
            const title = `Mga kahulugan ng ${toTitleCase(slug)}`;
            const description = `Pumili ng tamang kahulugan para sa salitang '${slug}' mula sa maramihang entries sa Diksyo.`;
            const url = `${siteUrl}/salita/${encodeURIComponent(slug)}`;
            const ogImageUrl = `${url}/opengraph-image`;

            return {
                title,
                description,
                alternates: {
                    canonical: url,
                },
                openGraph: {
                    title: `${title} | Diksyo`,
                    description,
                    url,
                    siteName: "Diksyo",
                    locale: "en_PH",
                    type: "article",
                    images: [
                        {
                            url: ogImageUrl,
                            width: 1200,
                            height: 630,
                            alt: title,
                        },
                    ],
                },
                twitter: {
                    card: "summary_large_image",
                    title: `${title} | Diksyo`,
                    description,
                    images: [ogImageUrl],
                },
            };
        }
    }

    const exactWord = await getWordByExactSlug(slug);

    if (exactWord) {
        const title = exactWord.partOfSpeech
            ? `Kahulugan ng ${toTitleCase(exactWord.word)} (${exactWord.partOfSpeech})`
            : `Kahulugan ng ${toTitleCase(exactWord.word)}`;

        const description = exactWord.translation
            ? `Definition: "${exactWord.translation}". Alamin ang kahulugan at paggamit ng salitang '${exactWord.word}' sa Diksyo.`
            : exactWord.partOfSpeech
            ? `Alamin ang kahulugan at paggamit ng salitang '${exactWord.word}' bilang ${exactWord.partOfSpeech}. May mga witty na halimbawa at pormal na definisyon.`
            : `Alamin ang kahulugan at paggamit ng salitang '${exactWord.word}'. May mga witty na halimbawa at pormal na definisyon.`;

        const url = `${siteUrl}/salita/${exactWord.slug}`;
        const ogImageUrl = `${url}/opengraph-image`;

        return {
            title,
            description,
            alternates: {
                canonical: url,
            },
            openGraph: {
                title: `${title} | Diksyo`,
                description,
                url,
                siteName: "Diksyo",
                locale: "en_PH",
                type: "article",
                images: [
                    {
                        url: ogImageUrl,
                        width: 1200,
                        height: 630,
                        alt: title,
                    },
                ],
            },
            twitter: {
                card: "summary_large_image",
                title: `${title} | Diksyo`,
                description,
                images: [ogImageUrl],
            },
        };
    }

    const baseMatches = await searchWordsByBaseWord(slug);

    if (baseMatches.length > 1) {
        const title = `Mga kahulugan ng ${toTitleCase(slug)}`;
        const description = `Pumili ng tamang kahulugan para sa salitang '${slug}' mula sa maramihang entries sa Diksyo.`;
        const url = `${siteUrl}/salita/${encodeURIComponent(slug)}`;
        const ogImageUrl = `${url}/opengraph-image`;

        return {
            title,
            description,
            alternates: {
                canonical: url,
            },
            openGraph: {
                title: `${title} | Diksyo`,
                description,
                url,
                siteName: "Diksyo",
                locale: "en_PH",
                type: "article",
                images: [
                    {
                        url: ogImageUrl,
                        width: 1200,
                        height: 630,
                        alt: title,
                    },
                ],
            },
            twitter: {
                card: "summary_large_image",
                title: `${title} | Diksyo`,
                description,
                images: [ogImageUrl],
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
    const slug = decodeSlug((await params).slug);
    const slugLooksLikeBaseWord = !slug.includes("-");

    if (slugLooksLikeBaseWord) {
        const baseMatches = await searchWordsByBaseWord(slug);

        if (baseMatches.length > 1) {
            return (
                <BaseWordDisambiguation
                    baseWord={slug}
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

        if (baseMatches.length === 1 && baseMatches[0].slug !== slug) {
            redirect(`/salita/${baseMatches[0].slug}`);
        }
    }

    const matchedWord = await getWordByExactSlug(slug);

    if (!matchedWord) {
        const baseMatches = await searchWordsByBaseWord(slug);

        if (baseMatches.length === 1) {
            redirect(`/salita/${baseMatches[0].slug}`);
        }

        if (baseMatches.length > 1) {
            return (
                <BaseWordDisambiguation
                    baseWord={slug}
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
    }

    // A matched word needs no result list; an unmatched slug shows its search results.
    const initialWords = matchedWord ? [] : await searchWords(slug);

    // Nothing matches at all: answer 404 so crawlers drop made-up URLs.
    // not-found.tsx still shows the search box with the query and suggestions.
    if (!matchedWord && initialWords.length === 0) {
        notFound();
    }

    const jsonLd = matchedWord ? {
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        "name": matchedWord.word,
        "description": matchedWord.translation || `Kahulugan ng ${matchedWord.word}`,
        "inDefinedTermSet": siteUrl
    } : null;

    return (
        <div className="min-h-screen bg-[#FFFBF0] p-4 md:p-8">
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex gap-4">
                    <Link href="/" className="inline-flex items-center gap-1 border-2 border-black bg-yellow-300 px-3 py-1.5 text-xs font-black uppercase tracking-tight shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                        ← Back Home
                    </Link>
                </div>
                <DictionaryClient
                    initialWords={initialWords}
                    initialDiscoverWords={matchedWord ? [matchedWord] : []}
                    initialSearch={matchedWord ? "" : slug}
                    resolveSessionOnClient
                    loadDailyWordsOnClient
                />
            </div>
        </div>
    );
}