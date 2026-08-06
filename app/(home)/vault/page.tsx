import VaultClient from "../../../components/vault";
import { getVaultWords } from "@/app/actions/vault";

export default async function VaultPage() {
  const res = await getVaultWords();
  const initialData = res.success && res.data ? res.data : [];

  return <VaultClient initialData={initialData as any} />;
}
