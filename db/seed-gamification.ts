import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing! Check your .env.local file.");
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });

const SEED_LEVELS = [
  { name: "BAGUHAN", minXp: 0, color: "#8B5E3C" },
  { name: "SIBOL", minXp: 250, color: "#22C55E" },
  { name: "SANAY", minXp: 1000, color: "#06B6D4" },
  { name: "MAHUSAY", minXp: 2500, color: "#3B82F6" },
  { name: "BATIKAN", minXp: 5000, color: "#8B5CF6" },
  { name: "DALUBHASA", minXp: 10000, color: "#EC4899" },
  { name: "PANTAS", minXp: 20000, color: "#F97316" },
  { name: "ALAMAT", minXp: 50000, color: "#EAB308" },
];

const SEED_ACHIEVEMENTS = [
  { id: "first_flame", icon: "🔥", title: "FIRST FLAME", description: "Keep a 3-day learning streak", conditionType: "streak", conditionValue: 3 },
  { id: "alab", icon: "🔥", title: "ALAB", description: "Keep a 7-day learning streak", conditionType: "streak", conditionValue: 7 },
  { id: "word_hog", icon: "📚", title: "WORD HOG", description: "Master 50 words", conditionType: "words_mastered", conditionValue: 50 },
  { id: "talasalitaan", icon: "📖", title: "TALASALITAAN", description: "Master 200 words", conditionType: "words_mastered", conditionValue: 200 },
  { id: "pagsisikap", icon: "💪", title: "PAGSISIKAP", description: "Complete 10 quizzes", conditionType: "quizzes_completed", conditionValue: 10 },
  { id: "speed_demon", icon: "⚡", title: "SPEED DEMON", description: "Complete a quiz in under 5 seconds", conditionType: "speed_quiz", conditionValue: 5000 },
  { id: "perfect_score", icon: "🏆", title: "PERFECT SCORE", description: "Get 100% accuracy on a quiz", conditionType: "perfect_quizzes", conditionValue: 1 },
  { id: "early_bird", icon: "🌅", title: "EARLY BIRD", description: "Learn a word between 4 AM and 8 AM", conditionType: "time_of_day", conditionValue: 4 },
  { id: "night_owl", icon: "🦉", title: "NIGHT OWL", description: "Learn a word after midnight", conditionType: "time_of_day", conditionValue: 0 },
  { id: "alamat", icon: "👑", title: "ALAMAT", description: "Reach the max level", conditionType: "level", conditionValue: 8 },
];

async function seed() {
    console.log("Seeding Gamification Config...");
    
    // Seed Levels
    for (const level of SEED_LEVELS) {
        const existing = await db.query.levels.findFirst({
            where: eq(schema.levels.name, level.name)
        });
        if (!existing) {
            await db.insert(schema.levels).values(level);
            console.log(`Inserted Level: ${level.name}`);
        }
    }

    // Seed Achievements
    for (const ach of SEED_ACHIEVEMENTS) {
        const existing = await db.query.achievementsConfig.findFirst({
            where: eq(schema.achievementsConfig.id, ach.id)
        });
        if (!existing) {
            await db.insert(schema.achievementsConfig).values(ach);
            console.log(`Inserted Achievement: ${ach.title}`);
        }
    }

    console.log("Seeding Complete!");
    process.exit(0);
}

seed().catch(console.error);
