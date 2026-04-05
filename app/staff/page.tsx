import { Suspense } from "react"
import { StaffDashboardContent } from "@/components/staff/staff-dashboard-content"
import { Skeleton } from "@/components/ui/skeleton"

function StaffDashboardSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default function StaffPage() {
  return (
    <Suspense fallback={<StaffDashboardSkeleton />}>
      <StaffDashboardContent />
    </Suspense>
  )
}
