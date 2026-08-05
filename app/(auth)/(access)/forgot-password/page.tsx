import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ForgotPasswordPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/dictionary')
    }

    return <ForgotPasswordForm />
}