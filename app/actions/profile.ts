'use server'

import { createClient, getUser } from '@/utils/supabase/server'
import { withExponentialBackoff } from "@/lib/db-utils"
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { AuthState } from './auth'
import { db } from "@/db"
import { userProfiles, userProgress, userAchievements, dailyActivity } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { mutationRateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"

export async function updateProfile(prevState: AuthState, formData: FormData): Promise<AuthState> {
    return withExponentialBackoff(async () => {
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
        let success = true;
        try {
            const result = await mutationRateLimit.limit(ip);
            success = result.success;
        } catch (error) {
            console.warn("Rate limiting service unavailable, bypassing:", error);
        }
        
        if (!success) {
            return { error: "Rate limit exceeded. Please try again later.", errorTitle: "RATE LIMIT EXCEEDED" };
        }

    const supabase = await createClient()
    const { data: { user } } = await getUser()

    if (!user) {
        return { error: 'Not authenticated', errorTitle: 'ACCESS DENIED' }
    }

    const username = formData.get('username') as string
    const email = formData.get('email') as string
    const displayName = formData.get('displayName') as string
    const showAvatar = formData.get('showAvatar') === 'on'

    if (!username || !email || !displayName) {
        return { error: 'Username, Full Name, and Email are required.', errorTitle: 'VALIDATION FAILED' }
    }

    let updates: any = {}
    let needsEmailUpdate = false
    let needsMetadataUpdate = false

    if (email !== user.email) {
        updates.email = email
        needsEmailUpdate = true
    }
    
    if (username !== user.user_metadata?.username) {
        // Check if username is taken in auth.users
        const authRes = await db.execute<{id: string}>(sql`
            SELECT id FROM auth.users WHERE raw_user_meta_data->>'username' = ${username} LIMIT 1
        `)
        if (authRes && authRes.length > 0) {
            return { error: 'Username is already taken.', errorTitle: 'VALIDATION FAILED' }
        }

        // Check if username is taken in userProfiles (just to be absolutely sure)
        const existingProfile = await db.select({ userId: userProfiles.userId }).from(userProfiles).where(eq(userProfiles.username, username)).limit(1)
        if (existingProfile.length > 0 && existingProfile[0].userId !== user.id) {
            return { error: 'Username is already taken.', errorTitle: 'VALIDATION FAILED' }
        }

        updates.data = { username }
        needsMetadataUpdate = true
    }

    if (needsEmailUpdate || needsMetadataUpdate) {
        const { error } = await supabase.auth.updateUser(updates)
        if (error) {
            return { error: error.message, errorTitle: 'UPDATE FAILED' }
        }
    }

    try {
        await db.update(userProfiles).set({
            username: username,
            displayName: displayName,
            showAvatar: showAvatar,
        }).where(eq(userProfiles.userId, user.id))
    } catch (e) {
        return { error: 'Could not update profile information in database.', errorTitle: 'DB ERROR' }
    }

    if (needsEmailUpdate) {
        revalidatePath('/', 'layout')
        return { success: 'Profile updated. Please verify your new email address.' }
    }

    revalidatePath('/', 'layout')
    return { success: 'Profile successfully updated.' }
    });
}

export async function deleteAccount(prevState: AuthState, formData: FormData): Promise<AuthState> {
    return withExponentialBackoff(async () => {
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
        let success = true;
        try {
            const result = await mutationRateLimit.limit(ip);
            success = result.success;
        } catch (error) {
            console.warn("Rate limiting service unavailable, bypassing:", error);
        }
        
        if (!success) {
            return { error: "Rate limit exceeded. Please try again later.", errorTitle: "RATE LIMIT EXCEEDED" };
        }

    const supabase = await createClient()
    const { data: { user } } = await getUser()

    if (!user) {
        return { error: 'Not authenticated', errorTitle: 'ACCESS DENIED' }
    }

    // Delete user data via Drizzle to ensure it's removed even if the RPC is outdated
    try {
        await db.delete(userProgress).where(eq(userProgress.userId, user.id))
        await db.delete(userAchievements).where(eq(userAchievements.userId, user.id))
        await db.delete(dailyActivity).where(eq(dailyActivity.userId, user.id))
        await db.delete(userProfiles).where(eq(userProfiles.userId, user.id))
    } catch (e) {
        console.error("Failed to delete user data via Drizzle:", e)
    }

    // Call custom RPC to securely delete the user from auth.users
    const { error } = await supabase.rpc('delete_user')

    if (error) {
        return { error: 'Could not delete account. Please try again later.', errorTitle: 'DELETION FAILED' }
    }

    await supabase.auth.signOut()
    return { success: 'Account successfully deleted.' }
    });
}
