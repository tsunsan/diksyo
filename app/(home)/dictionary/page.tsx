import DictionaryClient from "@/components/dictionary";

export default async function DictionaryPage({ searchParams }: { searchParams: Promise<{ onboarding?: string }> }) {
  const params = await searchParams;

  return <DictionaryClient isAuthenticated={true} showOnboarding={params.onboarding === "true"} />;
}
