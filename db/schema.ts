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

export const lists = pgTable("lists", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    isSystem: boolean("is_system").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const listWords = pgTable("list_words", {
    listId: uuid("list_id").references(() => lists.id, { onDelete: "cascade" }).notNull(),
    wordId: uuid("word_id").references(() => words.id, { onDelete: "cascade" }).notNull(),
    addedAt: timestamp("added_at").defaultNow(),
}, (t) => ({
    pk: primaryKey({ columns: [t.listId, t.wordId] }),
}));


export const rootRelations = relations(roots, ({ many }) => ({
    words: many(words),
}));

export const wordRelations = relations(words, ({ one, many }) => ({
    root: one(roots, { fields: [words.rootId], references: [roots.id] }),
    lists: many(listWords), // Allows querying which lists contain this word
    userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
    word: one(words, { fields: [userProgress.wordId], references: [words.id] }),
}));

// New Relations for the Lists
export const listRelations = relations(lists, ({ many }) => ({
    words: many(listWords),
}));

export const listWordsRelations = relations(listWords, ({ one }) => ({
    list: one(lists, { fields: [listWords.listId], references: [lists.id] }),
    word: one(words, { fields: [listWords.wordId], references: [words.id] }),
}));