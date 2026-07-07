import { pgTable, uuid, text, integer, real, timestamp, jsonb, primaryKey, boolean, index, pgPolicy } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const words = pgTable("words", {
    id: uuid("id").primaryKey().defaultRandom(),
    rootWordId: uuid("root_word_id").references((): any => words.id),
    rootWordString: text("root_word_string"),
    word: text("word").notNull(),
    slug: text("slug").unique().notNull(),
    pronunciation: text("pronunciation"),
    partOfSpeech: text("part_of_speech"),
    posEnglish: text("pos_english"),
    translation: text("translation").notNull(),
    meaningFilipino: text("meaning_filipino"),
    etymology: text("etymology"),
    originalExplanation: text("original_explanation"),
    usageNotes: text("usage_notes"),
    usageExamples: jsonb("usage_examples").$type<{ sentence: string; translation: string }[]>(),
    tags: jsonb("tags").$type<string[]>(),
    related: jsonb("related").$type<string[]>(),
    level: text("level"),
    frequency: text("frequency"),
}, (table) => [
    index("words_word_idx").on(table.word),
    pgPolicy("Allow public read access on words", {
        as: "permissive",
        for: "select",
        to: "public",
        using: sql`true`,
    })
]);

export const userProgress = pgTable("user_progress", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    wordId: uuid("word_id").references(() => words.id),
    stability: real("stability").default(0),
    difficulty: real("difficulty").default(0),
    lastReview: timestamp("last_review", { withTimezone: true }),
    nextReview: timestamp("next_review", { withTimezone: true }).defaultNow(),
    mastery: integer("mastery").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    isArchived: boolean("is_archived").default(false),
}, (table) => [
    pgPolicy("Users can view own progress", {
        as: "permissive",
        for: "select",
        to: "authenticated",
        using: sql`(select auth.uid()) = user_id`,
    }),
    pgPolicy("Users can insert own progress", {
        as: "permissive",
        for: "insert",
        to: "authenticated",
        withCheck: sql`(select auth.uid()) = user_id`,
    }),
    pgPolicy("Users can update own progress", {
        as: "permissive",
        for: "update",
        to: "authenticated",
        using: sql`(select auth.uid()) = user_id`,
        withCheck: sql`(select auth.uid()) = user_id`,
    }),
    pgPolicy("Users can delete own progress", {
        as: "permissive",
        for: "delete",
        to: "authenticated",
        using: sql`(select auth.uid()) = user_id`,
    }),
]);

export const userProgressRelations = relations(userProgress, ({ one }) => ({
    word: one(words, { fields: [userProgress.wordId], references: [words.id] })
}));

export const wordRelations = relations(words, ({ one, many }) => ({
    rootWord: one(words, { fields: [words.rootWordId], references: [words.id], relationName: "rootDerived" }),
    derivedWords: many(words, { relationName: "rootDerived" }),
    progress: many(userProgress),
}));

export const userProfiles = pgTable("user_profiles", {
    userId: uuid("user_id").primaryKey().notNull(),
    username: text("username"),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    showAvatar: boolean("show_avatar").default(true),
    xp: integer("xp").default(0).notNull(),
    level: integer("level").default(1).notNull(),
    currentStreak: integer("current_streak").default(0).notNull(),
    longestStreak: integer("longest_streak").default(0).notNull(),
    lastActiveDate: timestamp("last_active_date", { withTimezone: true }),
    wordsMastered: integer("words_mastered").default(0).notNull(),
    quizzesCompleted: integer("quizzes_completed").default(0).notNull(),
    perfectQuizzes: integer("perfect_quizzes").default(0).notNull(),
    fastestQuizMs: integer("fastest_quiz_ms"),
    totalTimeLearningMs: integer("total_time_learning_ms").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    pgPolicy("Public read for leaderboard", {
        as: "permissive",
        for: "select",
        to: "public",
        using: sql`true`,
    }),
    pgPolicy("Users update own profile", {
        as: "permissive",
        for: "update",
        to: "authenticated",
        using: sql`(select auth.uid()) = user_id`,
        withCheck: sql`(select auth.uid()) = user_id`,
    }),
    pgPolicy("Users insert own profile", {
        as: "permissive",
        for: "insert",
        to: "authenticated",
        withCheck: sql`(select auth.uid()) = user_id`,
    })
]);

export const userAchievements = pgTable("user_achievements", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    achievementId: text("achievement_id").notNull(),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index("achievements_user_idx").on(table.userId),
    pgPolicy("Users read own achievements", {
        as: "permissive",
        for: "select",
        to: "authenticated",
        using: sql`(select auth.uid()) = user_id`,
    }),
    pgPolicy("Users insert own achievements", {
        as: "permissive",
        for: "insert",
        to: "authenticated",
        withCheck: sql`(select auth.uid()) = user_id`,
    })
]);

export const dailyActivity = pgTable("daily_activity", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    date: timestamp("date", { mode: "date" }).notNull(),
    xpEarned: integer("xp_earned").default(0).notNull(),
    wordsLearned: integer("words_learned").default(0).notNull(),
    correctAnswers: integer("correct_answers").default(0).notNull(),
    totalAnswers: integer("total_answers").default(0).notNull(),
}, (table) => [
    index("daily_activity_user_date_idx").on(table.userId, table.date),
    pgPolicy("Users read own activity", {
        as: "permissive",
        for: "select",
        to: "authenticated",
        using: sql`(select auth.uid()) = user_id`,
    }),
    pgPolicy("Users insert own activity", {
        as: "permissive",
        for: "insert",
        to: "authenticated",
        withCheck: sql`(select auth.uid()) = user_id`,
    }),
    pgPolicy("Users update own activity", {
        as: "permissive",
        for: "update",
        to: "authenticated",
        using: sql`(select auth.uid()) = user_id`,
        withCheck: sql`(select auth.uid()) = user_id`,
    })
]);

export const userProfileRelations = relations(userProfiles, ({ many }) => ({
    achievements: many(userAchievements),
    dailyActivity: many(dailyActivity),
}));

export const userAchievementRelations = relations(userAchievements, ({ one }) => ({
    profile: one(userProfiles, { fields: [userAchievements.userId], references: [userProfiles.userId] }),
}));

export const dailyActivityRelations = relations(dailyActivity, ({ one }) => ({
    profile: one(userProfiles, { fields: [dailyActivity.userId], references: [userProfiles.userId] }),
}));

export const levels = pgTable("levels", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    minXp: integer("min_xp").notNull(),
    color: text("color").notNull(),
});

export const achievementsConfig = pgTable("achievements_config", {
    id: text("id").primaryKey(),
    icon: text("icon").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    conditionType: text("condition_type").notNull(),
    conditionValue: integer("condition_value").notNull(),
});
