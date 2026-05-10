import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || "User"
  const email = user.email || ""

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-2">Profile</h1>
        <p className="font-bold text-zinc-500 uppercase">Manage your account settings</p>
      </header>
      
      <ProfileForm user={{ username, email }} />
    </div>
  )
}
