"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
    Clock,
    CreditCard,
    Banknote,
    ChefHat,
    CheckCircle2,
    Truck,
    PackageCheck,
    ChevronRight,
    Sparkles,
    MapPin,
} from "lucide-react"

export type StaffOrderStatus =
    | "pending_payment"
    | "placed"
    | "confirmed"
    | "cooking"
    | "on_the_way"
    | "delivered"
    | "cancelled"

export interface StaffOrder {
    id: string
    orderNumber: string
    status: StaffOrderStatus
    subtotal: number
    tax: number
    serviceCharge: number
    total: number
    deliveryAddress: any
    paymentMethod: "card" | "cash"
    createdAt: string
    estimatedDelivery?: string | null
    items: Array<{
        id: string
        quantity: number
        priceAtOrder: number
        selectedOptions?: any
        foodItem?: { name: string; image?: string }
    }>
    user?: { id?: string; name?: string; email?: string; phone?: string }
}

interface Props {
    order: StaffOrder
    onAdvance: (order: StaffOrder, next: StaffOrderStatus) => void
    onOpen: (order: StaffOrder) => void
    canAdvance: (next: StaffOrderStatus) => boolean
    isUpdating?: boolean
    highlight?: boolean
}

const statusMeta: Record<StaffOrderStatus, { label: string; color: string; Icon: any }> = {
    pending_payment: {
        label: "Pending Payment",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
        Icon: CreditCard,
    },
    placed: {
        label: "New Order",
        color: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800",
        Icon: Sparkles,
    },
    confirmed: {
        label: "Confirmed",
        color: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
        Icon: CheckCircle2,
    },
    cooking: {
        label: "Cooking",
        color: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
        Icon: ChefHat,
    },
    on_the_way: {
        label: "On the Way",
        color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
        Icon: Truck,
    },
    delivered: {
        label: "Delivered",
        color: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
        Icon: PackageCheck,
    },
    cancelled: {
        label: "Cancelled",
        color: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
        Icon: Clock,
    },
}

const transitionMap: Record<StaffOrderStatus, { next: StaffOrderStatus | null; actionLabel: string }> = {
    pending_payment: { next: null, actionLabel: "Waiting for payment" },
    placed: { next: "confirmed", actionLabel: "Accept Order" },
    confirmed: { next: "cooking", actionLabel: "Start Cooking" },
    cooking: { next: "on_the_way", actionLabel: "Send Out" },
    on_the_way: { next: "delivered", actionLabel: "Mark Delivered" },
    delivered: { next: null, actionLabel: "Completed" },
    cancelled: { next: null, actionLabel: "Cancelled" },
}

function formatElapsed(ms: number) {
    const totalMinutes = Math.floor(ms / 60000)
    if (totalMinutes < 1) return "just now"
    if (totalMinutes < 60) return `${totalMinutes}m ago`
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return m ? `${h}h ${m}m ago` : `${h}h ago`
}

function useElapsed(timestamp: string) {
    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 30_000)
        return () => clearInterval(t)
    }, [])
    return formatElapsed(now - new Date(timestamp).getTime())
}

export function StaffOrderCard({ order, onAdvance, onOpen, canAdvance, isUpdating, highlight }: Props) {
    const meta = statusMeta[order.status]
    const Icon = meta.Icon
    const elapsed = useElapsed(order.createdAt)
    const transition = transitionMap[order.status]
    const nextAllowed = transition.next ? canAdvance(transition.next) : false
    const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0)

    const address = order.deliveryAddress
    const addressLine = address
        ? [address.line1, address.city, address.postcode].filter(Boolean).join(", ")
        : null

    const isNew = order.status === "placed" || order.status === "confirmed"
    const isUrgent = isNew && Date.now() - new Date(order.createdAt).getTime() > 5 * 60 * 1000

    return (
        <Card
            className={cn(
                "overflow-hidden transition-all hover:shadow-lg cursor-pointer group",
                highlight && "ring-2 ring-primary animate-in slide-in-from-top-2 duration-500",
                order.status === "placed" && "border-sky-300/70",
                isUrgent && "border-amber-400 bg-amber-50/60 dark:bg-amber-950/10",
            )}
            onClick={() => onOpen(order)}
        >
            <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-mono font-semibold text-sm text-foreground truncate">
                                {order.orderNumber}
                            </p>
                            <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 gap-1", meta.color)}>
                                <Icon className="h-2.5 w-2.5" />
                                {meta.label}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                            {order.user?.name || "Guest"}
                        </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {elapsed}
                    </div>
                </div>

                {/* Items preview */}
                <div className="space-y-0.5">
                    {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                            <span className="truncate">
                                <span className="font-semibold text-foreground">{item.quantity}×</span>{" "}
                                <span className="text-muted-foreground">{item.foodItem?.name || "Item"}</span>
                            </span>
                            <span className="text-muted-foreground text-xs whitespace-nowrap">
                                £{(item.quantity * item.priceAtOrder).toFixed(2)}
                            </span>
                        </div>
                    ))}
                    {order.items.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                            +{order.items.length - 3} more…
                        </p>
                    )}
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="flex items-center gap-1">
                            {order.paymentMethod === "card" ? (
                                <CreditCard className="h-3 w-3" />
                            ) : (
                                <Banknote className="h-3 w-3" />
                            )}
                            {order.paymentMethod === "card" ? "Card" : "Cash"}
                        </span>
                        <span>{totalItems} items</span>
                    </div>
                    <span className="font-semibold text-foreground">£{Number(order.total).toFixed(2)}</span>
                </div>

                {/* Address pill (for on_the_way) */}
                {order.status === "on_the_way" && addressLine && (
                    <div className="text-xs bg-purple-50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200 border border-purple-100 dark:border-purple-900/40 rounded-lg px-2 py-1.5 flex items-start gap-1.5">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{addressLine}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs flex-1 sm:flex-initial"
                        onClick={(e) => {
                            e.stopPropagation()
                            onOpen(order)
                        }}
                    >
                        Details
                        <ChevronRight className="h-3 w-3 ml-0.5" />
                    </Button>

                    {transition.next && (
                        <Button
                            size="sm"
                            className="h-8 flex-1"
                            disabled={!nextAllowed || isUpdating}
                            onClick={(e) => {
                                e.stopPropagation()
                                if (transition.next) onAdvance(order, transition.next)
                            }}
                        >
                            {isUpdating ? "Updating…" : transition.actionLabel}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    )
}

export { statusMeta, transitionMap }
