"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import {
    MapPin,
    Clock,
    CreditCard,
    Banknote,
    Phone,
    Mail,
    User,
    ChevronRight,
    XCircle,
} from "lucide-react"
import { StaffOrder, StaffOrderStatus, statusMeta, transitionMap } from "./staff-order-card"
import { cn } from "@/lib/utils"

interface Props {
    order: StaffOrder | null
    onClose: () => void
    onAdvance: (order: StaffOrder, next: StaffOrderStatus) => void
    onCancel: (order: StaffOrder) => void
    canAdvance: (next: StaffOrderStatus) => boolean
    canCancel: boolean
    isUpdating?: boolean
}

const statusFlow: StaffOrderStatus[] = ["placed", "confirmed", "cooking", "on_the_way", "delivered"]

export function StaffOrderDetails({
    order,
    onClose,
    onAdvance,
    onCancel,
    canAdvance,
    canCancel,
    isUpdating,
}: Props) {
    const open = !!order
    const meta = order ? statusMeta[order.status] : null
    const transition = order ? transitionMap[order.status] : null

    const currentIdx = order ? statusFlow.indexOf(order.status) : -1
    const address = order?.deliveryAddress

    return (
        <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
                {order && meta && (
                    <>
                        <SheetHeader className="p-5 pb-3 border-b">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <SheetTitle className="font-mono text-base">{order.orderNumber}</SheetTitle>
                                    <SheetDescription className="flex items-center gap-1.5 mt-1">
                                        <Clock className="h-3 w-3" />
                                        Placed{" "}
                                        {new Date(order.createdAt).toLocaleString("en-GB", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </SheetDescription>
                                </div>
                                <Badge variant="outline" className={cn("gap-1", meta.color)}>
                                    <meta.Icon className="h-3 w-3" />
                                    {meta.label}
                                </Badge>
                            </div>
                        </SheetHeader>

                        <ScrollArea className="flex-1 overflow-y-auto">
                            <div className="p-5 space-y-5">
                                {/* Progress timeline */}
                                {order.status !== "cancelled" && order.status !== "pending_payment" && (
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                            Progress
                                        </p>
                                        <div className="flex items-center justify-between">
                                            {statusFlow.map((s, idx) => {
                                                const done = idx <= currentIdx
                                                const active = idx === currentIdx
                                                const stepMeta = statusMeta[s]
                                                return (
                                                    <div key={s} className="flex-1 flex flex-col items-center text-center">
                                                        <div
                                                            className={cn(
                                                                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                                                                done
                                                                    ? "bg-primary border-primary text-primary-foreground"
                                                                    : "bg-muted border-border text-muted-foreground",
                                                                active && "ring-4 ring-primary/20",
                                                            )}
                                                        >
                                                            <stepMeta.Icon className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span
                                                            className={cn(
                                                                "text-[10px] mt-1 leading-tight",
                                                                done ? "text-foreground font-medium" : "text-muted-foreground",
                                                            )}
                                                        >
                                                            {stepMeta.label}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Customer */}
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                        Customer
                                    </p>
                                    <div className="bg-muted/40 rounded-xl p-3 space-y-1.5">
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{order.user?.name || "Guest"}</span>
                                        </div>
                                        {order.user?.email && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-4 w-4" />
                                                <span className="truncate">{order.user.email}</span>
                                            </div>
                                        )}
                                        {order.user?.phone && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <a href={`tel:${order.user.phone}`} className="hover:underline">
                                                    {order.user.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Delivery address */}
                                {address && (
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                            Delivery Address
                                        </p>
                                        <div className="bg-muted/40 rounded-xl p-3 flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                            <div className="text-sm">
                                                {address.label && (
                                                    <p className="font-medium">{address.label}</p>
                                                )}
                                                <p>{address.line1}</p>
                                                {address.line2 && <p>{address.line2}</p>}
                                                <p>
                                                    {[address.city, address.postcode].filter(Boolean).join(", ")}
                                                </p>
                                                {address.instructions && (
                                                    <p className="text-xs text-muted-foreground italic mt-1">
                                                        Note: {address.instructions}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Items */}
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                        Items ({order.items.length})
                                    </p>
                                    <div className="space-y-2">
                                        {order.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-3 p-2 rounded-xl bg-card border border-border/50"
                                            >
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                    {item.foodItem?.image ? (
                                                        <Image
                                                            src={item.foodItem.image}
                                                            alt={item.foodItem.name || "Item"}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                                            🍽️
                                                        </div>
                                                    )}
                                                    <div className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center px-1">
                                                        {item.quantity}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {item.foodItem?.name || "Item"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        £{item.priceAtOrder.toFixed(2)} each
                                                    </p>
                                                </div>
                                                <p className="text-sm font-semibold">
                                                    £{(item.priceAtOrder * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bill summary */}
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                        Bill Summary
                                    </p>
                                    <div className="bg-muted/40 rounded-xl p-3 space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>£{order.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">VAT</span>
                                            <span>£{order.tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Service charge</span>
                                            <span>£{order.serviceCharge.toFixed(2)}</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-semibold">
                                            <span>Total</span>
                                            <span>£{order.total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                                            {order.paymentMethod === "card" ? (
                                                <CreditCard className="h-3 w-3" />
                                            ) : (
                                                <Banknote className="h-3 w-3" />
                                            )}
                                            Paid via {order.paymentMethod === "card" ? "card" : "cash on delivery"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        {/* Action bar */}
                        <div className="p-4 border-t bg-card/50 space-y-2">
                            {transition?.next && (
                                <Button
                                    size="lg"
                                    className="w-full"
                                    disabled={!canAdvance(transition.next) || isUpdating}
                                    onClick={() => onAdvance(order, transition.next!)}
                                >
                                    {isUpdating ? "Updating…" : transition.actionLabel}
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            )}
                            {canCancel &&
                                order.status !== "cancelled" &&
                                order.status !== "delivered" && (
                                    <Button
                                        variant="outline"
                                        className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
                                        size="sm"
                                        disabled={isUpdating}
                                        onClick={() => onCancel(order)}
                                    >
                                        <XCircle className="h-4 w-4 mr-1.5" />
                                        Cancel Order
                                    </Button>
                                )}
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
