import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const POS_COLORS: Record<string, { bg: string; text: string }> = {
  // Bases (Filipino)
  "PANGNGALAN": { bg: "#7C3AED", text: "#fff" },
  "PANG-URI": { bg: "#0057FF", text: "#fff" },
  "PANDIWA": { bg: "#FF6D00", text: "#fff" },
  "PANG-ABAY": { bg: "#00C853", text: "#000" },
  "PANGHALIP": { bg: "#FF1744", text: "#fff" },
  "DAGLAT": { bg: "#57534E", text: "#fff" },
  "PANDAMDAM": { bg: "#EAB308", text: "#000" },
  "PANGATNIG": { bg: "#EC4899", text: "#fff" },
  "PANG-UKOL": { bg: "#06B6D4", text: "#fff" },
  "PANLAPI": { bg: "#8B5CF6", text: "#fff" },
  "PANTUKOY": { bg: "#14B8A6", text: "#fff" },
  "PARIRALA / IDYOMA": { bg: "#F43F5E", text: "#fff" },

  // Bases (English)
  "NOUN": { bg: "#7C3AED", text: "#fff" },
  "ADJECTIVE": { bg: "#0057FF", text: "#fff" },
  "VERB": { bg: "#FF6D00", text: "#fff" },
  "ADVERB": { bg: "#00C853", text: "#000" },
  "PRONOUN": { bg: "#FF1744", text: "#fff" },
  "ABBREVIATION": { bg: "#57534E", text: "#fff" },
  "INTERJECTION": { bg: "#EAB308", text: "#000" },
  "CONJUNCTION": { bg: "#EC4899", text: "#fff" },
  "PREPOSITION": { bg: "#06B6D4", text: "#fff" },
  "ARTICLE": { bg: "#14B8A6", text: "#fff" },
  "PHRASE / IDIOM": { bg: "#F43F5E", text: "#fff" },
  "PARTICLE": { bg: "#64748B", text: "#fff" },
 
  // Combinations (Filipino)
  "DAGLAT / PANG-ABAY": { bg: "#57534E", text: "#fff" },
  "DAGLAT / PANG-URI": { bg: "#57534E", text: "#fff" },
  "PANDAMDAM / PANG-ABAY": { bg: "#EAB308", text: "#000" },
  "PANDAMDAM / PANG-URI": { bg: "#EAB308", text: "#000" },
  "PANDIWA / PANG-URI": { bg: "#FF6D00", text: "#fff" },
  "PANDIWA / PANGHALIP": { bg: "#FF6D00", text: "#fff" },
  "PANDIWA / PANGNGALAN": { bg: "#FF6D00", text: "#fff" },
  "PANG-ABAY / PANG-URI": { bg: "#00C853", text: "#000" },
  "PANG-ABAY / PANGATNIG": { bg: "#00C853", text: "#000" },
  "PANG-ABAY / PANGHALIP": { bg: "#00C853", text: "#000" },
  "PANG-ABAY / PANGNGALAN": { bg: "#00C853", text: "#000" },
  "PANG-URI / PANGHALIP": { bg: "#0057FF", text: "#fff" },
  "PANG-URI / PANGNGALAN": { bg: "#0057FF", text: "#fff" },
  "PANGATNIG / PANGNGALAN": { bg: "#EC4899", text: "#fff" },
  "PANGHALIP / PANGNGALAN": { bg: "#FF1744", text: "#fff" },

  // Combinations (English)
  "ADJECTIVE / ABBREVIATION": { bg: "#0057FF", text: "#fff" },
  "ADJECTIVE / ADVERB": { bg: "#0057FF", text: "#fff" },
  "ADJECTIVE / INTERJECTION": { bg: "#0057FF", text: "#fff" },
  "ADJECTIVE / NOUN": { bg: "#0057FF", text: "#fff" },
  "ADJECTIVE / NUMERAL": { bg: "#0057FF", text: "#fff" },
  "ADJECTIVE / PRONOUN": { bg: "#0057FF", text: "#fff" },
  "ADJECTIVE / VERB": { bg: "#0057FF", text: "#fff" },
  "ADVERB / ABBREVIATION": { bg: "#00C853", text: "#000" },
  "ADVERB / CONJUNCTION": { bg: "#00C853", text: "#000" },
  "ADVERB / INTERJECTION": { bg: "#00C853", text: "#000" },
  "ADVERB / PHRASE": { bg: "#00C853", text: "#000" },
  "ADVERB / PRONOUN": { bg: "#00C853", text: "#000" },
  "INTERJECTION / PHRASE": { bg: "#EAB308", text: "#000" },
  "INTERJECTION / VERB": { bg: "#EAB308", text: "#000" },
  "NOUN / ADVERB": { bg: "#7C3AED", text: "#fff" },
  "NOUN / VERB": { bg: "#7C3AED", text: "#fff" },
  "PHRASE / ABBREVIATION": { bg: "#F43F5E", text: "#fff" },
  "PHRASE / ADVERB": { bg: "#F43F5E", text: "#fff" },
  "PHRASE / INTERJECTION": { bg: "#F43F5E", text: "#fff" },
  "PHRASE / NOUN": { bg: "#F43F5E", text: "#fff" },
  "PHRASE / VERB": { bg: "#F43F5E", text: "#fff" },
  "PRONOUN / ADVERB": { bg: "#FF1744", text: "#fff" },
  "PRONOUN / DETERMINER": { bg: "#FF1744", text: "#fff" },
  "PRONOUN / NOUN": { bg: "#FF1744", text: "#fff" },
  "PRONOUN / VERB": { bg: "#FF1744", text: "#fff" },
};

export const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "#00C853",
  INTERMEDIATE: "#FDE047",
  ADVANCED: "#FF6D00",
};
