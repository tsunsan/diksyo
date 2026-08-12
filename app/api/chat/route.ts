import { streamText, tool, convertToModelMessages, isStepCount } from 'ai';
import { google } from '@ai-sdk/google';
import { createFallbackModel } from '@/lib/fallback-model';
import { botRateLimit, getCachedToolResult, setCachedToolResult } from '@/lib/rate-limit-bot';
import { db } from '@/db';
import { words } from '@/db/schema';
import { ilike, or } from 'drizzle-orm';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await botRateLimit.limit(ip);
  
  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const body = await req.json();
  const rawMessages = Array.isArray(body.messages)
    ? body.messages
    : body.messages
    ? [body.messages]
    : body.message
    ? Array.isArray(body.message)
      ? body.message
      : [body.message]
    : [];

  let modelMessages: any[] = [];
  try {
    const sanitizedMessages = rawMessages.map((m: any) => {
      if (typeof m === 'string') {
        return { role: 'user', parts: [{ type: 'text', text: m }] };
      }
      const textContent = typeof m.content === 'string' ? m.content : m.text || '';
      const parts = Array.isArray(m.parts) && m.parts.length > 0
        ? m.parts
        : [{ type: 'text', text: textContent }];
      return {
        id: m.id || String(Math.random()),
        role: m.role || 'user',
        content: textContent,
        parts,
      };
    });
    modelMessages = await convertToModelMessages(sanitizedMessages);
  } catch (err) {
    console.warn("convertToModelMessages fallback due to:", err);
    modelMessages = rawMessages.map((m: any) => ({
      role: m.role === 'tool' ? 'user' : (m.role || 'user'),
      content: typeof m.content === 'string' ? m.content : m.text || JSON.stringify(m),
    }));
  }

  const result = streamText({
    model: createFallbackModel([
      google('gemini-3.5-flash-lite'),
      google('gemini-3.1-flash-lite'),
      google('gemma-4-31b-it')
    ]),
    messages: modelMessages,
    stopWhen: isStepCount(5),
    system: `You are Diksyo AI, a friendly, expert Tagalog language learning assistant for the diksyo app.

STRICT DOMAIN GUARDRAILS:
- You MUST restrict your responses EXCLUSIVELY to Tagalog language, grammar, Filipino culture, translations, and linguistics.
- If a user asks about programming, math, politics, science, or ANY unrelated topic, you MUST firmly but politely decline and remind them you are a Tagalog dictionary assistant.
- Never write code or answer generic non-language questions.

CRITICAL INSTRUCTIONS:
1. ALWAYS use the lookupWord tool first to search the database when asked about a Tagalog word, phrase, or translation.
2. If the tool returns word details from the database, summarize and supplement them with helpful learning insights.
3. If the tool returns "notFound: true", DO NOT STOP. You MUST provide a thorough, complete, and engaging explanation of the word from your general knowledge (including meaning, pronunciation, usage, etymology, and example sentences).

FORMATTING RULES:
- Use emojis naturally to make the tone friendly, engaging, and visually appealing (e.g. 🇵🇭, 💡, 📚, ✨).
- Structure your response cleanly using markdown headers (###), bullet points, and bold text for emphasis.
- Organize information logically (e.g. Definition, Pronunciation, Example Sentences).

At the VERY END of your response, ALWAYS provide 2-3 contextual follow-up questions for the user to click. Format them EXACTLY like this on their own lines:
[FOLLOW-UP: Use it in a sentence]
[FOLLOW-UP: What is the root word?]
[FOLLOW-UP: What are similar words?]`,
    tools: {
      lookupWord: tool({
        description: 'Look up a Tagalog or English word in the diksyo dictionary database to get its definition, pronunciation, and examples.',
        inputSchema: z.object({
          word: z.string().describe('The Tagalog or English word to look up'),
        }),
        execute: async ({ word }) => {
          try {
            // 1. Check Edge Cache first (guarantees 0ms latency for repeated queries)
            const cachedResult = await getCachedToolResult(word);
            if (cachedResult) {
              return cachedResult;
            }

            // 2. Query Database
            const dbResults = await db
              .select({
                word: words.word,
                translation: words.translation,
                meaningFilipino: words.meaningFilipino,
                posEnglish: words.posEnglish,
                pronunciation: words.pronunciation,
                usageExamples: words.usageExamples,
              })
              .from(words)
              .where(
                or(
                  ilike(words.word, `%${word}%`),
                  ilike(words.translation, `%${word}%`),
                  ilike(words.slug, `%${word}%`)
                )
              )
              .limit(3);
            
            if (dbResults.length === 0) {
              const fallback = { notFound: true, message: `Could not find "${word}" in Supabase database.` };
              await setCachedToolResult(word, fallback);
              return fallback;
            }
            
            // 3. Cache and Return
            await setCachedToolResult(word, dbResults);
            return dbResults;
          } catch (e) {
            console.error("Tool execution error:", e);
            return { notFound: true, message: 'Database query error.' };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
