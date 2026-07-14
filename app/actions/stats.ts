'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/db'
import { userProfiles, userAchievements, dailyActivity, achievementsConfig, levels, userProgress, words } from '@/db/schema'
import { eq, desc, and, gte, sql, inArray } from 'drizzle-orm'
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
            const defaultName = user.user_metadata?.username || user.email?.split('@')[0] || "JUAN DELA CRUZ";
            const [newProfile] = await db.insert(userProfiles).values({
                userId: user.id,
                username: defaultName,
                displayName: defaultName,
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
            where: and(eq(userProgress.userId, user.id), eq(userProgress.isArchived, false))
        });

        const now = new Date();
        let totalMastery = 0;
        let upcomingReviewsCount = 0;
        let learning = 0;
        let reviewing = 0;
        let mastered = 0;
        let newWords = 0;
        let reviewedCount = 0;

        progressRecords.forEach(record => {
            if (record.lastReview) {
                totalMastery += record.mastery || 0;
                reviewedCount++;
                
                if ((record.mastery || 0) < 50) learning++;
                else if ((record.mastery || 0) < 90) reviewing++;
                else mastered++;
            } else {
                newWords++;
            }
            
            if (record.nextReview && new Date(record.nextReview) <= now) {
                upcomingReviewsCount++;
            }
        });

        const retentionRate = reviewedCount > 0 
            ? Math.round(totalMastery / reviewedCount) 
            : 0;

        // Struggled Words (only words actually reviewed)
        const topStruggled = [...progressRecords]
            .filter(r => r.lastReview !== null)
            .sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0))
            .slice(0, 5);

        const struggledWordIds = topStruggled.map(r => r.wordId).filter(Boolean) as string[];
        const struggledWordsData = struggledWordIds.length > 0 
            ? await db.query.words.findMany({ where: inArray(words.id, struggledWordIds) })
            : [];

        const struggledWords = topStruggled.map(r => {
            const w = struggledWordsData.find(wd => wd.id === r.wordId);
            return {
                word: w?.word,
                translation: w?.translation,
                difficulty: r.difficulty,
                mastery: r.mastery
            };
        });

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
                wordsByDifficulty: { newWords, learning, reviewing, mastered },
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
                username: true,
                xp: true,
                level: true,
                avatarUrl: true,
                showAvatar: true
            }
        });

        // Fetch top 10 users by Words Mastered (All Time)
        const topWords = await db.query.userProfiles.findMany({
            orderBy: [desc(userProfiles.wordsMastered)],
            limit: 10,
            columns: {
                userId: true,
                username: true,
                wordsMastered: true,
                level: true,
                avatarUrl: true,
                showAvatar: true
            }
        });

        // Fetch Weekly Leaderboard via DB aggregation
        const sevenDaysAgo = getPHTDate();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyTopXpRaw = await db
            .select({
                userId: dailyActivity.userId,
                username: userProfiles.username,
                level: userProfiles.level,
                avatarUrl: userProfiles.avatarUrl,
                showAvatar: userProfiles.showAvatar,
                xp: sql<number>`sum(${dailyActivity.xpEarned})::int`
            })
            .from(dailyActivity)
            .leftJoin(userProfiles, eq(dailyActivity.userId, userProfiles.userId))
            .where(gte(dailyActivity.date, sevenDaysAgo))
            .groupBy(
                dailyActivity.userId,
                userProfiles.username,
                userProfiles.level,
                userProfiles.avatarUrl,
                userProfiles.showAvatar
            )
            .orderBy(desc(sql`sum(${dailyActivity.xpEarned})`))
            .limit(10);

        const weeklyTopXp = weeklyTopXpRaw.map(row => ({
            userId: row.userId,
            username: row.username || "Unknown",
            level: row.level || 1,
            avatarUrl: row.avatarUrl,
            showAvatar: row.showAvatar,
            xp: row.xp
        }));

        return { topXp, topWords, weeklyTopXp };
    });
}
