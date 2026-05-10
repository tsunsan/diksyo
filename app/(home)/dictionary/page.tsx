import { searchWords, getUserSavedWordIds } from "@/app/actions/dictionary";
import DictionaryClient from "@/components/dictionary-client";

export default async function DictionaryPage() {
  const initialWords = await searchWords("");
  const initialSavedWordIds = await getUserSavedWordIds();

  return <DictionaryClient initialWords={initialWords as any} initialSavedWordIds={initialSavedWordIds} />;
}
