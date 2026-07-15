import { Suspense } from "react";
import DictionaryDataWrapper from "@/components/dictionary-data-wrapper";
import { SkeletonCard } from "@/components/ui/skeleton";

export default async function DictionaryPage({ searchParams }: { searchParams: Promise<{ onboarding?: string }> }) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="p-4 md:p-8 max-w-6xl mx-auto"><SkeletonCard className="h-[600px]" /></div>}>
      <DictionaryDataWrapper showOnboarding={params.onboarding === "true"} />
    </Suspense>
  );
}
