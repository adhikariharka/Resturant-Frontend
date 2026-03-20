import type { NextAuthConfig } from 'next-auth';
import { API_URL } from '@/lib/store/api';

async function refreshAccessToken(token: any) {
    try {
        const url = `${API_URL}/auth/refresh`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                refreshToken: token.refreshToken,
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.accessToken,
            refreshToken: refreshedTokens.refreshToken ?? token.refreshToken, // Fallback if new one not returned
            expiresAt: Date.now() + 15 * 60 * 1000,
        };
    } catch (error) {
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = (auth?.user as any)?.role;
            const isOnDashboard = nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/dashboard');
            const isOnAccount = nextUrl.pathname.startsWith('/account') || nextUrl.pathname.startsWith('/orders');

            if (isOnDashboard) {
                // Admin routes require admin or staff role
                if (isLoggedIn && (userRole === 'admin' || userRole === 'staff')) {
                    return true;
                }
                return false; // Redirect to login
            } else if (isOnAccount) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            } else if (isLoggedIn && nextUrl.pathname.startsWith('/login')) {
                // Redirect logged-in users away from login page
                if (userRole === 'admin') {
                    return Response.redirect(new URL('/admin', nextUrl));
                }
                return Response.redirect(new URL('/', nextUrl));
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                // Initial sign in
                return {
                    ...token,
                    ...user,
                    expiresAt: Date.now() + 15 * 60 * 1000,
                };
            }

            if (trigger === "update" && session) {
                // Note: we are not updating the token expiration here, just the data
                // We merge session.user into token to update fields like name
                return { ...token, ...(session.user || session) };
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < (token as any).expiresAt) {
                return token;
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            if (token) {
                (session as any).accessToken = token.accessToken;
                (session as any).user.id = (token as any).id;
                (session as any).user.role = (token as any).role;
                (session as any).user.name = (token as any).name;
                (session as any).user.email = (token as any).email;
            }
            return session;
        }
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
