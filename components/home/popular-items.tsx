"use client"

import { FoodCard } from "@/components/food/food-card"
import { useGetFoodItemsQuery } from "@/lib/store/api"
import { FoodGridSkeleton } from "@/components/skeletons/food-card-skeleton"

export function PopularItems() {
  const { data: foodItems = [], isLoading } = useGetFoodItemsQuery(undefined)

  if (isLoading) {
    return <FoodGridSkeleton count={4} />
  }

  // Filter for popular items and take top 4
  const popularItems = foodItems
    .filter((item: any) => item.isPopular)
    .slice(0, 4)

  if (popularItems.length === 0) {
    return <div className="text-center py-12 text-muted-foreground w-full col-span-full">Check back soon for popular items!</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {popularItems.map((item: any) => (
        <FoodCard key={item.id} item={item} />
      ))}
    </div>
  )
}
