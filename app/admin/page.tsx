import { Suspense } from "react"
import { AdminDashboardContent } from "@/components/admin/dashboard-content"
import { AdminDashboardSkeleton } from "@/components/skeletons/admin-skeleton"

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminDashboardContent />
      </Suspense>
    </div>
  )
}
