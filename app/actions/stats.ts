'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/db'
import { userProfiles, userAchievements, dailyActivity, achievementsConfig, levels, userProgress } from '@/db/schema'
import { eq, desc, and, gte } from 'drizzle-orm'
import { withExponentialBackoff } from '@/lib/db-utils'
import { getPHTDate } from '@/lib/date-utils'

export async function getUserStats() {
    return withExponentialBackoff(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return null;
        }

        // Fetch or create profile
        let profile = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.userId, user.id)
        });

        if (!profile) {
            const displayName = user.user_metadata?.username || user.email?.split('@')[0] || "JUAN DELA CRUZ";
            const [newProfile] = await db.insert(userProfiles).values({
                userId: user.id,
                username: displayName,
                displayName: displayName,
                xp: 0,
                level: 1,
            }).returning();
            profile = newProfile;
        }

        // Fetch Configs
        const dynamicLevels = await db.query.levels.findMany({
            orderBy: (levels, { asc }) => [asc(levels.minXp)]
        });

        const dynamicAchievements = await db.query.achievementsConfig.findMany();

        // Fetch achievements unlocked by user
        const unlocked = await db.query.userAchievements.findMany({
            where: eq(userAchievements.userId, user.id)
        });
        const unlockedIds = new Set(unlocked.map(a => a.achievementId));

        const achievementsList = dynamicAchievements.map(ach => ({
            ...ach,
            unlocked: unlockedIds.has(ach.id)
        }));

// Fetch FSRS Insights
        const progressRecords = await db.query.userProgress.findMany({
            where: and(eq(userProgress.userId, user.id), eq(userProgress.isArchived, false)),
            with: { word: true }
        });

        const now = new Date();
        let totalMastery = 0;
        let upcomingReviewsCount = 0;
        let learning = 0;
        let reviewing = 0;
        let mastered = 0;

        progressRecords.forEach(record => {
            totalMastery += record.mastery || 0;
            if (record.nextReview && new Date(record.nextReview) <= now) {
                upcomingReviewsCount++;
            }
            if ((record.mastery || 0) < 50) learning++;
            else if ((record.mastery || 0) < 90) reviewing++;
            else mastered++;
        });

        const retentionRate = progressRecords.length > 0 
            ? Math.round(totalMastery / progressRecords.length) 
            : 0;

        // Struggled Words
        const struggledWords = [...progressRecords]
            .sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0))
            .slice(0, 5)
            .map(r => ({
                word: r.word?.word,
                translation: r.word?.translation,
                difficulty: r.difficulty,
                mastery: r.mastery
            }));

        // Fetch activity for heatmap (last 365 days)
        const oneYearAgo = getPHTDate();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);
        
        const activity = await db.query.dailyActivity.findMany({
            where: and(
                eq(dailyActivity.userId, user.id),
                gte(dailyActivity.date, oneYearAgo)
            ),
            orderBy: [desc(dailyActivity.date)]
        });

        // Format activity for charts
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const weeklyWords = [];
        const accuracyTrend = [];
        const yearlyHeatmap = [];

        // Build last 7 days array
        for (let i = 6; i >= 0; i--) {
            const d = getPHTDate();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            const dayRecord = activity.find(a => {
                const aDate = new Date(a.date);
                return aDate.toISOString().split('T')[0] === dateStr;
            });

            weeklyWords.push({
                day: days[d.getDay()],
                words: dayRecord?.wordsLearned || 0
            });

            const accuracy = dayRecord && dayRecord.totalAnswers > 0 
                ? Math.round((dayRecord.correctAnswers / dayRecord.totalAnswers) * 100)
                : 0;
            
            accuracyTrend.push({
                week: `D${7-i}`,
                accuracy: accuracy
            });
        }

        // Build 365 heatmap
        for (let i = 365; i >= 0; i--) {
            const d = getPHTDate();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayRecord = activity.find(a => {
                const aDate = new Date(a.date);
                return aDate.toISOString().split('T')[0] === dateStr;
            });
            yearlyHeatmap.push({
                date: dateStr,
                xp: dayRecord?.xpEarned || 0,
                quizzes: dayRecord?.totalAnswers || 0
            });
        }

        return {
            profile,
            achievements: achievementsList,
            weeklyWords,
            accuracyTrend,
            levels: dynamicLevels,
            fsrs: {
                retentionRate,
                upcomingReviewsCount,
                wordsByDifficulty: { learning, reviewing, mastered },
                struggledWords
            },
            yearlyHeatmap
        };
    });
}

export async function getLeaderboard() {
    return withExponentialBackoff(async () => {
        // Fetch top 10 users by XP (All Time)
        const topXp = await db.query.userProfiles.findMany({
            orderBy: [desc(userProfiles.xp)],
            limit: 10,
            columns: {
                userId: true,
                displayName: true,
                xp: true,
                level: true
            }
        });

        // Fetch top 10 users by Words Mastered (All Time)
        const topWords = await db.query.userProfiles.findMany({
            orderBy: [desc(userProfiles.wordsMastered)],
            limit: 10,
            columns: {
                userId: true,
                displayName: true,
                wordsMastered: true,
                level: true
            }
        });

        // Fetch Weekly Leaderboard
        const sevenDaysAgo = getPHTDate();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentActivity = await db.query.dailyActivity.findMany({
            where: gte(dailyActivity.date, sevenDaysAgo),
            with: { profile: true }
        });

        // Aggregate XP by user for the week
        const userXpMap = new Map<string, { xp: number; displayName: string; level: number }>();
        recentActivity.forEach(act => {
            if (act.profile) {
                const existing = userXpMap.get(act.userId) || { xp: 0, displayName: act.profile.displayName || "Unknown", level: act.profile.level };
                existing.xp += act.xpEarned;
                userXpMap.set(act.userId, existing);
            }
        });

        const weeklyTopXp = Array.from(userXpMap.entries())
            .map(([userId, data]) => ({ userId, ...data }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 10);

        return { topXp, topWords, weeklyTopXp };
    });
}
