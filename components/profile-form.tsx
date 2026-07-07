"use client"

import { useActionState, useEffect } from "react"
import { updateProfile, deleteAccount } from "@/app/actions/profile"
import { AuthState } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AlertCircle, ShieldAlert, TriangleAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/utils/supabase/client"

const initialState: AuthState = {
  error: undefined,
  errorTitle: undefined,
  success: undefined,
}

export function ProfileForm({ user }: { user: { username: string; email: string; displayName: string; showAvatar: boolean; isGoogleConnected: boolean } }) {
  const [updateState, updateAction, isUpdating] = useActionState(updateProfile, initialState)
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteAccount, initialState)

  useEffect(() => {
    if (updateState?.success) {
      toast.success("PROFILE UPDATED", {
        description: updateState.success,
        duration: 3000,
        unstyled: true,
        classNames: {
          toast: "flex items-center gap-4 w-full rounded-none border-4 border-black bg-green-400 p-4 text-black shadow-[8px_8px_0_0_#000]",
          title: "text-lg font-black uppercase tracking-tighter",
          description: "font-bold text-xs text-black/90 uppercase",
          icon: "text-black w-6 h-6",
        },
      })
    }
  }, [updateState?.success])
  
  useEffect(() => {
    if (deleteState?.error) {
       toast.error(deleteState.errorTitle || "ERROR", {
        description: deleteState.error,
        duration: 4000,
        unstyled: true,
        classNames: {
          toast: "flex items-center gap-4 w-full rounded-none border-4 border-black bg-red-400 p-4 text-black shadow-[8px_8px_0_0_#000]",
          title: "text-lg font-black uppercase tracking-tighter",
          description: "font-bold text-xs text-black/90 uppercase",
          icon: "text-black w-6 h-6",
        },
      })
    }
  }, [deleteState?.error])

  return (
    <>
      {/* Update Profile Section */}
      <section className="border-4 border-black bg-white p-6 md:p-8 shadow-[8px_8px_0_0_#000]">
        <h2 className="text-xl font-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-2">
          Update Information
        </h2>

        <form action={updateAction} className="flex flex-col gap-6">
          {updateState?.error && (
            <Alert className="rounded-none border-2 border-black shadow-[4px_4px_0_0_#000] bg-orange-400 text-black mb-2">
              <TriangleAlert className="h-4 w-4 stroke-black" />
              <AlertTitle className="font-black uppercase tracking-tighter text-black">
                {updateState.errorTitle || "ERROR"}
              </AlertTitle>
              <AlertDescription className="font-bold text-black/90 text-xs uppercase leading-tight">
                {updateState.error}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="displayName" className="font-bold uppercase text-xs">Full Name</Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              defaultValue={user.displayName}
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
              defaultValue={user.username}
              required
              className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:bg-yellow-100 placeholder:text-zinc-400"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="font-bold uppercase text-xs">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email}
              required
              className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:bg-yellow-100 placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-3 bg-zinc-50 border-2 border-black p-4">
            <input 
               type="checkbox" 
               id="showAvatar" 
               name="showAvatar" 
               defaultChecked={user.showAvatar}
               className="w-5 h-5 accent-yellow-400 border-2 border-black" 
               disabled={!user.isGoogleConnected}
            />
            <Label htmlFor="showAvatar" className={`font-bold uppercase text-xs ${!user.isGoogleConnected ? 'text-zinc-400' : 'text-black'}`}>
               Display Google Profile Picture
               {!user.isGoogleConnected && " (Connect Google first)"}
            </Label>
          </div>

          <Button 
            type="submit" 
            disabled={isUpdating}
            className="rounded-none border-4 border-black bg-yellow-400 text-black font-black uppercase hover:bg-yellow-300 hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0_0_#000] hover:shadow-none transition-all mt-2 active:bg-yellow-500"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </section>

      {/* Google Connect Section */}
      <section className="border-4 border-black bg-blue-50 p-6 md:p-8 shadow-[8px_8px_0_0_#000]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="flex-1 text-center sm:text-left">
             <h2 className="text-xl font-black uppercase tracking-tighter text-blue-700 mb-2">
               Google Integration
             </h2>
             {user.isGoogleConnected ? (
               <p className="font-bold text-sm text-blue-800 uppercase">
                 You are connected to Google! Your profile picture is synced. Use the setting above to toggle its visibility.
               </p>
             ) : (
               <p className="font-bold text-sm text-blue-800 uppercase">
                 Connect your Google account to instantly sync your profile picture and personalize your dictionary experience!
               </p>
             )}
          </div>
          <div className="shrink-0 flex flex-col gap-2">
             <Button
               type="button"
               disabled={user.isGoogleConnected}
               onClick={async () => {
                 const supabase = createClient()
                 const { error } = await supabase.auth.linkIdentity({
                     provider: 'google',
                     options: { redirectTo: `${window.location.origin}/auth/callback` }
                 })
                 if (error) { toast.error("Could not connect to Google.", { unstyled: true, classNames: { toast: "border-4 border-black bg-red-400 p-4 text-black shadow-[8px_8px_0_0_#000]" } }) }
               }}
               className="rounded-none border-4 border-black bg-white text-black font-black uppercase shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-100 disabled:bg-green-400 disabled:text-black disabled:shadow-[4px_4px_0_0_#000]"
             >
               {user.isGoogleConnected ? "✓ Connected" : "Connect Google"}
             </Button>
          </div>
        </div>
      </section>

      {/* Danger Zone Section */}
      <section className="border-4 border-black bg-red-50 p-6 md:p-8 shadow-[8px_8px_0_0_#000]">
        <h2 className="text-xl font-black uppercase tracking-tighter text-red-600 mb-6 border-b-4 border-red-200 pb-2">
          Danger Zone
        </h2>
        
        <div className="flex flex-col gap-4">
          <p className="font-bold text-sm text-red-700 uppercase">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          
          <form action={deleteAction} onSubmit={(e) => {
            if(!confirm("Are you absolutely sure you want to permanently delete your account? This action cannot be undone.")) {
              e.preventDefault();
            }
          }}>
            <Button 
              type="submit" 
              disabled={isDeleting}
              variant="destructive"
              className="w-full sm:w-auto rounded-none border-4 border-black bg-red-600 text-white font-black uppercase hover:bg-red-500 hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0_0_#000] hover:shadow-none transition-all active:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </form>
        </div>
      </section>
    </>
  )
}
