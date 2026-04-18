"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChefHat, Loader2, Lock, User, Utensils, Bike, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { API_URL } from "@/lib/store/api"
import { saveStaffSession } from "@/lib/staff-auth"

export function StaffLoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/staff/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data?.message || "Invalid credentials")
        return
      }

      saveStaffSession({
        id: data.staff.id,
        name: data.staff.name,
        role: data.staff.role,
        permissions: data.staff.permissions || [],
        token: data.access_token,
      })

      toast.success(`Welcome, ${data.staff.name}`)
      router.replace("/staff")
    } catch (err) {
      console.error("Staff login error:", err)
      toast.error("Unable to reach the server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-orange-950/20 dark:via-background dark:to-amber-950/20">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-primary/25">
            <ChefHat className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Kitchen Portal</h1>
          <p className="text-sm text-muted-foreground">The British Kitchen — Staff Console</p>
        </div>

        <Card className="shadow-xl border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>Enter your staff credentials to access the kitchen dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff-username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="staff-username"
                    placeholder="e.g. kitchen_01"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="staff-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Enter Kitchen"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Role hints */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-border/50">
            <Utensils className="h-4 w-4 text-orange-600" />
            <span className="font-medium text-foreground">Kitchen</span>
            <span className="text-muted-foreground text-[10px]">Cook &amp; prepare</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-border/50">
            <Bike className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-foreground">Delivery</span>
            <span className="text-muted-foreground text-[10px]">Dispatch orders</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-border/50">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-foreground">Admin</span>
            <span className="text-muted-foreground text-[10px]">Full access</span>
          </div>
        </div>
      </div>
    </div>
  )
}
