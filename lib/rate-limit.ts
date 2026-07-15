import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const hasRedis = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    })
  : null;

// Fallback dummy function
const dummyLimiter = async (identifier: string) => {
  console.warn("Redis credentials missing. Rate limiting bypassed for:", identifier);
  return { success: true, limit: 100, remaining: 100, reset: 0 };
};

// 1. Search & Lookups (50 requests per 10 seconds)
export const searchRateLimit = hasRedis && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(50, "10 s"),
      ephemeralCache: new Map(),
      analytics: false,
      prefix: "@upstash/search",
    })
  : { limit: dummyLimiter };

// 2. Authentication (5 requests per 1 minute - strict)
export const authRateLimit = hasRedis && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(5, "1 m"),
      analytics: false,
      prefix: "@upstash/auth",
    })
  : { limit: dummyLimiter };

// 3. Database Mutations & Heavy Queries (10 requests per 10 seconds)
export const mutationRateLimit = hasRedis && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(10, "10 s"),
      analytics: false,
      prefix: "@upstash/mutation",
    })
  : { limit: dummyLimiter };
