"use server";

import { db } from "@/db";
import { userProgress, words } from "@/db/schema";
import { and, eq, ilike, sql, or, inArray } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { withExponentialBackoff } from "@/lib/db-utils";
import { searchRateLimit, mutationRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { cache } from "react";

const getCachedEmptySearch = unstable_cache(
    async () => {
        return db.query.words.findMany({ 
            with: { rootWord: true },
            limit: 50 
        });
    },
    ['empty-search'],
    { revalidate: 3600, tags: ['dictionary'] }
);

const getCachedWordOfTheDay = unstable_cache(
    async () => {
        const countResult = await db.select({ count: sql<number>`count(*)::int` }).from(words);
        const count = countResult[0]?.count ?? 0;
        
        if (count === 0) return null;

        const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        const stableIndex = daysSinceEpoch % count;
        
        return db.query.words.findFirst({
            orderBy: (words, { asc }) => [asc(words.word)],
            offset: stableIndex,
            with: { rootWord: true }
        });
    },
    ['word-of-the-day'],
    { revalidate: 86400, tags: ['dictionary'] }
);

const getCachedDiscoverWords = unstable_cache(
    async () => {
        const countResult = await db.select({ count: sql<number>`count(*)::int` }).from(words);
        const count = countResult[0]?.count ?? 0;

        if (count === 0) return [];

        const maxOffset = Math.max(0, count - 5);
        const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        // Use a multiplier (e.g., 7) so it doesn't overlap exactly with the word of the day index
        const stableIndex = (daysSinceEpoch * 7) % Math.max(1, maxOffset);

        return db.query.words.findMany({
            orderBy: (words, { asc }) => [asc(words.word)],
            offset: stableIndex,
            with: { rootWord: true },
            limit: 5
        });
    },
    ['discover-words'],
    { revalidate: 86400, tags: ['dictionary'] }
);

export async function searchWordBySlug(slug: string) {
    return withExponentialBackoff(async () => {

    const exactMatch = await db.query.words.findFirst({
        where: eq(words.slug, slug),
        with: {
            rootWord: true,
        },
    });
    if (exactMatch) {
        return { status: "FOUND" as const, data: exactMatch };
    }
    const searchString = slug.length > 3 ? slug.substring(0, 3) : slug;
    const similarWords = await db.query.words.findMany({
        where: ilike(words.slug, `%${searchString}%`),
        limit: 5,
    });
    return { status: "SIMILAR" as const, data: similarWords };
    });
}

export async function getRandomWordSlug() {
    return withExponentialBackoff(async () => {
        const countResult = await db.select({ count: sql<number>`count(*)::int` }).from(words);
        const count = countResult[0]?.count ?? 0;
        
        if (count === 0) return null;

        const randomOffset = Math.floor(Math.random() * count);
        const randomWord = await db.query.words.findFirst({
            orderBy: (words, { asc }) => [asc(words.word)],
            offset: randomOffset,
            columns: {
                slug: true,
            }
        });
        return randomWord?.slug || null;
    });
}

export async function saveWordToVault(wordId: string) {
    return withExponentialBackoff(async () => {
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
        
        let success = true;
        try {
            const result = await mutationRateLimit.limit(ip);
            success = result.success;
        } catch (error) {
            console.warn("Rate limiting service unavailable, bypassing:", error);
        }
        
        if (!success) {
            return { error: "Rate limit exceeded. Please try again later." };
        }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized: You must be logged in to save words." };
    }

    const existingEntry = await db.query.userProgress.findFirst({
        where: and(
            eq(userProgress.userId, user.id),
            eq(userProgress.wordId, wordId)
        ),
    });

    if (existingEntry) {
        if (existingEntry.isArchived) {
            // Restore from soft-delete
            await db.update(userProgress)
                .set({ isArchived: false })
                .where(eq(userProgress.id, existingEntry.id));
            return { success: true, message: "Word successfully restored to vault." };
        }
        return { success: true, alreadySaved: true, message: "Word is already saved in your vault." };
    }

    await db.insert(userProgress).values({
        userId: user.id,
        wordId: wordId,
        stability: 0,
        difficulty: 0,
        mastery: 0,
        isArchived: false,
    });

    return { success: true, message: "Word successfully saved to vault." };
    });
}

