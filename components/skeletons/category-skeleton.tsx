import { Skeleton } from "@/components/ui/skeleton"

export function CategorySkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 min-w-[80px]">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
    </div>
  )
}

export function CategoryListSkeleton() {
  return (
    <section className="py-8">
      <Skeleton className="h-8 w-32 mb-6" />
      <CategorySkeleton />
    </section>
  )
}
