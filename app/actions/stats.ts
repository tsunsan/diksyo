'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/db'
import { userProfiles, userAchievements, dailyActivity, achievementsConfig, levels, userProgress, words } from '@/db/schema'
import { eq, desc, and, gte, sql, inArray, isNotNull } from 'drizzle-orm'
import { withExponentialBackoff } from '@/lib/db-utils'
import { getPHTDate } from '@/lib/date-utils'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

const getUserId = cache(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
});

const getOrCreateProfile = cache(async () => {
    const user = await getUserId();
    if (!user) return null;
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
    return profile;
});

export const getProfileStats = cache(async () => {
    return withExponentialBackoff(async () => {
        const profile = await getOrCreateProfile();
        if (!profile) return null;

        if (profile.lastActiveDate) {
            const nowPHT = getPHTDate();
            const lastActivePHT = new Date(profile.lastActiveDate.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
            
            nowPHT.setHours(0, 0, 0, 0);
            lastActivePHT.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(nowPHT.getTime() - lastActivePHT.getTime());
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) {
                profile.currentStreak = 0;
            }
        }

        const dynamicLevels = await db.query.levels.findMany({
            orderBy: (levels, { asc }) => [asc(levels.minXp)]
        });

        return { profile, levels: dynamicLevels };
    });
});

export const getActivityStats = cache(async () => {
    return withExponentialBackoff(async () => {
        const user = await getUserId();
        if (!user) return null;

        const oneYearAgo = getPHTDate();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);

        const activity = await db.query.dailyActivity.findMany({
            where: and(
                eq(dailyActivity.userId, user.id),
                gte(dailyActivity.date, oneYearAgo)
            ),
            orderBy: [desc(dailyActivity.date)]
        });

        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const weeklyWords = [];
        const accuracyTrend = [];
        const yearlyHeatmap = [];

        const activityMap = new Map();
        activity.forEach(a => {
            const aDate = new Date(a.date);
            const dateStr = aDate.toISOString().split('T')[0];
            activityMap.set(dateStr, a);
        });

        // Build last 7 days array
        for (let i = 6; i >= 0; i--) {
            const d = getPHTDate();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            const dayRecord = activityMap.get(dateStr);

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
            
            const dayRecord = activityMap.get(dateStr);
            
            yearlyHeatmap.push({
                date: dateStr,
                xp: dayRecord?.xpEarned || 0,
                quizzes: dayRecord?.totalAnswers || 0
            });
        }

        return { weeklyWords, accuracyTrend, yearlyHeatmap };
    });
});

export const getFSRSStats = cache(async () => {
    return withExponentialBackoff(async () => {
        const user = await getUserId();
        if (!user) return null;

        const progressStatsRaw = await db.select({
                totalMastery: sql<number>`sum(coalesce(${userProgress.mastery}, 0))::int`,
                reviewedCount: sql<number>`count(case when ${userProgress.lastReview} is not null then 1 end)::int`,
                learning: sql<number>`count(case when ${userProgress.lastReview} is not null and coalesce(${userProgress.mastery}, 0) < 50 then 1 end)::int`,
                reviewing: sql<number>`count(case when ${userProgress.lastReview} is not null and coalesce(${userProgress.mastery}, 0) >= 50 and coalesce(${userProgress.mastery}, 0) < 90 then 1 end)::int`,
                mastered: sql<number>`count(case when ${userProgress.lastReview} is not null and coalesce(${userProgress.mastery}, 0) >= 90 then 1 end)::int`,
                newWords: sql<number>`count(case when ${userProgress.lastReview} is null then 1 end)::int`,
                upcomingReviewsCount: sql<number>`count(case when ${userProgress.nextReview} <= now() then 1 end)::int`,
            })
            .from(userProgress)
            .where(and(eq(userProgress.userId, user.id), eq(userProgress.isArchived, false)));

        const topStruggled = await db.query.userProgress.findMany({
                where: and(
                    eq(userProgress.userId, user.id),
                    eq(userProgress.isArchived, false),
                    isNotNull(userProgress.lastReview)
                ),
                orderBy: [desc(userProgress.difficulty)],
                limit: 5,
            });

        const progressStats = progressStatsRaw[0] || {
            totalMastery: 0, reviewedCount: 0, learning: 0, reviewing: 0, mastered: 0, newWords: 0, upcomingReviewsCount: 0
        };

        const retentionRate = progressStats.reviewedCount > 0 
            ? Math.round((progressStats.totalMastery || 0) / progressStats.reviewedCount) 
            : 0;

        const mastered = progressStats.mastered || 0;

        // Self-heal profile
        const profile = await getOrCreateProfile();
        if (profile && profile.wordsMastered !== mastered) {
            await db.update(userProfiles)
                .set({ wordsMastered: mastered })
                .where(eq(userProfiles.userId, user.id));
        }

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

        return {
            fsrs: {
                retentionRate,
                upcomingReviewsCount: progressStats.upcomingReviewsCount || 0,
                wordsByDifficulty: { 
                    newWords: progressStats.newWords || 0, 
                    learning: progressStats.learning || 0, 
                    reviewing: progressStats.reviewing || 0, 
                    mastered: progressStats.mastered || 0 
                },
                struggledWords
            }
        };
    });
});

export const getAchievementsStats = cache(async () => {
    return withExponentialBackoff(async () => {
        const user = await getUserId();
        if (!user) return null;

        const dynamicAchievements = await db.query.achievementsConfig.findMany();
        const unlocked = await db.query.userAchievements.findMany({
                where: eq(userAchievements.userId, user.id)
            });

        const unlockedIds = new Set(unlocked.map(a => a.achievementId));
        const achievementsList = dynamicAchievements.map(ach => ({
            ...ach,
            unlocked: unlockedIds.has(ach.id)
        }));

        return { achievements: achievementsList };
    });
});

export const getLeaderboard = unstable_cache(async () => {
    return withExponentialBackoff(async () => {
        const sevenDaysAgo = getPHTDate();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

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
            
        const weeklyTopXpRaw = await db.select({
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
}, ['leaderboard-cache'], { revalidate: 60, tags: ['leaderboard-cache'] });
