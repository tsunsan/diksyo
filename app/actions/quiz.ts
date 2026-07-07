"use server";

import { db } from "@/db";
import { userProgress, words, userProfiles, dailyActivity } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { withExponentialBackoff } from "@/lib/db-utils";
import { calculateNextReview, FSRSGrade } from "@/lib/fsrs-logic";
import { getPHTDate } from "@/lib/date-utils";

export interface QuizSubmission {
    wordId: string;
    userAnswer: string;
    gameMode: "cloze" | "time";
    timeTakenMs: number;
    acceptedAnswers?: string[];
}

const LEVEL_XP_MAP: Record<string, number> = {
    BEGINNER: 10,
    INTERMEDIATE: 20,
    ADVANCED: 30
};

const calculateMastery = (stability: number): number => {
    // Stability of 90 days equates to 100% mastery
    return Math.min(100, Math.round((stability / 90) * 100));
};

export async function submitQuizAnswer({ wordId, userAnswer, gameMode, timeTakenMs, acceptedAnswers }: QuizSubmission) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    try {
        const progressRecord = await withExponentialBackoff(() => db.query.userProgress.findFirst({
            where: and(eq(userProgress.userId, user.id), eq(userProgress.wordId, wordId)),
            with: { word: true }
        }));

        if (!progressRecord || !progressRecord.word) {
            return { success: false, error: "Word not found in vault" };
        }

        const targetWord = progressRecord.word;
        const levelXP = targetWord.level ? (LEVEL_XP_MAP[targetWord.level.toUpperCase()] || 10) : 10;
        
        let isCorrect = false;

        // Validation Logic
        if (gameMode === "cloze") {
            isCorrect = userAnswer.trim().toLowerCase() === targetWord.word.toLowerCase();
        } else if (gameMode === "time") {
            const expected = targetWord.word.toLowerCase();
            const typed = userAnswer.trim().toLowerCase();
            
            // 1. Exact match
            if (typed === expected) {
                isCorrect = true;
            } 
            // 2. Fallback to accepted answers provided (if any)
            else if (acceptedAnswers && acceptedAnswers.some(a => a.toLowerCase() === typed)) {
                isCorrect = true;
            }
        }

        let calculatedGrade: FSRSGrade = "again";
        let xpGained = 0;

        if (isCorrect) {
            if (timeTakenMs < 3000) calculatedGrade = "easy";
            else if (timeTakenMs < 8000) calculatedGrade = "good";
            else calculatedGrade = "hard";

            // XP Calculation: Base level XP + Speed Bonus
            xpGained = levelXP + (timeTakenMs < 10000 && gameMode === "time" ? 5 : 0);
        }

        const newFsrsStats = calculateNextReview(calculatedGrade, progressRecord);
        const newMastery = calculateMastery(newFsrsStats.stability);

        // Update DB
        await withExponentialBackoff(async () => {
            // Update FSRS Progress
            await db.update(userProgress)
                .set({
                    stability: newFsrsStats.stability,
                    difficulty: newFsrsStats.difficulty,
                    lastReview: newFsrsStats.fsrsData.last_review || new Date(),
                    nextReview: newFsrsStats.nextReviewDate,
                    mastery: newMastery,
                })
                .where(eq(userProgress.id, progressRecord.id));

            // Determine if daily streak should be incremented
            const profile = await db.query.userProfiles.findFirst({
                where: eq(userProfiles.userId, user.id)
            });

            if (profile) {
                const now = new Date();
                const lastActive = profile.lastActiveDate ? new Date(profile.lastActiveDate) : null;
                
                let newStreak = profile.currentStreak;
                
                if (lastActive) {
                    const diffTime = Math.abs(now.getTime() - lastActive.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                    
                    if (diffDays === 1) {
                        // Played yesterday, increment streak
                        newStreak += 1;
                    } else if (diffDays > 1) {
                        // Missed a day, reset streak
                        newStreak = 1;
                    }
                    // If diffDays === 0 (played today already), keep streak the same
                } else {
                    // First time playing ever
                    newStreak = 1;
                }

                const newLongestStreak = Math.max(newStreak, profile.longestStreak);
                
                // Track fastest quiz if correct
                let fastest = profile.fastestQuizMs;
                if (isCorrect) {
                    if (!fastest || timeTakenMs < fastest) {
                        fastest = timeTakenMs;
                    }
                }

                const perfectUpdate = isCorrect && timeTakenMs > 0 ? 1 : 0; // Simple approximation for now

                await db.update(userProfiles)
                    .set({
                        xp: profile.xp + xpGained,
                        quizzesCompleted: profile.quizzesCompleted + 1,
                        currentStreak: newStreak,
                        longestStreak: newLongestStreak,
                        lastActiveDate: now,
                        fastestQuizMs: fastest,
                        perfectQuizzes: profile.perfectQuizzes + perfectUpdate,
                        totalTimeLearningMs: profile.totalTimeLearningMs + timeTakenMs,
                    })
                    .where(eq(userProfiles.userId, user.id));
            }

            // Update Daily Activity
            const today = getPHTDate();

            const activity = await db.query.dailyActivity.findFirst({
                where: and(eq(dailyActivity.userId, user.id), eq(dailyActivity.date, today))
            });

            if (activity) {
                await db.update(dailyActivity)
                    .set({
                        xpEarned: activity.xpEarned + xpGained,
                        totalAnswers: activity.totalAnswers + 1,
                        correctAnswers: activity.correctAnswers + (isCorrect ? 1 : 0),
                    })
                    .where(eq(dailyActivity.id, activity.id));
            } else {
                await db.insert(dailyActivity).values({
                    userId: user.id,
                    date: today,
                    xpEarned: xpGained,
                    totalAnswers: 1,
                    correctAnswers: isCorrect ? 1 : 0,
                    wordsLearned: 1, // Assume 1 word learned on first activity
                });
            }
        });

        // Trigger Achievement Engine asynchronously (don't await it so we don't block the UI response)
        import("@/lib/gamification-engine").then(({ checkAndAwardAchievements }) => {
            checkAndAwardAchievements(user.id, {
                timeTakenMs: timeTakenMs,
                accuracy: isCorrect ? 100 : 0
            });
        });

        return {
            success: true,
            correct: isCorrect,
            xpGained,
            newMastery,
            level: targetWord.level || "BEGINNER",
            expectedAnswer: targetWord.word
        };

    } catch (error) {
        console.error("Error submitting quiz answer:", error);
        return { success: false, error: "Failed to process answer" };
    }
}
