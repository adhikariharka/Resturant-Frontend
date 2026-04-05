"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChefHat, Clock, CheckCircle2, Truck, LogOut, Bell, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

type OrderStatus = "pending" | "cooking" | "ready" | "out_for_delivery"

interface OrderItem {
  name: string
  quantity: number
  options?: string[]
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  items: OrderItem[]
  status: OrderStatus
  placedAt: string
  estimatedTime: number
  notes?: string
  deliveryAddress?: string
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customerName: "James Wilson",
    items: [
      { name: "Fish & Chips", quantity: 2, options: ["Large portion", "Mushy peas"] },
      { name: "Shepherd's Pie", quantity: 1 },
    ],
    status: "pending",
    placedAt: "2 mins ago",
    estimatedTime: 25,
    notes: "Extra tartar sauce please",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customerName: "Emily Thompson",
    items: [
      { name: "Sunday Roast Beef", quantity: 1, options: ["Well done"] },
      { name: "Sticky Toffee Pudding", quantity: 1 },
    ],
    status: "cooking",
    placedAt: "8 mins ago",
    estimatedTime: 20,
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customerName: "Oliver Brown",
    items: [
      { name: "Bangers & Mash", quantity: 3 },
      { name: "Cornish Pasty", quantity: 2 },
    ],
    status: "ready",
    placedAt: "18 mins ago",
    estimatedTime: 0,
    deliveryAddress: "42 Baker Street, London W1U 7EU",
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customerName: "Sophie Davies",
    items: [{ name: "Beef Wellington", quantity: 1, options: ["Medium rare"] }],
    status: "out_for_delivery",
    placedAt: "32 mins ago",
    estimatedTime: 10,
    deliveryAddress: "15 Kings Road, Chelsea SW3 4RP",
  },
]

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "New Order", color: "bg-amber-100 text-amber-800 border-amber-200", icon: Bell },
  cooking: { label: "Cooking", color: "bg-orange-100 text-orange-800 border-orange-200", icon: ChefHat },
  ready: { label: "Ready", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  out_for_delivery: { label: "Out for Delivery", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Truck },
}

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  pending: "cooking",
  cooking: "ready",
  ready: "out_for_delivery",
  out_for_delivery: null,
}

const actionLabels: Record<OrderStatus, string> = {
  pending: "Start Cooking",
  cooking: "Mark Ready",
  ready: "Out for Delivery",
  out_for_delivery: "Delivered",
}

export function StaffDashboardContent() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [filter, setFilter] = useState<OrderStatus | "all">("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleStatusUpdate = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const next = nextStatus[order.status]
          if (next) {
            return { ...order, status: next }
          }
        }
        return order
      }),
    )
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter)

  const orderCounts = {
    pending: orders.filter((o) => o.status === "pending").length,
    cooking: orders.filter((o) => o.status === "cooking").length,
    ready: orders.filter((o) => o.status === "ready").length,
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Kitchen Orders</h1>
          <p className="text-sm text-muted-foreground">{orders.length} active orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          <Button variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card
          className={cn("cursor-pointer transition-all", filter === "pending" && "ring-2 ring-primary")}
          onClick={() => setFilter(filter === "pending" ? "all" : "pending")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Bell className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orderCounts.pending}</p>
                <p className="text-xs text-muted-foreground">New</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn("cursor-pointer transition-all", filter === "cooking" && "ring-2 ring-primary")}
          onClick={() => setFilter(filter === "cooking" ? "all" : "cooking")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <ChefHat className="h-5 w-5 text-orange-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orderCounts.cooking}</p>
                <p className="text-xs text-muted-foreground">Cooking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn("cursor-pointer transition-all", filter === "ready" && "ring-2 ring-primary")}
          onClick={() => setFilter(filter === "ready" ? "all" : "ready")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orderCounts.ready}</p>
                <p className="text-xs text-muted-foreground">Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No orders in this category</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const config = statusConfig[order.status]
            const StatusIcon = config.icon
            const canAdvance = nextStatus[order.status] !== null

            return (
              <Card
                key={order.id}
                className={cn("overflow-hidden", order.status === "pending" && "border-amber-300 bg-amber-50/50")}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{order.orderNumber}</CardTitle>
                        <Badge variant="outline" className={config.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{order.customerName}</p>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {order.placedAt}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-3">
                  {/* Items */}
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium">{item.quantity}x</span> <span>{item.name}</span>
                        {item.options && item.options.length > 0 && (
                          <span className="text-muted-foreground"> ({item.options.join(", ")})</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="text-sm p-2 bg-muted/50 rounded-lg">
                      <span className="font-medium">Note:</span> {order.notes}
                    </div>
                  )}

                  {/* Delivery Address for ready orders */}
                  {order.status === "ready" && order.deliveryAddress && (
                    <div className="text-sm p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="font-medium text-blue-800">Deliver to:</span>{" "}
                      <span className="text-blue-700">{order.deliveryAddress}</span>
                    </div>
                  )}

                  {/* Action Button */}
                  {canAdvance && (
                    <Button
                      className="w-full"
                      variant={order.status === "pending" ? "default" : "outline"}
                      onClick={() => handleStatusUpdate(order.id)}
                    >
                      {actionLabels[order.status]}
                    </Button>
                  )}

                  {order.status === "out_for_delivery" && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
                      <Truck className="h-4 w-4" />
                      <span>ETA: ~{order.estimatedTime} mins</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
