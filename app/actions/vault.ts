"use server";

import { db } from "@/db";
import { userProgress, words } from "@/db/schema";
import { eq, and, sql, lt, notInArray } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { withExponentialBackoff } from "@/lib/db-utils";


export async function getVaultWords(excludeMastered: boolean = false) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    try {
        const vaultEntries = await withExponentialBackoff(() => db.query.userProgress.findMany({
            where: and(
                eq(userProgress.userId, user.id), 
                eq(userProgress.isArchived, false),
                excludeMastered ? lt(userProgress.stability, 50) : undefined
            ),
            with: {
                word: true,
            },
            orderBy: (progress, { desc }) => [desc(progress.nextReview)],
        }));

        return { success: true, data: vaultEntries };
    } catch (error) {
        console.error("Error fetching vault words:", error);
        return { success: false, error: "Failed to fetch vault words" };
    }
}

export async function addWordToVault(wordId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        
        const existing = await withExponentialBackoff(() => db.query.userProgress.findFirst({
            where: and(eq(userProgress.userId, user.id), eq(userProgress.wordId, wordId)),
        }));

        if (existing) {
            if (existing.isArchived) {
                await withExponentialBackoff(() => db.update(userProgress)
                    .set({ isArchived: false, nextReview: new Date() })
                    .where(eq(userProgress.id, existing.id)));
                revalidatePath("/vault");
                return { success: true };
            }
            return { success: false, error: "Word is already in your vault" };
        }

        await withExponentialBackoff(() => db.insert(userProgress).values({
            userId: user.id,
            wordId: wordId,
            mastery: 0,
            stability: 0,
            difficulty: 0,
        }));

        revalidatePath("/vault");
        return { success: true };
    } catch (error) {
        console.error("Error adding word to vault:", error);
        return { success: false, error: "Failed to add word" };
    }
}

export async function getVaultWordCount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, count: 0, error: "Unauthorized" };
    }

    try {
        const result = await withExponentialBackoff(() => db
            .select({ count: sql<number>`count(*)::int` })
            .from(userProgress)
            .where(and(eq(userProgress.userId, user.id), eq(userProgress.isArchived, false))));

        return { success: true, count: result[0]?.count ?? 0 };
    } catch (error) {
        console.error("Error counting vault words:", error);
        return { success: false, count: 0, error: "Failed to count vault words" };
    }
}

export async function seedStarterPack() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Check if user already has words
        const allExistingWords = await withExponentialBackoff(() => db.query.userProgress.findMany({
            where: eq(userProgress.userId, user.id),
            columns: { wordId: true, isArchived: true }
        }));
        
        const activeWordCount = allExistingWords.filter(w => !w.isArchived).length;
        const allExistingWordIds = allExistingWords.map(w => w.wordId).filter(Boolean) as string[];

        if (activeWordCount >= 10) {
            return { success: false, error: "You already have enough words in your vault" };
        }

        // Get 10 random words from the dictionary, excluding existing ones
        const randomWords = await withExponentialBackoff(() => db.query.words.findMany({
            where: allExistingWordIds.length > 0 ? notInArray(words.id, allExistingWordIds) : undefined,
            orderBy: sql`RANDOM()`,
            limit: 10,
            columns: { id: true },
        }));

        if (randomWords.length === 0) {
            return { success: false, error: "No words available in the dictionary" };
        }

        // Insert them as fresh vault entries
        await withExponentialBackoff(() => db.insert(userProgress).values(
            randomWords.map((w) => ({
                userId: user.id,
                wordId: w.id,
                stability: 0,
                difficulty: 0,
                mastery: 0,
                isArchived: false,
            }))
        ));

        revalidatePath("/vault");
        revalidatePath("/quiz");
        return { success: true, count: randomWords.length };
    } catch (error) {
        console.error("Error seeding starter pack:", error);
        return { success: false, error: "Failed to seed starter pack" };
    }
}
