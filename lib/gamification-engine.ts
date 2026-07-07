import { db } from "@/db";
import { userProfiles, achievementsConfig, userAchievements } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Checks all un-earned achievements for a user and awards them if conditions are met.
 * Should be called asynchronously after a user's stats have been updated.
 */
export async function checkAndAwardAchievements(userId: string, currentQuizStats?: { timeTakenMs?: number; accuracy?: number }) {
    try {
        const profile = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.userId, userId)
        });

        if (!profile) return;

        // Fetch all achievements the user has already unlocked
        const unlocked = await db.query.userAchievements.findMany({
            where: eq(userAchievements.userId, userId)
        });
        const unlockedIds = new Set(unlocked.map(a => a.achievementId));

        // Fetch ALL achievement configurations
        const allAchievements = await db.query.achievementsConfig.findMany();

        const newlyUnlocked = [];

        for (const ach of allAchievements) {
            // Skip if already unlocked
            if (unlockedIds.has(ach.id)) continue;

            let conditionMet = false;

            switch (ach.conditionType) {
                case "streak":
                    conditionMet = profile.currentStreak >= ach.conditionValue;
                    break;
                case "words_mastered":
                    conditionMet = profile.wordsMastered >= ach.conditionValue;
                    break;
                case "quizzes_completed":
                    conditionMet = profile.quizzesCompleted >= ach.conditionValue;
                    break;
                case "level":
                    conditionMet = profile.level >= ach.conditionValue;
                    break;
                case "perfect_quizzes":
                    conditionMet = profile.perfectQuizzes >= ach.conditionValue;
                    break;
                case "time_of_day":
                    const currentHour = new Date().getHours();
                    if (ach.conditionValue === 0) { // Night Owl
                        conditionMet = currentHour >= 0 && currentHour < 4;
                    } else if (ach.conditionValue === 4) { // Early Bird
                        conditionMet = currentHour >= 4 && currentHour < 8;
                    }
                    break;
                case "speed_quiz":
                    // This relies on the current quiz context being passed in
                    if (currentQuizStats?.timeTakenMs) {
                        conditionMet = currentQuizStats.timeTakenMs <= ach.conditionValue;
                    } else if (profile.fastestQuizMs) {
                        conditionMet = profile.fastestQuizMs <= ach.conditionValue;
                    }
                    break;
            }

            if (conditionMet) {
                await db.insert(userAchievements).values({
                    userId: userId,
                    achievementId: ach.id
                });
                newlyUnlocked.push(ach);
            }
        }

        if (newlyUnlocked.length > 0) {
            console.log(`User ${userId} unlocked ${newlyUnlocked.length} new achievements!`);
            // Here you could trigger a real-time notification via Supabase Realtime if desired
        }

    } catch (error) {
        console.error("Error checking achievements:", error);
    }
}
