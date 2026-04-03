import { Skeleton } from "@/components/ui/skeleton"

export function AdminStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-28 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-muted px-4 py-3 border-b border-border">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32 hidden md:block" />
          <Skeleton className="h-4 w-20 hidden md:block" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-4 border-b border-border last:border-0">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48 hidden md:block" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <AdminStatsSkeleton />
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <AdminTableSkeleton rows={4} />
        </div>
        <div>
          <Skeleton className="h-6 w-36 mb-4" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
