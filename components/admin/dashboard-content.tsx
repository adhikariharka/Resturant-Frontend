"use client"

import { TrendingUp, TrendingDown, Package, DollarSign, Users, UtensilsCrossed } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/types"
import { useGetStatsQuery, useGetDashboardRecentOrdersQuery } from "@/lib/store/api"

export function AdminDashboardContent() {
  const { data: statsData = [] } = useGetStatsQuery(undefined)
  const { data: recentOrders = [] } = useGetDashboardRecentOrdersQuery(undefined)

  const stats = [
    {
      name: "Today's Orders",
      value: statsData.find((s: any) => s.name === "Today's Orders")?.value || "0",
      change: "+0%", // Backend to calculate
      trend: "neutral",
      icon: Package,
    },
    {
      name: "Revenue",
      value: statsData.find((s: any) => s.name === "Revenue")?.value
        ? `£${Number(statsData.find((s: any) => s.name === "Revenue")?.value.toString().replace(/[^0-9.-]+/g, "")).toFixed(2)}`
        : "£0.00",
      change: "+0%",
      trend: "up",
      icon: DollarSign,
    },
    {
      name: "Active Items",
      value: statsData.find((s: any) => s.name === "Active Items")?.value || "0",
      change: "0",
      trend: "neutral",
      icon: UtensilsCrossed,
    },
    {
      name: "New Customers",
      value: statsData.find((s: any) => s.name === "New Customers")?.value || "0",
      change: "+0",
      trend: "neutral",
      icon: Users,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-card border border-border rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.name}</span>
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-foreground mb-1">{stat.value}</p>

          </div>
        ))}
      </div>

      {/* Recent orders & Popular items */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-card border border-border rounded-xl">
          <div className="p-4 md:p-6 border-b border-border">
            <h2 className="font-serif text-lg font-semibold text-foreground">Recent Orders</h2>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.length > 0 ? (
              recentOrders.map((order: any) => (
                <div key={order.id} className="p-4 md:px-6 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {order.user?.name || 'Guest'} • {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={order.status} />
                    <span className="font-medium text-foreground">£{Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground">No recent orders</div>
            )}
          </div>
          <div className="p-4 border-t border-border">
            <a href="/admin/orders" className="text-sm text-primary hover:underline font-medium">
              View all orders
            </a>
          </div>
        </div>

        {/* Popular items - Placeholder for now or fetch real popular items */}
        <div className="bg-card border border-border rounded-xl">
          <div className="p-4 md:p-6 border-b border-border">
            <h2 className="font-serif text-lg font-semibold text-foreground">Popular Items Today</h2>
          </div>
          {/* Reusing static list or logic from popular-items.tsx could work here, but for now simplified message */}
          <div className="p-6 text-center text-muted-foreground">
            Stats module coming soon.
          </div>
          <div className="p-4 border-t border-border">
            <a href="/admin/menu" className="text-sm text-primary hover:underline font-medium">
              Manage menu
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
