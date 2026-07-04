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
