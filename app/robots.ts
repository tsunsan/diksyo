import type { MetadataRoute } from 'next'
import { getSiteUrl } from "@/lib/site-url";
 
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dictionary',
        '/profile',
        '/vault',
        '/quiz',
        '/update-password',
        '/forgot-password',
        // Uncached redirect to a random word; the words are all in the sitemap.
        '/salita/random'
      ]
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}