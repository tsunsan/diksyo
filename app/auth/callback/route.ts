import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dictionary'

    if (code) {
        const supabase = await createClient()
        const { error, data } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data.user) {
            try {
                const { db } = await import('@/db');
                const { userProfiles } = await import('@/db/schema');
                const { eq } = await import('drizzle-orm');
                
                const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, data.user.id)).limit(1);
                
                if (existing.length === 0) {
                    const meta = data.user.user_metadata || {};
                    const avatar_url = meta.avatar_url || meta.picture || null;
                    const full_name = meta.full_name || meta.name || null;
                    
                    const username = `user${Math.floor(Math.random() * 1000000)}`;
                    
                    await db.insert(userProfiles).values({
                        userId: data.user.id,
                        username: username,
                        displayName: full_name || username,
                        avatarUrl: avatar_url,
                    }).onConflictDoNothing();
                }
            } catch (e) {
                console.error("Error creating profile in auth callback:", e);
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}