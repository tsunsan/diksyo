import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/profile-form"
import { db } from "@/db"
import { userProfiles } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  let username = "User"
  let displayName = "User"
  let showAvatar = true
  
  const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).limit(1)
  if (profile.length > 0) {
      username = profile[0].username || "User"
      displayName = profile[0].displayName || username
      showAvatar = profile[0].showAvatar ?? true
  } else {
      username = user.user_metadata?.username || user.email?.split('@')[0] || "User"
      displayName = user.user_metadata?.full_name || username
  }

  const email = user.email || ""
  
  const isGoogleConnected = user.identities?.some(id => id.provider === 'google') || false

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-2">Profile</h1>
        <p className="font-bold text-zinc-500 uppercase">Manage your account settings</p>
      </header>
      
      <ProfileForm user={{ username, email, displayName, showAvatar, isGoogleConnected }} />
    </div>
  )
}
