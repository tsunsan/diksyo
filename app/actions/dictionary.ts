"use server";

import { db } from "@/db";
import { words } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";

export async function searchWordBySlug(slug: string) {
    // 1. Try to find the exact word
    const exactMatch = await db.query.words.findFirst({
        where: eq(words.slug, slug),
        with: {
            root: true,
        },
    });

    if (exactMatch) {
        // ADD 'as const' HERE
        return { status: "FOUND" as const, data: exactMatch };
    }

    // 2. Word Not Found: Implement Fuzzy Search Logic
    const searchString = slug.length > 3 ? slug.substring(0, 3) : slug;

    const similarWords = await db.query.words.findMany({
        where: ilike(words.slug, `%${searchString}%`),
        limit: 5,
    });

    // ADD 'as const' HERE
    return { status: "SIMILAR" as const, data: similarWords };
}