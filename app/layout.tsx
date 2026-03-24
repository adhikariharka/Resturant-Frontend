import type React from "react"
import type { Metadata, Viewport } from "next"
import { DM_Sans, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "The Kitchen | Fine Dining & Takeaway",
  description: "Experience exceptional cuisine with our curated menu. Order online for delivery or collection.",
  keywords: ["restaurant", "food ordering", "delivery", "takeaway", "fine dining"],
  generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#C8102E",
  width: "device-width",
  initialScale: 1,
}

import { StoreProvider } from "@/components/providers/store-provider"
import { SessionProvider } from "@/components/providers/session-provider"
import { GoogleProvider } from "@/components/providers/google-provider"

// ... (imports)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfair.variable} font-sans antialiased`}>
        <StoreProvider>
          <SessionProvider>
            <GoogleProvider>
              {children}
            </GoogleProvider>
            <Toaster />
            <Analytics />
          </SessionProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
