import DictionaryDataWrapper from "@/components/dictionary-data-wrapper";

export default async function DictionaryPage({ searchParams }: { searchParams: Promise<{ onboarding?: string, search?: string, saveWordId?: string }> }) {
  const params = await searchParams;

  return (
    <DictionaryDataWrapper 
      showOnboarding={params.onboarding === "true"} 
      initialSearch={params.search}
      initialSaveWordId={params.saveWordId}
    />
  );
}
