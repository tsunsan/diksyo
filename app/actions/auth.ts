'use server'

import { createClient } from '@/utils/supabase/server'
import { withExponentialBackoff } from "@/lib/db-utils"
import { redirect } from 'next/navigation'
import { db } from "@/db"
import { userProfiles } from "@/db/schema"
import { sql } from "drizzle-orm"
import { authRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";


export type AuthState = {
    error?: string;
    errorTitle?: string;
    success?: string;
};

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
    return withExponentialBackoff(async () => {
    
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
    let rlSuccess = true;
    try {
        const result = await authRateLimit.limit(ip);
        rlSuccess = result.success;
    } catch (error) {
        console.warn("Rate limit service unavailable:", error);
    }
    if (!rlSuccess) {
        return { error: 'Too many login attempts. Please wait a minute.', errorTitle: 'RATE LIMIT EXCEEDED' }
    }

    const supabase = await createClient()
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    if (!username || !password) {
        return {
            error: 'Username and password are required.',
            errorTitle: 'ACCESS DENIED'
        }
    }

    const res = await db.execute<{email: string}>(sql`
        SELECT email FROM auth.users WHERE raw_user_meta_data->>'username' = ${username} LIMIT 1
    `)
    
    if (!res || res.length === 0) {
        return {
            error: 'Invalid login credentials.',
            errorTitle: 'ACCESS DENIED'
        }
    }
    
    const email = res[0].email

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
        if (error.message === "Email not confirmed") {
            return {
                error: 'Please check your inbox and confirm your email uplink first.',
                errorTitle: 'ACCESS DENIED'
            }
        }
        if (error.message === "Invalid login credentials") {
            return {
                error: 'Email and password do not match.',
                errorTitle: 'ACCESS DENIED'
            }
        }
        return {
            error: error.message,
            errorTitle: 'SYSTEM ERROR'
        }
    }

    redirect('/dictionary')
    });
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
    return withExponentialBackoff(async () => {
    
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
    let rlSuccess = true;
    try {
        const result = await authRateLimit.limit(ip);
        rlSuccess = result.success;
    } catch (error) {
        console.warn("Rate limit service unavailable:", error);
    }
    if (!rlSuccess) {
        return { error: 'Too many signup attempts. Please wait a minute.', errorTitle: 'RATE LIMIT EXCEEDED' }
    }

    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full-name') as string
    const confirmPassword = formData.get('confirm-password') as string
    const username = formData.get('username') as string
    if (!email || !password) {
        return {
            error: 'Email and password are required.',
            errorTitle: 'VALIDATION FAILED'
        }
    }
    if (password !== confirmPassword) {
        return {
            error: 'Passwords do not match.',
            errorTitle: 'VALIDATION FAILED'
        }
    }
    if(password.length < 8) {
        return {
            error: 'Password must be at least 8 characters long.',
            errorTitle: 'VALIDATION FAILED'
        }
    }
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username,
                full_name: fullName,
            },
        },
    })
    if (error) {
        console.error("Supabase Auth Error:", error.message)
        if (error.message === "User already registered") {
            return {
                error: 'Account already exists (or is linked to Google). Please switch to the Login tab or use Continue with Google.',
                errorTitle: 'REGISTRATION HALTED'
            }
        }
        return {
            error: error.message,
            errorTitle: 'SYSTEM ERROR'
        }
    }

    if (data?.user) {
        try {
            await db.insert(userProfiles).values({
                userId: data.user.id,
                username: username,
                displayName: fullName,
            }).onConflictDoNothing()
        } catch (dbError) {
            console.error("Failed to insert user profile:", dbError)
            // Even if profile creation fails, we allow the signup to proceed.
        }
    }

    return { success: 'Welcome to Diksyo. Rerouting to dictionary...' }
    });
}

export async function requestPasswordReset(prevState: AuthState, formData: FormData): Promise<AuthState> {
    return withExponentialBackoff(async () => {
    
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
    let rlSuccess = true;
    try {
        const result = await authRateLimit.limit(ip);
        rlSuccess = result.success;
    } catch (error) {
        console.warn("Rate limit service unavailable:", error);
    }
    if (!rlSuccess) {
        return { error: 'Too many reset requests. Please wait a minute.', errorTitle: 'RATE LIMIT EXCEEDED' }
    }

    const supabase = await createClient()
    const email = formData.get('email') as string

    if (!email) {
        return {
            error: 'Email is required.',
            errorTitle: 'VALIDATION FAILED'
        }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Change this to your actual production URL later
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
    })

    if (error) {
        return {
            error: error.message,
            errorTitle: 'SYSTEM ERROR'
        }
    }

    return { success: 'Reset link dispatched! Check your inbox to proceed.' }
    });
}

export async function updateUserPassword(prevState: AuthState, formData: FormData): Promise<AuthState> {
    return withExponentialBackoff(async () => {
    
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
    let rlSuccess = true;
    try {
        const result = await authRateLimit.limit(ip);
        rlSuccess = result.success;
    } catch (error) {
        console.warn("Rate limit service unavailable:", error);
    }
    if (!rlSuccess) {
        return { error: 'Too many attempts. Please wait a minute.', errorTitle: 'RATE LIMIT EXCEEDED' }
    }

    const supabase = await createClient()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm-password') as string

    if (!password || !confirmPassword) {
        return {
            error: 'Both password fields are required.',
            errorTitle: 'VALIDATION FAILED'
        }
    }
    if (password !== confirmPassword) {
        return {
            error: 'Passwords do not match.',
            errorTitle: 'VALIDATION FAILED'
        }
    }
    if(password.length < 8) {
        return {
            error: 'Password must be at least 8 characters long.',
            errorTitle: 'VALIDATION FAILED'
        }
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        return {
            error: error.message,
            errorTitle: 'SYSTEM ERROR'
        }
    }

    return { success: 'Password reinforced. Rerouting to dictionary...' }
    });
}

export async function logout() {
    return withExponentialBackoff(async () => {

    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
    });
}