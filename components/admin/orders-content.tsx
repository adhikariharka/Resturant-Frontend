"use client"

import { useState } from "react"
import { Search, Filter, ChevronDown, Eye, Clock, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/types"
import { useGetAdminOrdersQuery, useLazyGetOrderLogsQuery } from "@/lib/store/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

const statusOptions: OrderStatus[] = ["placed", "confirmed", "cooking", "on_the_way", "delivered", "cancelled"]

export function AdminOrdersContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const { data: orders = [], isLoading } = useGetAdminOrdersQuery(undefined)

  // RTK Query Lazy Trigger for logs
  const [triggerGetLogs, { data: selectedOrderLogs = [], isFetching: isLoadingLogs }] = useLazyGetOrderLogsQuery()

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.user?.name && order.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort by date desc (ensure latest first)
  const sortedOrders = [...filteredOrders].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const handleOpenLogs = (orderId: string, open: boolean) => {
    if (open) {
      triggerGetLogs(orderId)
    }
  }

  if (isLoading) {
    return <div>Loading orders...</div>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by order ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="w-4 h-4" />
              {statusFilter === "all" ? "All Status" : statusFilter.replace("_", " ")}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
            {statusOptions.map((status) => (
              <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)} className="capitalize">
                {status.replace("_", " ")}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Orders table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                  Items
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedOrders.length > 0 ? (sortedOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-mono font-medium text-foreground">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground md:hidden">{order.user?.name || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <p className="text-sm text-foreground">{order.user?.name || 'Guest'}</p>
                    <p className="text-xs text-muted-foreground">{order.user?.email || ''}</p>
                  </td>
                  <td className="py-4 px-4 hidden sm:table-cell">
                    <span className="text-sm text-foreground">{order.items?.length || 0} items</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-foreground">£{Number(order.total).toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Dialog onOpenChange={(open) => handleOpenLogs(order.id, open)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Clock className="w-4 h-4" />
                          Logs
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Order History</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                          {isLoadingLogs ? (
                            <div className="text-center text-sm text-muted-foreground">Loading logs...</div>
                          ) : !selectedOrderLogs || selectedOrderLogs.length === 0 ? (
                            <div className="text-center text-sm text-muted-foreground">No history available</div>
                          ) : (
                            <div className="space-y-4">
                              {selectedOrderLogs.map((log: any) => (
                                <div key={log.id} className="flex gap-4 text-sm">
                                  <div className="flex-none">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                      <User className="h-4 w-4" />
                                    </div>
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <p className="font-medium">{log.staffName || 'Unknown Staff'} <span className="text-muted-foreground text-xs font-normal">({log.staffRole})</span></p>
                                    <p className="text-muted-foreground">
                                      Changed status from <span className="font-semibold">{log.previousStatus}</span> to <span className="font-semibold text-primary">{log.newStatus}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(log.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center">No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
