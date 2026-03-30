import { Suspense } from "react"
import { OrderDetailContent } from "@/components/orders/order-detail-content"
import { OrderDetailSkeleton } from "@/components/skeletons/order-skeleton"

export const metadata = {
  title: "Order Details | The Kitchen",
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<OrderDetailSkeleton />}>
        <OrderDetailContent orderId={id} />
      </Suspense>
    </div>
  )
}
