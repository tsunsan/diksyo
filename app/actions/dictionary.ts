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
            throw new Error("Rate limit exceeded. Please try again later.");
        }

    const randomWord = await db.query.words.findFirst({
        orderBy: sql`RANDOM()`,
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
        return { success: false, message: "Word is already saved in your vault." };
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
    return withExponentialBackoff(async () => {
        if (!query) {
            return getCachedEmptySearch();
        }

        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
        
        let success = true;
        try {
            const result = await searchRateLimit.limit(ip);
            success = result.success;
        } catch (error) {
            console.warn("Rate limiting service unavailable, bypassing:", error);
        }
        
        if (!success) {
            throw new Error("Rate limit exceeded. Please try again later.");
        }

        const normalizedQuery = query.trim().toLowerCase();
    
    return db.query.words.findMany({
        where: or(
            ilike(words.word, `%${query}%`),
            ilike(words.translation, `%${query}%`),
            inArray(
                words.rootWordId,
                db.select({ id: words.id }).from(words).where(ilike(words.word, `%${query}%`))
            )
        ),
        with: {
            rootWord: true,
        },
        orderBy: [
            sql`case
                when lower(${words.word}) = ${normalizedQuery} then 0
                when lower(${words.slug}) like ${`${normalizedQuery}-%`} then 1
                when lower(${words.word}) like ${`${normalizedQuery}%`} then 2
                else 3
            end`,
            sql`lower(${words.word}) asc`,
            sql`lower(${words.slug}) asc`,
        ],
        limit: 50,
    });
    });
});

export async function getRandomDiscoverWords() {
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
            throw new Error("Rate limit exceeded. Please try again later.");
        }

    return db.query.words.findMany({
        orderBy: sql`RANDOM()`,
        with: { rootWord: true },
        limit: 5
    });
    });
}

export async function getWordOfTheDay() {
    return withExponentialBackoff(async () => {

    return getCachedWordOfTheDay();
    });
}

export const getWordByExactSlug = cache(async (slug: string) => {
    return withExponentialBackoff(async () => {
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
        
        let success = true;
        try {
            const result = await searchRateLimit.limit(ip);
            success = result.success;
        } catch (error) {
            console.warn("Rate limiting service unavailable, bypassing:", error);
        }
        
        if (!success) {
            throw new Error("Rate limit exceeded. Please try again later.");
        }

    return db.query.words.findFirst({
        where: eq(words.slug, slug),
        with: {
            rootWord: true,
        },
    });
    });
});

export async function searchWordsByBaseWord(baseWord: string) {
    return withExponentialBackoff(async () => {
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
        
        let success = true;
        try {
            const result = await searchRateLimit.limit(ip);
            success = result.success;
        } catch (error) {
            console.warn("Rate limiting service unavailable, bypassing:", error);
        }
        
        if (!success) {
            throw new Error("Rate limit exceeded. Please try again later.");
        }

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
}

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
    return withExponentialBackoff(async () => {
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
        
        let success = true;
        try {
            const result = await searchRateLimit.limit(ip);
            success = result.success;
        } catch (error) {
            console.warn("Rate limiting service unavailable, bypassing:", error);
        }
        
        if (!success) {
            throw new Error("Rate limit exceeded. Please try again later.");
        }

    const normalizedTerm = term.trim().toLowerCase();

    if (!normalizedTerm) {
        return [];
    }

    const exactBaseWordMatches = await db.query.words.findMany({
        where: sql`lower(${words.word}) = ${normalizedTerm}`,
        with: { rootWord: true },
        orderBy: (word, { asc }) => [asc(word.partOfSpeech), asc(word.slug)],
        limit,
    });

    const slugPrefixMatches = await db.query.words.findMany({
        where: ilike(words.slug, `${normalizedTerm}%`),
        with: { rootWord: true },
        orderBy: (word, { asc }) => [asc(word.slug)],
        limit,
    });

    const fuzzyMatches = await db.query.words.findMany({
        where: or(
            ilike(words.slug, `%${normalizedTerm}%`),
            ilike(words.word, `%${normalizedTerm}%`),
            ilike(words.translation, `%${normalizedTerm}%`)
        ),
        with: { rootWord: true },
        orderBy: (word, { asc }) => [asc(word.word), asc(word.slug)],
        limit,
    });

    const merged = [...exactBaseWordMatches, ...slugPrefixMatches, ...fuzzyMatches];
    const deduped = merged.filter((entry, index, arr) => arr.findIndex((item) => item.id === entry.id) === index);

    return deduped.slice(0, limit);
    });
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

export async function getLevenshteinSuggestions(query: string) {
    return withExponentialBackoff(async () => {
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
        
        let success = true;
        try {
            const result = await searchRateLimit.limit(ip);
            success = result.success;
        } catch (error) {
            console.warn("Rate limiting service unavailable, bypassing:", error);
        }
        
        if (!success) {
            throw new Error("Rate limit exceeded. Please try again later.");
        }

        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery || normalizedQuery.length < 3) {
            return [];
        }

        // We only consider levenshtein distance <= 3 to keep suggestions highly relevant
        // Postgres requires casting parameter bindings in function calls (::text)
        // Levenshtein throws an error if any string is > 255 chars, so we filter length first.
        const suggestions = await db.execute<any>(sql`
            SELECT 
                id, 
                word, 
                slug, 
                part_of_speech AS "partOfSpeech", 
                translation, 
                root_word_string AS "rootWordString",
                levenshtein(lower(word), ${normalizedQuery}::text) as distance
            FROM words
            WHERE length(word) < 255 AND levenshtein(lower(word), ${normalizedQuery}::text) <= 3
            ORDER BY distance ASC
            LIMIT 5
        `);

        return suggestions;
    });
}
