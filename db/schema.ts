import {pgTable, uuid, text, integer, timestamp, jsonb, primaryKey, boolean} from "drizzle-orm/pg-core";
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

export const userProgressRelations = relations(userProgress, ({ one }) => ({
    word: one(words, { fields: [userProgress.wordId], references: [words.id] })
}));

export const wordRelations = relations(words, ({ one, many }) => ({
    root: one(roots, { fields: [words.rootId], references: [roots.id] }),
    progress: many(userProgress),
}));
