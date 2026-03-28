import { Skeleton } from "@/components/ui/skeleton"

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 py-4 border-b border-border">
      <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  )
}

export function CartSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 3 }).map((_, i) => (
        <CartItemSkeleton key={i} />
      ))}
      <div className="pt-6 space-y-3">
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
        <Skeleton className="h-12 w-full rounded-lg mt-4" />
      </div>
    </div>
  )
}
