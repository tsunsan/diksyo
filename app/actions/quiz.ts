"use server";

import { db } from "@/db";
import { userProgress, words } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { withExponentialBackoff } from "@/lib/db-utils";
import { calculateNextReview, FSRSGrade } from "@/lib/fsrs-logic";

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
        await withExponentialBackoff(() => db.update(userProgress)
            .set({
                stability: newFsrsStats.stability,
                difficulty: newFsrsStats.difficulty,
                lastReview: newFsrsStats.fsrsData.last_review || new Date(),
                nextReview: newFsrsStats.nextReviewDate,
                mastery: newMastery,
            })
            .where(eq(userProgress.id, progressRecord.id))
        );

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
