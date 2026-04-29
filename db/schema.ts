import { pgTable, uuid, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roots = pgTable("roots", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    definition: text("definition"),
});

export const words = pgTable("words", {
    id: uuid("id").primaryKey().defaultRandom(),
    rootId: uuid("root_id").references(() => roots.id),
    word: text("word").notNull(),
    slug: text("slug").unique().notNull(),
    partOfSpeech: text("part_of_speech"),
    translation: text("translation").notNull(),
    meaningFilipino: text("meaning_filipino"),
    originalExplanation: text("original_explanation"),
    usageExamples: jsonb("usage_examples").$type<{ s: string; t: string }[]>(),
});

export const userProgress = pgTable("user_progress", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    wordId: uuid("word_id").references(() => words.id),
    stability: integer("stability").default(0),
    difficulty: integer("difficulty").default(0),
    lastReview: timestamp("last_review"),
    nextReview: timestamp("next_review").defaultNow(),
    mastery: integer("mastery").default(0),
});

export const rootRelations = relations(roots, ({ many }) => ({
    words: many(words),
}));

export const wordRelations = relations(words, ({ one }) => ({
    root: one(roots, { fields: [words.rootId], references: [roots.id] }),
}));