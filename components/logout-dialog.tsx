"use client"

import { useState } from "react"
import { LogOut, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useGetActiveSessionsQuery, useLogoutMutation, useLogoutAllMutation } from "@/lib/store/api"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/store/auth-store"
import { useDispatch } from "react-redux"

interface LogoutDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
    const router = useRouter()
    const authLogout = useAuthStore((state) => state.logout)
    const [logoutFromAll, setLogoutFromAll] = useState(false)
    const { data: sessionsData, isLoading: sessionsLoading } = useGetActiveSessionsQuery(undefined, {
        skip: !open,
    })
    const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()
    const [logoutAll, { isLoading: isLoggingOutAll }] = useLogoutAllMutation()
    const dispatch = useDispatch()

    const sessionCount = sessionsData?.count ?? 0
    const isLoading = isLoggingOut || isLoggingOutAll

    const handleLogout = async () => {
        try {
            // First invalidate backend sessions while we still have the token
            try {
                if (logoutFromAll) {
                    await logoutAll(undefined).unwrap()
                    toast.success("Logged out from all devices")
                } else {
                    await logout(undefined).unwrap()
                    toast.success("Logged out successfully")
                }
            } catch (backendError) {
                console.error("Backend logout error:", backendError)
                // Continue with client-side cleanup even if backend fails
                toast.warning("Logged out locally (server cleanup failed)")
            }

            // Close dialog
            onOpenChange(false)

            // Clear Redux state
            dispatch({ type: 'auth/logout' })

            // Clear auth store (persisted state)
            authLogout()

            // Clear NextAuth session and redirect
            await signOut({
                redirectTo: '/'
            })

        } catch (error) {
            console.error("Logout error:", error)
            toast.error("Failed to logout. Please try again.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Logout Confirmation</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to logout?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {sessionsLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            {sessionCount > 1 && (
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        You have <span className="font-semibold text-foreground">{sessionCount} active sessions</span> on different devices.
                                    </p>
                                </div>
                            )}

                            {sessionCount > 1 && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="logout-all"
                                        checked={logoutFromAll}
                                        onCheckedChange={(checked) => setLogoutFromAll(checked as boolean)}
                                    />
                                    <Label
                                        htmlFor="logout-all"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        Logout from all devices
                                    </Label>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        disabled={isLoading || sessionsLoading}
                        className="gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Logging out...
                            </>
                        ) : (
                            <>
                                <LogOut className="w-4 h-4" />
                                Logout
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
