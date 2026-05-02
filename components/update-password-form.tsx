'use client'

import { useActionState, useEffect } from "react"
import { updateUserPassword } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const initialState = { error: '', errorTitle: '', success: '' }

export function UpdatePasswordForm() {
    const [state, formAction, isPending] = useActionState(updateUserPassword, initialState)
    const router = useRouter()

    useEffect(() => {
        if (state.success) {
            toast.success(state.success, {
                className: 'border-4 border-black bg-green-400 font-mono font-black uppercase shadow-[4px_4px_0_0_#000] rounded-none'
            })
            const timer = setTimeout(() => router.push('/dashboard'), 2000)
            return () => clearTimeout(timer)
        }
    }, [state.success, router])

    return (
        <form action={formAction} className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-black uppercase tracking-tight">Reinforce Security</h1>
                <p className="text-sm text-zinc-600 mt-2 font-medium">
                    Input your new credentials below.
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

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="password" className="font-black uppercase text-xs">New Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000] focus-visible:ring-0 focus-visible:shadow-[2px_2px_0_0_#000] focus-visible:translate-y-[2px] focus-visible:translate-x-[2px] transition-all"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirm-password" className="font-black uppercase text-xs">Confirm Password</Label>
                    <Input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        required
                        className="border-4 border-black rounded-none shadow-[4px_4px_0_0_#000] focus-visible:ring-0 focus-visible:shadow-[2px_2px_0_0_#000] focus-visible:translate-y-[2px] focus-visible:translate-x-[2px] transition-all"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isPending || !!state.success}
                className="w-full border-4 border-black bg-black text-white rounded-none shadow-[6px_6px_0_0_#f43f5e] hover:shadow-[2px_2px_0_0_#f43f5e] hover:translate-y-[4px] hover:translate-x-[4px] transition-all font-black uppercase tracking-widest disabled:opacity-50"
            >
                {isPending ? "Encrypting..." : "Save New Password"}
            </Button>
        </form>
    )
}