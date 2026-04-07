import { Skeleton } from "@/components/ui/skeleton"

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[500px] md:h-[600px]">
      <Skeleton className="w-full h-full rounded-none" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
          <Skeleton className="h-12 w-40 mx-auto rounded-full" />
        </div>
      </div>
      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        <Skeleton className="w-3 h-3 rounded-full" />
        <Skeleton className="w-3 h-3 rounded-full" />
      </div>
    </div>
  )
}
