"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Bell, LogOut, Settings, ShieldCheck, Store, User as UserIcon, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { clearStaffSession, getStaffSession, StaffSession } from "@/lib/staff-auth"
import { toast } from "sonner"

export function AdminHeader() {
    const router = useRouter()
    const { data: session } = useSession()
    const [staff, setStaff] = useState<StaffSession | null>(null)

    useEffect(() => {
        setStaff(getStaffSession())
    }, [])

    // Pick whichever identity actually exists.
    const staffUser = staff
    const nextAuthUser = (session?.user as any) ?? null
    const viewer = staffUser
        ? {
            name: staffUser.name,
            email: staffUser.email,
            role: staffUser.role,
            source: "staff" as const,
        }
        : nextAuthUser
            ? {
                name: nextAuthUser.name as string,
                email: nextAuthUser.email as string,
                role: nextAuthUser.role as string | undefined,
                source: "next-auth" as const,
            }
            : null

    const initials = viewer?.name
        ? viewer.name
            .split(" ")
            .map((p) => p[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase()
        : "??"

    const handleSignOut = async () => {
        try {
            if (staffUser) {
                clearStaffSession()
            }
            if (nextAuthUser) {
                await signOut({ redirect: false })
            }
            toast.success("Signed out")
            router.replace("/login")
        } catch {
            toast.error("Could not sign out")
        }
    }

    return (
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur border-b border-border">
            <div className="flex items-center justify-end h-full px-4 md:px-6 lg:px-8 gap-2">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                </Button>

                {/* Viewer pill + menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-border hover:bg-muted/60 transition-colors">
                            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-semibold">
                                {initials}
                            </span>
                            <div className="hidden sm:flex flex-col items-start leading-tight">
                                <span className="text-sm font-medium text-foreground truncate max-w-[140px]">
                                    {viewer?.name ?? "Guest"}
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    {viewer?.role ?? "not signed in"}
                                </span>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuLabel className="flex items-start gap-3 py-2">
                            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium truncate">{viewer?.name ?? "Guest"}</p>
                                <p className="text-xs text-muted-foreground truncate font-normal">
                                    {viewer?.email}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase tracking-wider">
                                        {viewer?.role ?? "unknown"}
                                    </Badge>
                                    {viewer?.source === "staff" && (
                                        <span className="flex items-center gap-1 text-[10px] text-orange-600 dark:text-orange-400">
                                            <ShieldCheck className="h-3 w-3" /> staff token
                                        </span>
                                    )}
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/" className="gap-2 cursor-pointer">
                                <Store className="w-4 h-4" />
                                View store
                            </Link>
                        </DropdownMenuItem>
                        {viewer?.source === "staff" && (
                            <DropdownMenuItem asChild>
                                <Link href="/staff" className="gap-2 cursor-pointer">
                                    <UserCircle className="w-4 h-4" />
                                    Kitchen console
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {viewer?.source === "next-auth" && (
                            <DropdownMenuItem asChild>
                                <Link href="/account" className="gap-2 cursor-pointer">
                                    <UserIcon className="w-4 h-4" />
                                    My account
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                            <Link href="/admin/contact-info" className="gap-2 cursor-pointer">
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                            onClick={handleSignOut}
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
