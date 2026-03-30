import { Suspense } from "react"
import { OrderHistoryContent } from "@/components/orders/order-history-content"
import { OrderHistorySkeleton } from "@/components/skeletons/order-skeleton"

export const metadata = {
  title: "Order History | The Kitchen",
  description: "View and track your past orders.",
}

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">Order History</h1>

      <Suspense fallback={<OrderHistorySkeleton />}>
        <OrderHistoryContent />
      </Suspense>
    </div>
  )
}
