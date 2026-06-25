export function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;

  const resolved = envUrl || vercelUrl;

  if (resolved) {
    return resolved.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  throw new Error("Missing site URL. Set NEXT_PUBLIC_SITE_URL (or SITE_URL) in production.");
}
