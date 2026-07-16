import { Suspense } from "react";
import DictionaryDataWrapper from "@/components/dictionary-data-wrapper";
import { DictionarySkeleton } from "@/components/dictionary-skeleton";

export default async function DictionaryPage({ searchParams }: { searchParams: Promise<{ onboarding?: string }> }) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="p-4 md:p-8 max-w-6xl mx-auto"><DictionarySkeleton /></div>}>
      <DictionaryDataWrapper showOnboarding={params.onboarding === "true"} />
    </Suspense>
  );
}
