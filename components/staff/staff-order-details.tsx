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
    StickyNote,
    Receipt,
    Copy,
} from "lucide-react"
import { StaffOrder, StaffOrderStatus, statusMeta, transitionMap } from "./staff-order-card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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

    const elapsed = order
        ? formatElapsed(Date.now() - new Date(order.createdAt).getTime())
        : null

    const totalItems = order?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0

    const copyOrderNumber = async () => {
        if (!order) return
        try {
            await navigator.clipboard.writeText(order.orderNumber)
            toast.success("Order number copied")
        } catch {
            /* ignore */
        }
    }

    return (
        <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-gradient-to-b from-background to-muted/30">
                {order && meta && (
                    <>
                        {/* Hero header */}
                        <SheetHeader
                            className={cn(
                                "relative p-5 pb-4 text-white bg-gradient-to-br",
                                order.status === "placed" && "from-sky-600 to-sky-800",
                                order.status === "confirmed" && "from-indigo-600 to-indigo-800",
                                order.status === "cooking" && "from-orange-600 to-orange-800",
                                order.status === "on_the_way" && "from-purple-600 to-purple-800",
                                order.status === "delivered" && "from-emerald-600 to-emerald-800",
                                order.status === "cancelled" && "from-rose-600 to-rose-800",
                                order.status === "pending_payment" && "from-yellow-600 to-yellow-800",
                            )}
                        >
                            <div className="absolute inset-0 opacity-25 pointer-events-none">
                                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white blur-3xl" />
                            </div>

                            <div className="relative space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/15 text-white border-white/30 backdrop-blur gap-1"
                                    >
                                        <meta.Icon className="h-3 w-3" />
                                        {meta.label}
                                    </Badge>
                                    <span className="text-xs flex items-center gap-1 text-white/80">
                                        <Clock className="h-3 w-3" />
                                        {elapsed}
                                    </span>
                                </div>
                                <div>
                                    <SheetTitle className="font-mono text-xl text-white flex items-center gap-2">
                                        {order.orderNumber}
                                        <button
                                            onClick={copyOrderNumber}
                                            className="opacity-70 hover:opacity-100 transition-opacity"
                                            title="Copy order number"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </button>
                                    </SheetTitle>
                                    <SheetDescription className="text-white/80 text-sm">
                                        {order.user?.name ?? "Guest"} · {totalItems}{" "}
                                        {totalItems === 1 ? "item" : "items"} · £
                                        {Number(order.total).toFixed(2)}
                                    </SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>

                        <ScrollArea className="flex-1 overflow-y-auto">
                            <div className="p-5 space-y-5">
                                {/* Progress timeline */}
                                {order.status !== "cancelled" &&
                                    order.status !== "pending_payment" && (
                                        <div className="bg-card border rounded-2xl p-4">
                                            <p className="text-[11px] font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                                                Progress
                                            </p>
                                            <div className="relative">
                                                {/* rail */}
                                                <div className="absolute left-[15px] right-[15px] top-[15px] h-0.5 bg-muted-foreground/20" />
                                                <div
                                                    className="absolute left-[15px] top-[15px] h-0.5 bg-primary transition-all"
                                                    style={{
                                                        width: `calc(${Math.max(0, currentIdx) * 25}% - ${currentIdx === 0 ? 0 : 7.5}px)`,
                                                    }}
                                                />
                                                <div className="relative flex items-start justify-between">
                                                    {statusFlow.map((s, idx) => {
                                                        const done = idx <= currentIdx
                                                        const active = idx === currentIdx
                                                        const stepMeta = statusMeta[s]
                                                        return (
                                                            <div
                                                                key={s}
                                                                className="flex flex-col items-center text-center gap-1.5 w-16"
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        "w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all",
                                                                        done
                                                                            ? "bg-primary text-primary-foreground shadow-sm"
                                                                            : "bg-background border-2 border-muted-foreground/30 text-muted-foreground",
                                                                        active && "ring-4 ring-primary/20",
                                                                    )}
                                                                >
                                                                    <stepMeta.Icon className="h-3.5 w-3.5" />
                                                                </div>
                                                                <span
                                                                    className={cn(
                                                                        "text-[10px] leading-tight",
                                                                        done
                                                                            ? "text-foreground font-medium"
                                                                            : "text-muted-foreground",
                                                                    )}
                                                                >
                                                                    {stepMeta.label}
                                                                </span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                {/* Customer note */}
                                {(order as any).notes && (
                                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 flex gap-2">
                                        <StickyNote className="h-4 w-4 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-amber-950 dark:text-amber-100">
                                            <p className="font-medium text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-0.5">
                                                Customer note
                                            </p>
                                            {(order as any).notes}
                                        </div>
                                    </div>
                                )}

                                {/* Customer card */}
                                <section>
                                    <SectionTitle>Customer</SectionTitle>
                                    <div className="bg-card rounded-xl border p-3 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                                                {(order.user?.name ?? "G").charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate text-sm">
                                                    {order.user?.name ?? "Guest"}
                                                </p>
                                                {order.user?.email && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {order.user.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {(order.user?.phone || order.user?.email) && (
                                            <div className="flex gap-1.5 pt-1">
                                                {order.user?.email && (
                                                    <a
                                                        href={`mailto:${order.user.email}`}
                                                        className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium bg-muted hover:bg-muted/70 rounded-lg px-2 py-2 transition-colors"
                                                    >
                                                        <Mail className="h-3 w-3" />
                                                        Email
                                                    </a>
                                                )}
                                                {order.user?.phone && (
                                                    <a
                                                        href={`tel:${order.user.phone}`}
                                                        className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium bg-muted hover:bg-muted/70 rounded-lg px-2 py-2 transition-colors"
                                                    >
                                                        <Phone className="h-3 w-3" />
                                                        Call
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Delivery address */}
                                {address && (
                                    <section>
                                        <SectionTitle>Delivery address</SectionTitle>
                                        <div className="bg-card rounded-xl border p-3 flex items-start gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <div className="text-sm min-w-0 flex-1">
                                                {address.label && (
                                                    <p className="font-medium">{address.label}</p>
                                                )}
                                                <p className="text-muted-foreground">{address.line1}</p>
                                                {address.line2 && (
                                                    <p className="text-muted-foreground">{address.line2}</p>
                                                )}
                                                <p className="text-muted-foreground">
                                                    {[address.city, address.postcode].filter(Boolean).join(", ")}
                                                </p>
                                                {address.instructions && (
                                                    <p className="text-xs italic mt-1 p-1.5 bg-muted/50 rounded">
                                                        &ldquo;{address.instructions}&rdquo;
                                                    </p>
                                                )}
                                            </div>
                                            {address.line1 && (
                                                <a
                                                    href={`https://www.google.com/maps?q=${encodeURIComponent(
                                                        [address.line1, address.city, address.postcode]
                                                            .filter(Boolean)
                                                            .join(", "),
                                                    )}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
                                                >
                                                    Map
                                                </a>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {/* Items */}
                                <section>
                                    <SectionTitle>
                                        Items{" "}
                                        <span className="text-muted-foreground font-normal ml-1">
                                            ({order.items.length})
                                        </span>
                                    </SectionTitle>
                                    <div className="space-y-2">
                                        {order.items.map((item) => {
                                            const img = (item as any).itemImage || item.foodItem?.image
                                            const name = (item as any).itemName || item.foodItem?.name || "Item"
                                            const lineTotal = item.priceAtOrder * item.quantity
                                            const selectedOptions: string[] = Array.isArray(item.selectedOptions)
                                                ? (item.selectedOptions as any[])
                                                    .map((o: any) => (typeof o === "string" ? o : o?.name))
                                                    .filter(Boolean)
                                                : []
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-3 p-2.5 rounded-xl bg-card border"
                                                >
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                        {img ? (
                                                            <Image
                                                                src={img}
                                                                alt={name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                                                🍽️
                                                            </div>
                                                        )}
                                                        <div className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center px-1 shadow">
                                                            {item.quantity}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            £{item.priceAtOrder.toFixed(2)} each
                                                        </p>
                                                        {selectedOptions.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {selectedOptions.map((o) => (
                                                                    <span
                                                                        key={o}
                                                                        className="text-[10px] bg-muted rounded-full px-1.5 py-0.5"
                                                                    >
                                                                        {o}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-semibold whitespace-nowrap">
                                                        £{lineTotal.toFixed(2)}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </section>

                                {/* Bill summary */}
                                <section>
                                    <SectionTitle>Bill</SectionTitle>
                                    <div className="bg-card rounded-xl border p-3 space-y-1.5 text-sm">
                                        <Row label="Subtotal" value={`£${order.subtotal.toFixed(2)}`} />
                                        <Row label="VAT" value={`£${order.tax.toFixed(2)}`} />
                                        <Row
                                            label="Service charge"
                                            value={`£${order.serviceCharge.toFixed(2)}`}
                                        />
                                        <Row
                                            label="Delivery"
                                            value={
                                                (order as any).deliveryFee != null
                                                    ? `£${Number((order as any).deliveryFee).toFixed(2)}`
                                                    : "—"
                                            }
                                        />
                                        {(order as any).discount > 0 && (
                                            <Row
                                                label="Discount"
                                                value={`-£${Number((order as any).discount).toFixed(2)}`}
                                                positive
                                            />
                                        )}
                                        <Separator className="my-2" />
                                        <Row
                                            label="Total"
                                            value={`£${order.total.toFixed(2)}`}
                                            bold
                                        />
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
                                            {order.paymentMethod === "card" ? (
                                                <CreditCard className="h-3 w-3" />
                                            ) : (
                                                <Banknote className="h-3 w-3" />
                                            )}
                                            {order.paymentMethod === "card"
                                                ? "Paid by card"
                                                : "Cash on delivery"}
                                            <span className="ml-auto">
                                                <Receipt className="h-3 w-3 inline mr-0.5" />
                                                {(order as any).paymentStatus || "paid"}
                                            </span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </ScrollArea>

                        {/* Action bar */}
                        <div className="p-4 border-t bg-card/80 backdrop-blur space-y-2">
                            {transition?.next && (
                                <Button
                                    size="lg"
                                    className="w-full shadow-sm"
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
                                        Cancel order
                                    </Button>
                                )}
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            {children}
        </p>
    )
}

function Row({
    label,
    value,
    bold,
    positive,
}: {
    label: string
    value: string
    bold?: boolean
    positive?: boolean
}) {
    return (
        <div className="flex justify-between">
            <span className={cn("text-muted-foreground", bold && "text-foreground font-semibold")}>
                {label}
            </span>
            <span
                className={cn(
                    positive && "text-emerald-600 dark:text-emerald-400",
                    bold && "font-semibold text-foreground",
                )}
            >
                {value}
            </span>
        </div>
    )
}

function formatElapsed(ms: number) {
    const minutes = Math.floor(ms / 60000)
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m ? `${h}h ${m}m ago` : `${h}h ago`
}
