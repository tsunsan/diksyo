"use server";

import { db } from "@/db";
import { userProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getVaultWords() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    try {
        const vaultEntries = await db.query.userProgress.findMany({
            where: and(eq(userProgress.userId, user.id), eq(userProgress.isArchived, false)),
            with: {
                word: true,
            },
            orderBy: (progress, { desc }) => [desc(progress.nextReview)],
        });

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
        
        const existing = await db.query.userProgress.findFirst({
            where: and(eq(userProgress.userId, user.id), eq(userProgress.wordId, wordId)),
        });

        if (existing) {
            if (existing.isArchived) {
                await db.update(userProgress)
                    .set({ isArchived: false, nextReview: new Date() })
                    .where(eq(userProgress.id, existing.id));
                revalidatePath("/vault");
                return { success: true };
            }
            return { success: false, error: "Word is already in your vault" };
        }

        await db.insert(userProgress).values({
            userId: user.id,
            wordId: wordId,
            mastery: 0,
            stability: 0,
            difficulty: 0,
        });

        revalidatePath("/vault");
        return { success: true };
    } catch (error) {
        console.error("Error adding word to vault:", error);
        return { success: false, error: "Failed to add word" };
    }
}
