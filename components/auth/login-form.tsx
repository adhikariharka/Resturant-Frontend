"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, ChefHat, ShieldCheck, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { signIn, signOut, getSession } from "next-auth/react"
import { toast } from "sonner"
import { useGoogleLogin } from "@react-oauth/google"
import { API_URL } from "@/lib/store/api"
import { saveStaffSession, clearStaffSession } from "@/lib/staff-auth"

/**
 * Unified sign-in:
 *   1. Try the staff endpoint first (kitchen / delivery / staff-admin).
 *   2. Fall back to NextAuth credentials (customer / user-admin).
 * Route the user to the right place on success:
 *   - staff with admin role  -> /admin
 *   - staff (kitchen/delivery) -> /staff
 *   - user with admin role  -> /admin
 *   - user (customer)        -> /
 */
async function tryStaffLogin(email: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/staff/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) return { ok: false as const, res }
    const data = await res.json()
    return {
      ok: true as const,
      data: data as {
        access_token: string
        staff: { id: string; email: string; name: string; role: "staff" | "admin"; permissions: string[] }
      },
    }
  } catch {
    return { ok: false as const, res: null }
  }
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true)
        // Google users are always customers/admins (no staff Google path).
        clearStaffSession()
        const result = await signIn("credentials", {
          googleToken: tokenResponse.access_token,
          redirect: false,
        })

        if (result?.error) {
          toast.error("Google authentication failed")
        } else {
          toast.success("Signed in")
          const session = await getSession()
          const role = (session?.user as any)?.role
          window.location.href = role === "admin" ? "/admin" : "/"
        }
      } catch {
        toast.error("Google authentication failed")
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => toast.error("Google login failed"),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const email = (formData.get("email") as string).trim().toLowerCase()
    const password = formData.get("password") as string
    if (!email || !password) return

    setIsLoading(true)

    // 1. Staff first
    const staff = await tryStaffLogin(email, password)
    if (staff.ok) {
      // Clear any lingering NextAuth session so the two auth paths don't coexist.
      try { await signOut({ redirect: false }) } catch { /* noop */ }
      saveStaffSession({
        id: staff.data.staff.id,
        email: staff.data.staff.email,
        name: staff.data.staff.name,
        role: staff.data.staff.role,
        permissions: staff.data.staff.permissions ?? [],
        token: staff.data.access_token,
      })
      toast.success(`Welcome, ${staff.data.staff.name}`)
      setIsLoading(false)
      // Staff-admin lands in the admin dashboard; other staff go to the kitchen.
      window.location.href = staff.data.staff.role === "admin" ? "/admin" : "/staff"
      return
    }

    // 2. Fall back to customer / user-admin via NextAuth.
    clearStaffSession()
    try {
      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.error) {
        toast.error("Invalid email or password")
        return
      }
      toast.success("Signed in")
      const session = await getSession()
      const role = (session?.user as any)?.role
      window.location.href = role === "admin" ? "/admin" : "/"
    } catch {
      toast.error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <User className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in with your email — we&rsquo;ll take you to the right place.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                name="email"
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                name="password"
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 bg-transparent"
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={isLoading}
        >
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

        <p className="text-center text-sm text-muted-foreground mt-6">
          New here?{" "}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>

      {/* Role hints — tiny legend so staff know they can use this page too */}
      <div className="grid grid-cols-3 gap-2 text-xs mt-6">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/50">
          <User className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">Customer</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/50">
          <ChefHat className="h-3.5 w-3.5 text-orange-600" />
          <span className="text-muted-foreground">Kitchen / Delivery</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/50">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-muted-foreground">Admin</span>
        </div>
      </div>
    </div>
  )
}
