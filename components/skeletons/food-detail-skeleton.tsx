import { Skeleton } from "@/components/ui/skeleton"

export function FoodDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <Skeleton className="aspect-square rounded-xl" />

        {/* Details */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-3/4 mb-3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3 mt-1" />
          </div>

          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20 rounded-full" />
              <Skeleton className="h-10 w-20 rounded-full" />
              <Skeleton className="h-10 w-20 rounded-full" />
            </div>
          </div>

          {/* Quantity & Add to cart */}
          <div className="flex items-center gap-4 pt-4">
            <Skeleton className="h-12 w-32 rounded-lg" />
            <Skeleton className="h-12 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
