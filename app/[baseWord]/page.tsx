import type { Metadata } from "next";
import { getWordByExactSlug, searchWordsByBaseWord } from "@/app/actions/dictionary";
import BaseWordDisambiguation from "@/components/base-word-disambiguation";
import { notFound, redirect } from "next/navigation";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function toTitleCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ baseWord: string }>;
}): Promise<Metadata> {
  const { baseWord } = await params;
  const entries = await searchWordsByBaseWord(baseWord);

  if (entries.length > 1) {
    return {
      title: `Mga kahulugan ng ${toTitleCase(baseWord)}`,
      description: `Pumili ng tamang kahulugan para sa salitang '${baseWord}' mula sa maramihang entries sa Diksyo.`,
      alternates: {
        canonical: `${siteUrl}/${baseWord}`,
      },
    };
  }

  if (entries.length === 1) {
    return {
      alternates: {
        canonical: `${siteUrl}/salita/${entries[0].slug}`,
      },
    };
  }

  const exactSlugMatch = await getWordByExactSlug(baseWord);

  if (exactSlugMatch) {
    return {
      alternates: {
        canonical: `${siteUrl}/salita/${exactSlugMatch.slug}`,
      },
    };
  }

  return {
    title: "Salita Not Found",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function BaseWordHubPage({
  params,
}: {
  params: Promise<{ baseWord: string }>;
}) {
  const { baseWord } = await params;
  const entries = await searchWordsByBaseWord(baseWord);

  if (entries.length > 1) {
    return (
      <BaseWordDisambiguation
        baseWord={baseWord}
        entries={entries.map((entry) => ({
          id: entry.id,
          slug: entry.slug,
          word: entry.word,
          partOfSpeech: entry.partOfSpeech,
          translation: entry.translation,
        }))}
      />
    );
  }

  if (entries.length === 1) {
    redirect(`/salita/${entries[0].slug}`);
  }

  const exactSlugMatch = await getWordByExactSlug(baseWord);
  if (exactSlugMatch) {
    redirect(`/salita/${exactSlugMatch.slug}`);
  }

  notFound();
}
