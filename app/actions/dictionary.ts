"use server";

import { db } from "@/db";
import { userProgress, words } from "@/db/schema";
import { and, eq, ilike, sql, or, inArray } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";

export async function searchWordBySlug(slug: string) {
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
}

export async function getRandomWordSlug() {
    const randomWord = await db.query.words.findFirst({
        orderBy: sql`RANDOM()`,
        columns: {
            slug: true,
        }
    });
    return randomWord?.slug || null;
}

export async function saveWordToVault(wordId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized: You must be logged in to save words." };
    }

    // Check if the word is already saved in the user's progress
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

    // Insert user progress entry starting as 'unseen' or 'saved'
    await db.insert(userProgress).values({
        userId: user.id,
        wordId: wordId,
        stability: 0,
        difficulty: 0,
        mastery: 0,
        isArchived: false,
    });

    return { success: true, message: "Word successfully saved to vault." };
}

export async function removeWordFromVault(wordId: string) {
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
}

export async function getUserSavedWordIds() {
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
}

export async function searchWords(query: string) {
    if (!query) {
        return db.query.words.findMany({ 
            with: { rootWord: true },
            limit: 50 
        });
    }
    
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
        limit: 50,
    });
}