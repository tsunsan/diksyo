import { AppSidebar } from "@/components/app-sidebar"; 
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || "User";
  const email = user.email || "";

  return <AppSidebar user={{ username, email }}>{children}</AppSidebar>;
}