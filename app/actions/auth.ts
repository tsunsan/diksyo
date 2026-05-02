'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'


export type AuthState = {
    error?: string;
    errorTitle?: string;
    success?: string;
};

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    if (!email || !password) {
        return {
            error: 'Email and password are required.',
            errorTitle: 'ACCESS DENIED'
        }
    }
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

    redirect('/dashboard')
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const confirmPassword = formData.get('confirm-password') as string
    const name = formData.get('name') as string
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
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            },
        },
    })
    if (error) {
        console.error("Supabase Auth Error:", error.message)
        if (error.message === "User already registered") {
            return {
                error: 'Account already exists. Please switch to the Login tab.',
                errorTitle: 'REGISTRATION HALTED'
            }
        }
        return {
            error: error.message,
            errorTitle: 'SYSTEM ERROR'
        }
    }

    return { success: 'Welcome to Diksyo. Rerouting to dashboard...' }
}

export async function requestPasswordReset(prevState: AuthState, formData: FormData): Promise<AuthState> {
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
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`,
    })

    if (error) {
        return {
            error: error.message,
            errorTitle: 'SYSTEM ERROR'
        }
    }

    return { success: 'Reset link dispatched! Check your inbox to proceed.' }
}

export async function updateUserPassword(prevState: AuthState, formData: FormData): Promise<AuthState> {
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

    return { success: 'Password reinforced. Rerouting to dashboard...' }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}