import { Suspense } from "react"
import { HeroSlider } from "@/components/home/hero-slider"
import { CategoryNav } from "@/components/home/category-nav"
import { PopularItems } from "@/components/home/popular-items"
import { FeaturedSection } from "@/components/home/featured-section"
import { BentoGrid, VerticalStoryStrip } from "@/components/home/bento-grid"
import { HeroSkeleton } from "@/components/skeletons/hero-skeleton"
import { CategoryListSkeleton } from "@/components/skeletons/category-skeleton"
import { FoodGridSkeleton } from "@/components/skeletons/food-card-skeleton"

export default function HomePage() {
  return (
    <div>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSlider />
      </Suspense>

      <div className="container mx-auto px-4">
        <Suspense fallback={<CategoryListSkeleton />}>
          <CategoryNav />
        </Suspense>

        <Suspense fallback={<FoodGridSkeleton count={6} />}>
          <VerticalStoryStrip />
        </Suspense>

        <section className="py-8 md:py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">Popular Right Now</h2>
            <a href="/menu?filter=popular" className="text-sm font-medium text-primary hover:underline">
              View All
            </a>
          </div>
          <Suspense fallback={<FoodGridSkeleton count={4} />}>
            <PopularItems />
          </Suspense>
        </section>

        <Suspense fallback={<FoodGridSkeleton count={6} />}>
          <BentoGrid />
        </Suspense>

        <Suspense fallback={<FoodGridSkeleton count={4} />}>
          <FeaturedSection />
        </Suspense>
      </div>
    </div>
  )
}
