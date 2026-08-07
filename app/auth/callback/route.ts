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
            let isNewUser = false;
            try {
                const { db } = await import('@/db');
                const { userProfiles } = await import('@/db/schema');
                const { eq } = await import('drizzle-orm');
                
                const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, data.user.id)).limit(1);
                
                const meta = data.user.user_metadata || {};
                const googleIdentity = data.user.identities?.find((id: any) => id.provider === 'google');
                const googleMeta = googleIdentity?.identity_data || {};
                
                const avatar_url = meta.avatar_url || meta.picture || googleMeta.avatar_url || googleMeta.picture || null;
                const full_name = meta.full_name || meta.name || googleMeta.full_name || googleMeta.name || null;
                
                if (existing.length === 0) {
                    isNewUser = true;
                    const username = `user${Math.floor(Math.random() * 1000000)}`;
                    
                    await db.insert(userProfiles).values({
                        userId: data.user.id,
                        username: username,
                        displayName: full_name || username,
                        avatarUrl: avatar_url,
                    }).onConflictDoNothing();
                } else if (avatar_url && existing[0].avatarUrl !== avatar_url) {
                    await db.update(userProfiles)
                        .set({ avatarUrl: avatar_url })
                        .where(eq(userProfiles.userId, data.user.id));
                }
            } catch (e) {
                console.error("Error creating profile in auth callback:", e);
            }

            // For new users landing on the dictionary, append onboarding flag
            let redirectPath = next;
            if (isNewUser && (next === '/dictionary' || next === '/')) {
                redirectPath = '/dictionary?onboarding=true';
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${redirectPath}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
            } else {
                return NextResponse.redirect(`${origin}${redirectPath}`)
            }
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}