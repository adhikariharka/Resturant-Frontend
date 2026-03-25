"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { API_URL } from "@/lib/store/api"

export function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.target as HTMLFormElement)
        const email = formData.get("email") as string

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            if (res.ok) {
                setIsSuccess(true)
                toast.success("Reset link sent to your email")
            } else {
                toast.error("Failed to send reset link")
            }

        } catch (err) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="w-full max-w-lg text-center">
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                    <h2 className="text-2xl font-semibold mb-4">Check your email</h2>
                    <p className="text-muted-foreground mb-6">
                        We have sent a password reset link to your email address.
                    </p>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-lg">
            <div className="text-center mb-8">
                <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">Forgot Password</h1>
                <p className="text-muted-foreground">Enter your email to reset your password</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <div className="relative mt-1.5">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input name="email" id="email" type="email" placeholder="you@example.com" className="pl-10" required />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <div className="text-center">
                        <Link href="/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
