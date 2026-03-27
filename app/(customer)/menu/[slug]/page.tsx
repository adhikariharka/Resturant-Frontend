import { Suspense } from "react"
import { FoodDetailSkeleton } from "@/components/skeletons/food-detail-skeleton"
import { FoodDetailContent } from "@/components/menu/food-detail-content"

export const metadata = {
  title: "Menu Item | The Kitchen",
}

export default async function FoodDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<FoodDetailSkeleton />}>
        <FoodDetailContent itemSlug={slug} />
      </Suspense>
    </div>
  )
}