export async function removeWordFromVault(wordId: string) {
    return withExponentialBackoff(async () => {
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
        
        let success = true;
        try {
            const result = await mutationRateLimit.limit(ip);
            success = result.success;
        } catch (error) {
            console.warn("Rate limiting service unavailable, bypassing:", error);
        }
        
        if (!success) {
            return { error: "Rate limit exceeded. Please try again later." };
        }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized: You must be logged in to remove words." };
    }

    await db.update(userProgress)
        .set({ isArchived: true })
        .where(
            and(
                eq(userProgress.userId, user.id),
                eq(userProgress.wordId, wordId)
            )
        );

    return { success: true, message: "Word successfully removed from vault." };
    });
}

export async function getUserSavedWordIds() {
    return withExponentialBackoff(async () => {

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const saved = await db.query.userProgress.findMany({
        where: and(
            eq(userProgress.userId, user.id),
            eq(userProgress.isArchived, false)
        ),
        columns: { wordId: true }
    });
    return saved.map(s => s.wordId).filter((id): id is string => id !== null);
    });
}

export const searchWords = cache(async (query: string) => {
    if (!query) {
        return getCachedEmptySearch();
    }

    const normalizedQuery = query.trim().toLowerCase();

    const getCachedSearch = unstable_cache(
        async (q: string, normalizedQ: string) => {
            return withExponentialBackoff(async () => {
                return db.query.words.findMany({
                    where: or(
                        ilike(words.word, `%${q}%`),
                        ilike(words.translation, `%${q}%`),
                        inArray(
                            words.rootWordId,
                            db.select({ id: words.id }).from(words).where(ilike(words.word, `%${q}%`))
                        )
                    ),
                    with: {
                        rootWord: true,
                    },
                    orderBy: [
                        sql`case
                            when lower(${words.word}) = ${normalizedQ} then 0
                            when lower(${words.translation}) = ${normalizedQ} then 1
                            when lower(${words.slug}) like ${`${normalizedQ}-%`} then 2
                            when lower(${words.word}) like ${`${normalizedQ}%`} then 3
                            when ${words.translation} ~* ${`\\y${normalizedQ}\\y`} then 4
                            else 5
                        end`,
                        sql`lower(${words.word}) asc`,
                        sql`lower(${words.slug}) asc`,
                    ],
                    limit: 50,
                });
            });
        },
        [`search-words-${normalizedQuery}`],
        { revalidate: 300, tags: ['dictionary'] }
    );

    return getCachedSearch(query, normalizedQuery);
});

export async function getRandomDiscoverWords() {
    return withExponentialBackoff(async () => {
        return getCachedDiscoverWords();
    });
}

export async function getWordOfTheDay() {
    return withExponentialBackoff(async () => {

    return getCachedWordOfTheDay();
    });
}

export const getWordByExactSlug = cache(async (slug: string) => {
    return withExponentialBackoff(async () => {


    return db.query.words.findFirst({
        where: eq(words.slug, slug),
        with: {
            rootWord: true,
        },
    });
    });
});

export const searchWordsByBaseWord = cache(async (baseWord: string) => {
    return withExponentialBackoff(async () => {


    const normalizedWord = baseWord.trim().toLowerCase();

    if (!normalizedWord) {
        return [];
    }

    return db.query.words.findMany({
        where: sql`lower(${words.word}) = ${normalizedWord}`,
        with: {
            rootWord: true,
        },
        orderBy: (word, { asc }) => [asc(word.partOfSpeech), asc(word.slug)],
    });
    });
});

export async function getAllDictionaryEntriesForSitemap() {
    return withExponentialBackoff(async () => {

    return db.query.words.findMany({
        columns: {
            slug: true,
            word: true,
        },
        orderBy: (word, { asc }) => [asc(word.word), asc(word.slug)],
    });
    });
}

