import { Suspense } from "react"
import { MenuContent } from "@/components/menu/menu-content"
import { CategoryListSkeleton } from "@/components/skeletons/category-skeleton"
import { FoodGridSkeleton } from "@/components/skeletons/food-card-skeleton"

export const metadata = {
  title: "Menu | The Kitchen",
  description: "Browse our full menu of delicious dishes, from starters to desserts.",
}

export default function MenuPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">Our Menu</h1>
        <p className="text-muted-foreground">
          Discover our carefully crafted dishes, made with the finest ingredients.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-8">
            <CategoryListSkeleton />
            <FoodGridSkeleton count={8} />
          </div>
        }
      >
        <MenuContent />
      </Suspense>
    </div>
  )
}
