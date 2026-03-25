"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { API_URL } from "@/lib/store/api"

export function ResetPasswordForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) {
            toast.error("Missing reset token")
            return
        }

        setIsLoading(true)

        const formData = new FormData(e.target as HTMLFormElement)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            setIsLoading(false)
            return
        }

        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPass: password }),
            })

            if (res.ok) {
                setIsSuccess(true)
                toast.success("Password reset successful")
                setTimeout(() => router.push('/login'), 3000)
            } else {
                try {
                    const data = await res.json()
                    toast.error(data.message || "Failed to reset password")
                } catch {
                    toast.error("Failed to reset password")
                }
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
                    <h2 className="text-2xl font-semibold mb-4 text-green-600">Password Reset!</h2>
                    <p className="text-muted-foreground mb-6">
                        Your password has been successfully updated. Redirecting to login...
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </div>
            </div>
        )
    }

    if (!token) {
        return (
            <div className="w-full max-w-lg text-center">
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                    <h2 className="text-xl font-semibold mb-4 text-destructive">Invalid Link</h2>
                    <p className="text-muted-foreground mb-6">
                        This password reset link is invalid or missing.
                    </p>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/forgot-password">Request New Link</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-lg">
            <div className="text-center mb-8">
                <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">Reset Password</h1>
                <p className="text-muted-foreground">Enter your new password below</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Password */}
                    <div>
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative mt-1.5">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                name="password"
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative mt-1.5">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                name="confirmPassword"
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                </form>
            </div>
        </div>
    )
}
