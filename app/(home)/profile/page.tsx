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
    <div className="relative min-h-screen">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.07] pointer-events-none"
        style={{ 
          backgroundImage: 'url("/images/Late for Class.svg"), url("/images/Meela Pantalones.svg"), url("/images/Polka Pup.svg"), url("/images/Runner.svg"), url("/images/Ecto Plasma.svg"), url("/images/Consumer.svg")',
          backgroundSize: '400px, 350px, 300px, 450px, 350px, 400px',
          backgroundPosition: '0px 0px, 200px 200px, 400px 50px, 100px 350px, 500px 150px, 300px 400px',
          backgroundRepeat: 'repeat'
        }}
      />
      
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-8 px-4 sm:px-6 lg:px-8 py-8">
        <header className="bg-white p-6 border-4 border-black shadow-[8px_8px_0_0_#000]">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-2">Profile</h1>
          <p className="font-bold text-zinc-600 uppercase">Manage your account settings</p>
        </header>
        
        <ProfileForm user={{ username, email, displayName, showAvatar, isGoogleConnected }} />
      </div>
    </div>
  )
}
