'use server'

import { createClient } from '@/utils/supabase/server'
import { withExponentialBackoff } from "@/lib/db-utils"
import { redirect } from 'next/navigation'
import { AuthState } from './auth'
import { db } from "@/db"
import { userProfiles } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function updateProfile(prevState: AuthState, formData: FormData): Promise<AuthState> {
    return withExponentialBackoff(async () => {

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

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
        return { success: 'Profile updated. Please verify your new email address.' }
    }

    return { success: 'Profile successfully updated.' }
    });
}

export async function deleteAccount(prevState: AuthState, formData: FormData): Promise<AuthState> {
    return withExponentialBackoff(async () => {

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated', errorTitle: 'ACCESS DENIED' }
    }

    // Call custom RPC to securely delete the user from auth.users
    const { error } = await supabase.rpc('delete_user')

    if (error) {
        return { error: 'Could not delete account. Please try again later.', errorTitle: 'DELETION FAILED' }
    }

    await supabase.auth.signOut()
    redirect('/login')
    });
}
