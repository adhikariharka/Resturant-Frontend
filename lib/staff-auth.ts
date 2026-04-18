"use client"

export interface StaffSession {
    id: string
    name: string
    role: "staff" | "admin"
    permissions: string[]
    token: string
}

const STORAGE_KEY = "harke_staff_session"

export function saveStaffSession(session: StaffSession) {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function getStaffSession(): StaffSession | null {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as StaffSession
    } catch {
        return null
    }
}

export function clearStaffSession() {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEY)
}

export function hasPermission(permission: string): boolean {
    const session = getStaffSession()
    if (!session) return false
    if (session.role === "admin") return true
    return session.permissions?.includes(permission) ?? false
}
