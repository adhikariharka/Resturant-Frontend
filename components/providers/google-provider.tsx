"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"

export function GoogleProvider({ children }: { children: React.ReactNode }) {
    // Use environment variable or fallback for development
    // IMPORTANT: The user must add NEXT_PUBLIC_GOOGLE_CLIENT_ID to their .env file
    // Use environment variable or fallback for development to prevent build crashes
    // if the env var is missing.
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "dummy-client-id-for-build"

    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        console.warn("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable")
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    )
}
