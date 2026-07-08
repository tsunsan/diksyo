"use client"

import { cn } from "@/lib/utils"
import { signup, type AuthState } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const initialState: AuthState = {
  error: undefined,
  errorTitle: undefined,
  success: undefined,
}

export function SignupForm({
                             className,
                             ...props
                           }: React.ComponentProps<"div">) {

  const router = useRouter()
  const [state, formAction, isPending] = useActionState(signup, initialState)

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  useEffect(() => {
    if (state?.success) {
      toast.success("ACCOUNT CREATED", {
        description: state.success,
        duration: 3000,
        unstyled: true,
        classNames: {
          toast: "flex items-center gap-4 w-full rounded-none border-4 border-black bg-green-400 p-4 text-black shadow-[8px_8px_0_0_#000]",
          title: "text-lg font-black uppercase tracking-tighter",
          description: "font-bold text-xs text-black/90 uppercase",
          icon: "text-black w-6 h-6",
        },
      })

      const timer = setTimeout(() => {
        router.push('/dictionary?onboarding=true')
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [state?.success, router])

  return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="rounded-none border-4 border-black shadow-[8px_8px_0_0_#000]">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-black uppercase tracking-tighter italic">
              Create Account
            </CardTitle>
            <CardDescription className="text-sm font-bold text-zinc-500 uppercase">
              Start your journey from Baguhan to Alamat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction}>
              <div className="grid gap-4">

                {state?.error && (
                    <Alert className="rounded-none border-2 border-black shadow-[4px_4px_0_0_#000] bg-red-400 text-black mb-2">
                      {state.errorTitle === 'SYSTEM ERROR' || !state.errorTitle ? (
                          <AlertCircle className="h-4 w-4 stroke-black" />
                      ) : (
                          <ShieldAlert className="h-4 w-4 stroke-black" />
                      )}
                      <AlertTitle className="font-black uppercase tracking-tighter text-black">
                        {state.errorTitle || "ERROR"}
                      </AlertTitle>
                      <AlertDescription className="font-bold text-zinc-50 text-xs uppercase leading-tight">
                        {state.error}
                      </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="full-name" className="font-bold uppercase text-xs">Full Name</Label>
                  <Input
                      id="full-name"
                      name="full-name"
                      type="text"
                      placeholder="Juan Dela Cruz"
                      required
                      className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:bg-yellow-100 placeholder:text-zinc-400"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username" className="font-bold uppercase text-xs">Username</Label>
                  <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="juandelacruz"
                      required
                      className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:bg-yellow-100 placeholder:text-zinc-400"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="font-bold uppercase text-xs">Email Address</Label>
                  <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:bg-yellow-100 placeholder:text-zinc-400"
                  />
                </div>

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="password"
                             className="font-bold uppercase text-xs">Password</Label>
                      <Input
                          name="password"
                          id="password"
                          type="password"
                          required
                          className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:bg-yellow-100"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password"
                             className="font-bold uppercase text-xs">Confirm</Label>
                      <Input
                          name="confirm-password"
                          id="confirm-password"
                          type="password"
                          required
                          className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:bg-yellow-100"
                      />
                    </div>
                  </div>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase italic -mt-2">
                    Must be at least 8 characters long.
                  </p>
                </div>

                <Button
                    type="submit"
                    disabled={isPending}
                    className="mt-2 rounded-none border-2 border-black bg-yellow-400 font-bold text-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "CREATING ACCOUNT..." : "SIGN UP"}
                </Button>
                <div className="text-center pt-1 text-[10px] font-bold uppercase text-black">
                  Already have an account?{" "}
                  <Link href="/login"
                        className="underline decoration-yellow-400 decoration-2 underline-offset-4 hover:bg-yellow-400 hover:decoration-transparent transition-all px-1 -mr-1">
                    Log in
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <div
              className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t-2 after:border-black">
            <span className="relative z-10 bg-zinc-50 px-2 font-black uppercase text-xs">Or sign up with</span>
          </div>

          <Button
              variant="outline"
              type="button"
              onClick={handleGoogleLogin}
              className="w-full rounded-none border-2 border-black bg-white font-bold shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase"
          >
            <svg className="mr-2 size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4" />
              <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853" />
              <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05" />
              <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>
        </div>

        <div className="text-center flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase text-zinc-500 leading-relaxed">
            By proceeding, you agree to our{" "}
            <Link href="/terms" className="underline decoration-zinc-500 decoration-2 underline-offset-4 hover:text-black transition-colors">
              Terms of Service
            </Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline decoration-zinc-500 decoration-2 underline-offset-4 hover:text-black transition-colors">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
  )
}