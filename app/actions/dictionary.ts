"use server";

import { db } from "@/db";
import { words } from "@/db/schema";
import { eq, ilike, sql } from "drizzle-orm";

export async function searchWordBySlug(slug: string) {
    const exactMatch = await db.query.words.findFirst({
        where: eq(words.slug, slug),
        with: {
            root: true,
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