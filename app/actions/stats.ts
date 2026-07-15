'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/db'
import { userProfiles, userAchievements, dailyActivity, achievementsConfig, levels, userProgress, words } from '@/db/schema'
import { eq, desc, and, gte, sql, inArray } from 'drizzle-orm'
import { withExponentialBackoff } from '@/lib/db-utils'
import { getPHTDate } from '@/lib/date-utils'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

export const getUserStats = cache(async () => {
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

        // Dynamically compute streak for display
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

        const oneYearAgo = getPHTDate();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);

        const [
            dynamicLevels,
            dynamicAchievements,
            unlocked,
            progressRecords,
            activity
        ] = await Promise.all([
            db.query.levels.findMany({
                orderBy: (levels, { asc }) => [asc(levels.minXp)]
            }),
            db.query.achievementsConfig.findMany(),
            db.query.userAchievements.findMany({
                where: eq(userAchievements.userId, user.id)
            }),
            db.query.userProgress.findMany({
                where: and(eq(userProgress.userId, user.id), eq(userProgress.isArchived, false))
            }),
            db.query.dailyActivity.findMany({
                where: and(
                    eq(dailyActivity.userId, user.id),
                    gte(dailyActivity.date, oneYearAgo)
                ),
                orderBy: [desc(dailyActivity.date)]
            })
        ]);

        const unlockedIds = new Set(unlocked.map(a => a.achievementId));

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

        // Self-heal the profile's wordsMastered count if it differs from the actual dynamic count
        if (profile.wordsMastered !== mastered) {
            await db.update(userProfiles)
                .set({ wordsMastered: mastered })
                .where(eq(userProfiles.userId, user.id));
            profile.wordsMastered = mastered;
        }

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

        const achievementsList = dynamicAchievements.map(ach => ({
            ...ach,
            unlocked: unlockedIds.has(ach.id)
        }));

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
});

export const getLeaderboard = unstable_cache(async () => {
    return withExponentialBackoff(async () => {
        const sevenDaysAgo = getPHTDate();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [topXp, topWords, weeklyTopXpRaw] = await Promise.all([
            db.query.userProfiles.findMany({
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
            }),
            db.query.userProfiles.findMany({
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
            }),
            db.select({
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
            .limit(10)
        ]);

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
