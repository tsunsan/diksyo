import type { Metadata } from "next";
import {
    getWordByExactSlug,
    searchWordsByBaseWord,
    getAllDictionaryEntriesForSitemap,
} from "@/app/actions/dictionary";
import BaseWordDisambiguation from "@/components/base-word-disambiguation";
import DictionaryDataWrapper from "@/components/dictionary-data-wrapper";
import { DictionarySkeleton } from "@/components/dictionary-skeleton";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diksyo.app";

function toTitleCase(value: string) {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const slugLooksLikeBaseWord = !slug.includes("-");

    if (slugLooksLikeBaseWord) {
        const baseMatches = await searchWordsByBaseWord(slug);

        if (baseMatches.length > 1) {
            const title = `Mga kahulugan ng ${toTitleCase(slug)}`;
            const description = `Pumili ng tamang kahulugan para sa salitang '${slug}' mula sa maramihang entries sa Diksyo.`;
            const url = `${siteUrl}/salita/${slug}`;
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
        const url = `${siteUrl}/salita/${slug}`;
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

        // Instead of notFound(), we let it fall through to render the DictionaryClient
        // with the query pre-filled so the user can refine their search.
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
                <Suspense fallback={<DictionarySkeleton />}>
                    <DictionaryDataWrapper 
                        initialSearch={!matchedWord ? resolvedParams.slug : undefined}
                        matchedWord={matchedWord}
                    />
                </Suspense>
            </div>
        </div>
    );
}