export async function searchWordSuggestions(term: string, limit = 8) {
    const normalizedTerm = term.trim().toLowerCase();

    if (!normalizedTerm) {
        return [];
    }

    const getCachedSuggestions = unstable_cache(
        async (normalized: string, limitCount: number) => {
            return withExponentialBackoff(async () => {
                const rawMatches = await db.query.words.findMany({
                    where: or(
                        ilike(words.slug, `%${normalized}%`),
                        ilike(words.word, `%${normalized}%`),
                        ilike(words.translation, `%${normalized}%`)
                    ),
                    with: { rootWord: true },
                    orderBy: [
                        sql`case
                            when lower(${words.word}) = ${normalized} then 0
                            when lower(${words.translation}) = ${normalized} then 1
                            when lower(${words.slug}) like ${`${normalized}-%`} then 2
                            when lower(${words.word}) like ${`${normalized}%`} then 3
                            when ${words.translation} ~* ${`\\y${normalized}\\y`} then 4
                            else 5
                        end`,
                        sql`lower(${words.word}) asc`,
                    ],
                    limit: 30,
                });

                const sorted = rawMatches.sort((a, b) => {
                    const aWordExact = a.word.toLowerCase() === normalized;
                    const bWordExact = b.word.toLowerCase() === normalized;
                    if (aWordExact && !bWordExact) return -1;
                    if (!aWordExact && bWordExact) return 1;

                    const aPrefix = a.slug?.startsWith(normalized) || a.word.toLowerCase().startsWith(normalized);
                    const bPrefix = b.slug?.startsWith(normalized) || b.word.toLowerCase().startsWith(normalized);
                    if (aPrefix && !bPrefix) return -1;
                    if (!aPrefix && bPrefix) return 1;

                    return a.word.localeCompare(b.word);
                });

                const deduped = sorted.filter((entry, index, arr) => arr.findIndex((item) => item.id === entry.id) === index);
                return deduped.slice(0, limitCount);
            });
        },
        [`search-suggestions-${normalizedTerm}-${limit}`],
        { revalidate: 300, tags: ['dictionary'] }
    );

    return getCachedSuggestions(normalizedTerm, limit);
}

export async function getLandingPageStats() {
    return withExponentialBackoff(async () => {
        const wordCountResult = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(words);

        const rootCountResult = await db
            .select({ count: sql<number>`count(distinct ${words.rootWordId})::int` })
            .from(words);

        return {
            wordCount: wordCountResult[0]?.count ?? 0,
            rootCount: rootCountResult[0]?.count ?? 0,
        };
    });
}

export async function getRootWordFamily(wordId: string) {
    return withExponentialBackoff(async () => {
        // 1. Fetch the word itself with its root
        const targetWord = await db.query.words.findFirst({
            where: eq(words.id, wordId),
            with: { rootWord: true },
        });

        if (!targetWord) return null;

        // 2. Determine the actual root word ID
        const isRoot = !targetWord.rootWordId && !targetWord.rootWordString;
        const rootId = isRoot ? targetWord.id : targetWord.rootWordId;

        if (!rootId) {
            // Word has rootWordString but no rootWordId link — can't build a tree
            return null;
        }

        // 3. Fetch the root word with ALL derived words
        const rootWord = isRoot
            ? targetWord
            : await db.query.words.findFirst({
                where: eq(words.id, rootId),
            });

        if (!rootWord) return null;

        // 4. Fetch all derived words that share this root
        const derivedWords = await db.query.words.findMany({
            where: eq(words.rootWordId, rootId),
            orderBy: (w, { asc }) => [asc(w.word)],
        });

        return {
            rootWord,
            derivedWords,
            currentWordId: wordId,
        };
    });
}

export async function getLevenshteinSuggestions(query: string) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery || normalizedQuery.length < 3) {
        return [];
    }

    const getCachedLevenshtein = unstable_cache(
        async (normalized: string) => {
            return withExponentialBackoff(async () => {
                const suggestions = await db.execute<any>(sql`
                    SELECT 
                        id, 
                        word, 
                        slug, 
                        part_of_speech AS "partOfSpeech", 
                        translation, 
                        root_word_string AS "rootWordString",
                        levenshtein(lower(word), ${normalized}::text) as distance
                    FROM words
                    WHERE length(word) < 255 AND levenshtein(lower(word), ${normalized}::text) <= 3
                    ORDER BY distance ASC
                    LIMIT 5
                `);
                return suggestions;
            });
        },
        [`search-levenshtein-${normalizedQuery}`],
        { revalidate: 300, tags: ['dictionary'] }
    );

    return getCachedLevenshtein(normalizedQuery);
}
