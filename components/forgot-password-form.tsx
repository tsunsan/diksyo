'use client'

import { useActionState, useEffect } from "react"
import { requestPasswordReset } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertTriangle, CheckCircle2, Link } from "lucide-react"

const initialState = { error: '', errorTitle: '', success: '' }

export function ForgotPasswordForm() {
    const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState)

    return (
        <form action={formAction} className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-black uppercase tracking-tight">System Recovery</h1>
                <p className="text-sm text-zinc-600 mt-2 font-medium">
                    Enter your email to receive a secure override link.
                </p>
            </div>

            {state.error && (
                <div className="border-4 border-black bg-red-400 p-3 shadow-[4px_4px_0_0_#000]">
                    <div className="flex items-center gap-2 font-black uppercase text-sm mb-1">
                        <AlertTriangle className="h-4 w-4" /> {state.errorTitle}
                    </div>
                    <p className="text-xs font-bold text-black/80">{state.error}</p>
                </div>
            )}

            {state.success && (
                <div className="border-4 border-black bg-green-400 p-3 shadow-[4px_4px_0_0_#000]">
                    <div className="flex items-center gap-2 font-black uppercase text-sm mb-1">
                        <CheckCircle2 className="h-4 w-4" /> LINK SENT
                    </div>
                    <p className="text-xs font-bold text-black/80">{state.success}</p>
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="email" className="font-black uppercase text-xs">Email Address</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="lakan@diksyo.com"
                    required
                    className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000] focus-visible:ring-0 focus-visible:shadow-[2px_2px_0_0_#000] focus-visible:translate-y-[2px] focus-visible:translate-x-[2px] transition-all"
                />
            </div>

            <Button
                type="submit"
                disabled={isPending || !!state.success}
                className="w-full border-4 border-black bg-black text-white rounded-none shadow-[6px_6px_0_0_#4f46e5] hover:shadow-[2px_2px_0_0_#4f46e5] hover:translate-y-[4px] hover:translate-x-[4px] transition-all font-black uppercase tracking-widest disabled:opacity-50"
            >
                {isPending ? "Transmitting..." : "Send Reset Link"}
            </Button>

            <div className="text-center text-sm font-bold mt-4">
                <Link href="/login" className="underline underline-offset-4 decoration-2 hover:text-indigo-600 transition-colors">
                    Back to Login
                </Link>
            </div>
        </form>
    )
}