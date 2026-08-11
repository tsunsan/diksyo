import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { createClient, getUser } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ForgotPasswordPage() {
    const supabase = await createClient()
    const { data: { user } } = await getUser()

    if (user) {
        redirect('/dictionary')
    }

    return <ForgotPasswordForm />
}