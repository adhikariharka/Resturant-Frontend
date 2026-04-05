import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Staff Dashboard | The British Kitchen",
  description: "Staff order management dashboard",
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-muted/30">{children}</div>
}
