import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

import { NextResponse } from 'next/server';

export default async function middleware(req: any) {
    const url = req.nextUrl;
    const hostname = req.headers.get('host');

    // Check if the hostname matches the Vercel domain
    if (hostname === 'resturant-frontend-beta.vercel.app') {
        url.hostname = 'resturant.prajwolghimire.com.np';
        url.protocol = 'https';
        url.port = ''; // Ensure no port is included
        return NextResponse.redirect(url);
    }

    // Continue with NextAuth middleware
    return NextAuth(authConfig).auth(req);
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
