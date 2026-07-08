'use client'

import { useActionState, useEffect } from "react"
import { updateUserPassword } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

const initialState = { error: '', errorTitle: '', success: '' }

export function UpdatePasswordForm() {
    const [state, formAction, isPending] = useActionState(updateUserPassword, initialState)
    const router = useRouter()
    const searchParams = useSearchParams()

    // Check the URL for Supabase magic link errors
    const urlErrorCode = searchParams.get('error_code')
    const isExpired = urlErrorCode === 'otp_expired'

    useEffect(() => {
        if (state?.success) {
            toast.success("PASSWORD UPDATED", {
                description: state.success,
                duration: 3000,
            })
            const timer = setTimeout(() => router.push('/dictionary'), 2000)
            return () => clearTimeout(timer)
        }
    }, [state?.success, router])

    return (
        <form action={formAction} className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-black uppercase tracking-tight">Update Password</h1>
                <p className="text-sm text-zinc-600 mt-2 font-medium">
                    Enter your new password below.
                </p>
            </div>

            {/* ERROR DISPLAY: Handles both URL errors and Form Submission errors */}
            {(state?.error || isExpired) && (
                <div className="border-4 border-black bg-red-400 p-3 shadow-[4px_4px_0_0_#000]">
                    <div className="flex items-center gap-2 font-black uppercase text-sm mb-1">
                        <AlertTriangle className="h-4 w-4" />
                        {isExpired ? 'LINK EXPIRED' : (state.errorTitle || 'ERROR')}
                    </div>
                    <p className="text-xs font-bold text-black/80">
                        {isExpired
                            ? "This link is invalid or has already been used. Please return to the recovery page and request a new one."
                            : state.error}
                    </p>
                </div>
            )}

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="password" className="font-black uppercase text-xs">New Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        disabled={isExpired}
                        className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000] focus-visible:ring-0 focus-visible:shadow-[2px_2px_0_0_#000] focus-visible:translate-y-[2px] focus-visible:translate-x-[2px] transition-all disabled:opacity-50"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirm-password" className="font-black uppercase text-xs">Confirm Password</Label>
                    <Input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        required
                        disabled={isExpired}
                        className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000] focus-visible:ring-0 focus-visible:shadow-[2px_2px_0_0_#000] focus-visible:translate-y-[2px] focus-visible:translate-x-[2px] transition-all disabled:opacity-50"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isPending || !!state?.success || isExpired}
                className="w-full border-4 border-black bg-black text-white rounded-none shadow-[6px_6px_0_0_#f43f5e] hover:shadow-[2px_2px_0_0_#f43f5e] hover:translate-y-[4px] hover:translate-x-[4px] transition-all font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? "SAVING..." : "SAVE NEW PASSWORD"}
            </Button>

            {/* Helpful fallback link if they are stuck with a dead token */}
            {isExpired && (
                <div className="text-center text-sm font-bold mt-2">
                    <Link href="/forgot-password" className="underline underline-offset-4 decoration-2 hover:text-indigo-600 transition-colors">
                        Request New Link
                    </Link>
                </div>
            )}
        </form>
    )
}