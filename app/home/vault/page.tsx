import { getVaultWords } from "@/app/actions/vault";
import VaultClient from "../../../components/vault-client";

export default async function VaultPage() {
  const res = await getVaultWords();
  const initialWords = res.success && res.data ? res.data : [];

  return <VaultClient initialWords={initialWords as any} />;
}
