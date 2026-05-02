// app/actions/lists.ts
"use server";

import { db } from "@/db";
import { lists } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function getFeaturedPacks() {
    return await db.query.lists.findMany({
        where: eq(lists.isSystem, true), // Only grab official lists!
        with: {
            words: {
                with: {
                    word: true
                }
            }
        }
    });
}