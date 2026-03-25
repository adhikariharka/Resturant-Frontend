"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

import { useRegisterMutation } from "@/lib/store/api"
import { toast } from "sonner"
import { useGoogleLogin } from "@react-oauth/google"
import { signIn, getSession } from "next-auth/react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRouter } from "next/navigation"

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [register, { isLoading }] = useRegisterMutation()
  // const { setCredentials } = useAuthStore() // removing checking if used
  const router = useRouter()

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const result = await signIn("credentials", {
          googleToken: tokenResponse.access_token,
          redirect: false,
        })

        if (result?.error) {
          toast.error("Google authentication failed")
        } else {
          toast.success("Account created successfully!")
          const session = await getSession()
          const userRole = (session?.user as any)?.role
          if (userRole === "admin") {
            window.location.href = "/admin"
          } else {
            window.location.href = "/"
          }
        }
      } catch (err) {
        toast.error("Google authentication failed")
      }
    },
    onError: () => {
      toast.error("Google signup failed")
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Get form data
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Validate password length
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    try {
      const result = await register({ name, email, password }).unwrap()
      toast.success("Account created successfully!")

      // Auto login after signup if token returned, or redirect to login
      // Assuming register returns user object, we might need separate login
      // But standard flow often logs in immediately. 
      // Checking backend UsersService.create returns user. 
      // We might need to call login separately or just redirect to login for now.

      // For better UX, let's redirect to login with a message
      router.push("/login")

    } catch (err: any) {
      toast.error(err?.data?.message || "Registration failed. Please try again.")
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">Create Account</h1>
        <p className="text-muted-foreground">Join us and start ordering delicious food</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="name" name="name" type="text" placeholder="John Doe" className="pl-10" required />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-10" required />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
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
            <p className="text-xs text-muted-foreground mt-1.5">Must be at least 6 characters</p>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <Checkbox id="terms" className="mt-0.5" required />
            <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* Social signup */}
        <Button variant="outline" className="w-full gap-2 bg-transparent" type="button" onClick={() => handleGoogleLogin()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
