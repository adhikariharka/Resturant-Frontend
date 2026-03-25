import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full flex flex-col items-center gap-6">
                <ForgotPasswordForm />
            </div>
        </div>
    )
}
