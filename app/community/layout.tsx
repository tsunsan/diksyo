import { AppSidebar } from "@/components/app-sidebar"; 
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { userProfiles, levels } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import Link from "next/link";

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFBF0] p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
              <div className="mb-6 flex gap-4">
                  <Link href="/" className="inline-flex items-center gap-1 border-2 border-black bg-yellow-300 px-3 py-1.5 text-xs font-black uppercase tracking-tight shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                      ← Back Home
                  </Link>
              </div>
              {children}
          </div>
      </div>
    );
  }

  const email = user.email || "";
  let username = "User";
  let avatar_url = null;
  let show_avatar = true;
  let levelName = "BAGUHAN";
  let levelColor = "#8B5E3C";
  let levelIndex = 1;

  try {
      const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).limit(1);
      if (profile.length > 0) {
          username = profile[0].username || "User";
          show_avatar = profile[0].showAvatar ?? true;
          
          const xp = profile[0].xp || 0;
          const allLevels = await db.select().from(levels).orderBy(asc(levels.minXp));
          let currentLevel = allLevels.length > 0 ? allLevels[0].name : "BAGUHAN";
          let currentColor = allLevels.length > 0 ? allLevels[0].color : "#8B5E3C";
          let currentIndex = 1;
          for (let i = 0; i < allLevels.length; i++) {
              if (xp >= allLevels[i].minXp) {
                  currentLevel = allLevels[i].name;
                  currentColor = allLevels[i].color;
                  currentIndex = i + 1;
              }
          }
          levelName = currentLevel;
          levelColor = currentColor;
          levelIndex = currentIndex;

          if (show_avatar) {
              avatar_url = profile[0].avatarUrl;
          }
      } else {
          username = user.user_metadata?.username || user.email?.split('@')[0] || "User";
          avatar_url = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
      }
  } catch (e) {
      console.error("Error fetching user profile for layout:", e);
      username = user.user_metadata?.username || user.email?.split('@')[0] || "User";
  }

  return <AppSidebar user={{ username, email, avatar_url, levelName, levelColor, levelIndex }}>{children}</AppSidebar>;
}
