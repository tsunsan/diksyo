import { LoginForm } from "@/components/login-form"
import { createClient, getUser } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
    const supabase = await createClient()
    const { data: { user } } = await getUser()

    if (user) {
        redirect('/dictionary')
    }

    return (
        <LoginForm />
    )
}