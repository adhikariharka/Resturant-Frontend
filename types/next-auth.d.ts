import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            role?: string
            id?: string
        } & DefaultSession["user"]
        accessToken?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string
        id?: string
        accessToken?: string
        refreshToken?: string
        expiresAt?: number
    }
}
