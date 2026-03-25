import type React from "react"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="font-serif text-xl font-semibold text-foreground">
            The Kitchen
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">{children}</main>

      {/* Simple footer */}
      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} The Kitchen. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
