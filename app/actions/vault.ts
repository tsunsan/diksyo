"use server";

import { db } from "@/db";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";

export async function getVaultWords() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    try {
        const vaultEntries = await db.query.userProgress.findMany({
            where: eq(userProgress.userId, user.id),
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
