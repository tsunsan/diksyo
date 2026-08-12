import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const hasRedis = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    })
  : null;

// Fallback dummy function for rate limiting
const dummyLimiter = async (identifier: string) => {
  console.warn("Redis credentials missing. Rate limiting bypassed for:", identifier);
  return { success: true, limit: 100, remaining: 100, reset: 0 };
};

// Bot Rate Limiter: Sliding Window (10 requests per 10 seconds per IP)
export const botRateLimit = hasRedis && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "@upstash/bot",
    })
  : { limit: dummyLimiter };

// 24-Hour Cache Layer
const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 Hours

export async function getCachedToolResult(key: string): Promise<any | null> {
  if (!redis) return null;
  try {
    const cached = await redis.get(`bot-cache:${key}`);
    return cached || null;
  } catch (error) {
    console.error("Redis Get Error:", error);
    return null;
  }
}

export async function setCachedToolResult(key: string, value: any): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(`bot-cache:${key}`, value, { ex: CACHE_TTL_SECONDS });
  } catch (error) {
    console.error("Redis Set Error:", error);
  }
}

export async function getModelExhausted(modelId: string): Promise<boolean> {
  if (!redis) return false;
  try {
    const exhausted = await redis.get(`model-exhausted:${modelId}`);
    return !!exhausted;
  } catch {
    return false;
  }
}

export async function setModelExhausted(modelId: string, minutes: number = 60): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(`model-exhausted:${modelId}`, "true", { ex: 60 * minutes });
  } catch {}
}
