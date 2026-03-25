"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

interface LoginDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function LoginDialog({ open, onOpenChange, onSuccess }: LoginDialogProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.target as HTMLFormElement)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                toast.error("Invalid credentials")
            } else {
                toast.success("Login successful")
                onOpenChange(false)
                if (onSuccess) {
                    onSuccess()
                }
            }
        } catch (err) {
            toast.error("Login failed")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Login Required</DialogTitle>
                    <DialogDescription>
                        Please login to add items to your cart
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative mt-1.5">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                name="email"
                                id="login-email"
                                type="email"
                                placeholder="you@example.com"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative mt-1.5">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                name="password"
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10"
                                required
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

                    {/* Submit */}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
