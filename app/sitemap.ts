import type { MetadataRoute } from "next";
import { db } from "@/db";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const revalidate = 86400; // Cache sitemap for 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await db.query.words.findMany({
    columns: {
      slug: true,
      word: true,
    },
    orderBy: (word, { asc }) => [asc(word.word), asc(word.slug)],
  });
  const now = new Date();

  const baseWordCounts = new Map<string, number>();
  for (const entry of entries) {
    const baseWord = entry.word.toLowerCase();
    baseWordCounts.set(baseWord, (baseWordCounts.get(baseWord) || 0) + 1);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/salita`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact-us`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const wordRoutes: MetadataRoute.Sitemap = entries.map((entry) => ({
    url: `${siteUrl}/salita/${entry.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const disambiguationRoutes: MetadataRoute.Sitemap = [...baseWordCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([baseWord]) => ({
      url: `${siteUrl}/salita/${baseWord}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...staticRoutes, ...wordRoutes, ...disambiguationRoutes];
}
