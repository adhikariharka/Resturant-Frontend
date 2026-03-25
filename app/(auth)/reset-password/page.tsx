import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Suspense } from "react"

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full flex flex-col items-center gap-6">
                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}
