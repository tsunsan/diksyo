import { UpdatePasswordForm } from "@/components/update-password-form"
import { Suspense } from "react"

export default function UpdatePasswordPage() {
    return (
        <Suspense fallback={<div className="font-bold text-center">Loading...</div>}>
            <UpdatePasswordForm />
        </Suspense>
    )
}