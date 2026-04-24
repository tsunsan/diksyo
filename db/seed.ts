import { db } from "./index";
import {roots, userProgress, words} from "./schema";

async function main() {
    console.log("🚀 Starting updated seed with Kahulugan...");

    // 1. DELETE EXISTING DATA (Order matters because of Foreign Keys!)
    console.log("🧹 Cleaning out old data...");
    await db.delete(userProgress); // Delete child records first
    await db.delete(words);        // Then words
    await db.delete(roots);        // Finally roots

    // 1. Define common Roots (Ugat)
    const rootData = [
        { name: "kain", definition: "to eat" },
        { name: "aral", definition: "to study" },
        { name: "lakad", definition: "to walk" },
    ];

    console.log("🌱 Planting roots...");
    const insertedRoots = await db.insert(roots).values(rootData).returning();

    // 2. Map Roots to Words with native meanings
    const wordsToInsert = [
        {
            rootId: insertedRoots.find(r => r.name === "kain")?.id,
            word: "kumain",
            slug: "kumain",
            translation: "to eat / ate",
            meaningFilipino: "ang kilos ng pagpasok ng pagkain sa bibig",
            usageExamples: [{ s: "Kumain ako ng balut.", t: "I ate balut." }],
        },
        {
            rootId: insertedRoots.find(r => r.name === "aral")?.id,
            word: "mag-aral",
            slug: "mag-aral",
            translation: "to study",
            meaningFilipino: "ang pagsisikap na matuto ng isang bagay",
            usageExamples: [{ s: "Kailangan mong mag-aral.", t: "You need to study." }],
        },
        {
            rootId: insertedRoots.find(r => r.name === "lakad")?.id,
            word: "lumakad",
            slug: "lumakad",
            translation: "to walk / walked",
            meaningFilipino: "ang paghakbang gamit ang mga paa",
            usageExamples: [{ s: "Lumakad kami pauwi.", t: "We walked home." }],
        }
    ];

    console.log("🌳 Growing words with native definitions...");
    await db.insert(words).values(wordsToInsert);

    console.log("✅ Database successfully updated and seeded!");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});