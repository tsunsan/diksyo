'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) {
        redirect('/error')
    }

    // TODO: "redirect to the page the user was trying to access before being prompted to log in"
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm-password') as string
    const name = formData.get('name') as string

    // TODO: EMAIL AND PASSWORD DO NOT MATCH
    if (password !== confirmPassword) {
        redirect('/error?message=Passwords do not match')
    }

    if(password.length < 8) {
        redirect('/error?message=Password must be at least 8 characters long')
    }

    // TODO: EMAIL AND PASSWORD ARE REQUIRED
    if (!email || !password) {
        console.error("Missing credentials in formData")
        return redirect('/error?message=Email and Password are required')
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
            // TODO: "redirect to the login page with a message prompting them to sign in instead"
            redirect('/login?message=Account already exists. Please sign in.')
        }
        redirect(`/error?message=${error.message}`)
    }

    // TODO: "redirect to a page instructing the user to check their email for a confirmation link"
    redirect('/login?message=Check your email to confirm')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}