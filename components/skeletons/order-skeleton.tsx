import { Skeleton } from "@/components/ui/skeleton"

export function OrderCardSkeleton() {
  return (
    <div className="border border-border rounded-xl p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-12 h-12 rounded-lg" />
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  )
}

export function OrderHistorySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function OrderDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-5 w-64 mx-auto" />
      </div>

      {/* Status timeline */}
      <div className="bg-surface rounded-xl p-6">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="flex justify-between">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-28" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-border">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-surface rounded-xl p-6 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex justify-between pt-3 border-t border-border">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  )
}
