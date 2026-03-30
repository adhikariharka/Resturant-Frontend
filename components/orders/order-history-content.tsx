"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Package, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"
import { PaymentTimer } from "@/components/orders/payment-timer"
import { useGetOrdersQuery, useRetryPaymentMutation } from "@/lib/store/api"
import { toast } from "sonner"

type FilterStatus = "all" | "active" | "completed" | "cancelled"

export function OrderHistoryContent() {
  const [filter, setFilter] = useState<FilterStatus>("all")
  const { data: orders = [], isLoading } = useGetOrdersQuery(undefined, { pollingInterval: 5000 })
  const [retryPayment] = useRetryPaymentMutation()
  const [activeRetryingId, setActiveRetryingId] = useState<string | null>(null)
  const [expiredOrders, setExpiredOrders] = useState<Record<string, boolean>>({})

  const handleRetryPayment = async (orderId: string) => {
    try {
      setActiveRetryingId(orderId)
      const result = await retryPayment(orderId).unwrap()
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      }
    } catch (error) {
      toast.error("Failed to initiate payment retry")
      setActiveRetryingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const filteredOrders = orders.filter((order: any) => {
    if (filter === "all") return true
    if (filter === "active") return !["delivered", "cancelled"].includes(order.status)
    if (filter === "completed") return ["delivered"].includes(order.status)
    if (filter === "cancelled") return order.status === "cancelled"
    return true
  })

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="When you place an order, it will appear here."
        action={{ label: "Browse Menu", href: "/menu" }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-border pb-4 overflow-x-auto">
        {(["all", "active", "completed", "cancelled"] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize",
              filter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No {filter} orders found.</div>
        ) : filteredOrders.map((order: any) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block bg-card border border-border rounded-xl p-4 md:p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-medium text-foreground">{order.orderNumber}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>

            {/* Order items preview */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                {order.items && order.items.slice(0, 3).map((item: any, index: number) => (
                  <div
                    key={item.id}
                    className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-card"
                    style={{ zIndex: 3 - index }}
                  >
                    <Image src={item.foodItem?.image || "/placeholder.svg"} alt={item.foodItem?.name || "Food"} fill className="object-cover" />
                  </div>
                ))}
                {order.items && order.items.length > 3 && (
                  <div className="w-12 h-12 rounded-lg bg-muted border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{order.items?.reduce((t: number, i: any) => t + i.quantity, 0) || 0} items</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="font-semibold text-foreground">£{order.total.toFixed(2)}</span>

              {order.status === "pending_payment" && (
                <div className="flex items-center gap-3" onClick={(e) => e.preventDefault()}>
                  <PaymentTimer
                    createdAt={order.createdAt}
                    onExpire={() => setExpiredOrders(prev => ({ ...prev, [order.id]: true }))}
                  />
                  <Button
                    size="sm"
                    disabled={activeRetryingId === order.id || expiredOrders[order.id]}
                    onClick={(e) => {
                      e.preventDefault()
                      handleRetryPayment(order.id)
                    }}
                  >
                    {activeRetryingId === order.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {expiredOrders[order.id] ? "Expired" : "Pay Now"}
                  </Button>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
