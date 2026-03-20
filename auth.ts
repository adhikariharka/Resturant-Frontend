import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { API_URL } from '@/lib/store/api';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                googleToken: { label: "Google Token", type: "text" }
            },
            async authorize(credentials) {
                // If this is a Google Login request
                const creds = credentials as any;
                if (creds?.googleToken) {
                    try {
                        const url = `${API_URL}/auth/google`;
                        const res = await fetch(url, {
                            method: 'POST',
                            body: JSON.stringify({ token: creds.googleToken }),
                            headers: { "Content-Type": "application/json" }
                        });


                        const data = await res.json();

                        if (res.ok && data) {
                            return {
                                id: data.user.id,
                                email: data.user.email,
                                name: data.user.name,
                                role: data.user.role,
                                accessToken: data.backendTokens.accessToken,
                                refreshToken: data.backendTokens.refreshToken,
                            };
                        }
                        return null;
                    } catch (e) {
                        console.error("Google Login Error:", e);
                        return null;
                    }
                }

                // Normal Email/Password Login
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const url = `${API_URL}/auth/login`;
                    const res = await fetch(url, {
                        method: 'POST',
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" }
                    });

                    const user = await res.json();

                    if (res.ok && user) {
                        const userData = {
                            id: user.user.id,
                            email: user.user.email,
                            name: user.user.name,
                            role: user.user.role,
                            accessToken: user.backendTokens.accessToken,
                            refreshToken: user.backendTokens.refreshToken,
                        };
                        return userData;
                    }
                    return null;
                } catch (e) {
                    console.error("Login Error:", e);
                    return null;
                }
            }
        }),
    ],
    events: {
        async signOut(message) {
            console.log("User signed out", message);
            // Any other server-side cleanup can go here
            try {
                if ('token' in message && (message.token as any)?.accessToken) {
                    const token = (message.token as any).accessToken;
                    await fetch(`${API_URL}/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log("Backend session cleared via signOut event");

                    // Explicitly clear references as requested
                    const tokenObj = (message as any).token;
                    if (tokenObj) {
                        Object.keys(tokenObj).forEach(key => delete tokenObj[key]);
                    }
                    (message as any).token = null;
                    (message as any).session = null;
                }
            } catch (e) {
                console.error("Error clearing backend session in signOut event:", e);
            }
        }
    }
});
