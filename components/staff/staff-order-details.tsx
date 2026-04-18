"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import {
    Banknote,
    ChevronRight,
    Clock,
    Copy,
    CreditCard,
    Mail,
    MapPin,
    Phone,
    Receipt,
    StickyNote,
    XCircle,
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

// One accent colour per status for the tiny header bar + status dot.
const accentBar: Record<StaffOrderStatus, string> = {
    pending_payment: "bg-yellow-500",
    placed: "bg-sky-500",
    confirmed: "bg-indigo-500",
    cooking: "bg-orange-500",
    on_the_way: "bg-purple-500",
    delivered: "bg-emerald-500",
    cancelled: "bg-rose-500",
}

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

    const elapsed = order
        ? formatElapsed(Date.now() - new Date(order.createdAt).getTime())
        : null
    const totalItems = order?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0
    const address = order?.deliveryAddress

    const copyOrderNumber = async () => {
        if (!order) return
        try {
            await navigator.clipboard.writeText(order.orderNumber)
            toast.success("Order number copied")
        } catch {
            /* noop */
        }
    }

    return (
        <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
            {/* Solid background, no gradient; slightly wider than default. */}
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-card border-l">
                {order && meta && (
                    <>
                        {/* Coloured accent bar — quick status glance */}
                        <div className={cn("h-1 w-full flex-shrink-0", accentBar[order.status])} />

                        {/* Header block */}
                        <SheetHeader className="px-5 pt-5 pb-4 border-b bg-card">
                            {/* Status pill + elapsed */}
                            <div className="flex items-center justify-between gap-2">
                                <Badge
                                    variant="outline"
                                    className={cn("gap-1 h-6 px-2 text-[11px]", meta.color)}
                                >
                                    <meta.Icon className="h-3 w-3" />
                                    {meta.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {elapsed}
                                </span>
                            </div>

                            {/* Order number + copy */}
                            <div className="flex items-center gap-2 pr-8">
                                <SheetTitle className="font-mono text-lg text-foreground truncate">
                                    {order.orderNumber}
                                </SheetTitle>
                                <button
                                    onClick={copyOrderNumber}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    title="Copy order number"
                                    aria-label="Copy order number"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <SheetDescription className="text-sm">
                                <span className="text-foreground font-medium">
                                    {order.user?.name ?? "Guest"}
                                </span>
                                <span className="text-muted-foreground">
                                    {" · "}{totalItems} {totalItems === 1 ? "item" : "items"}{" · "}£
                                    {Number(order.total).toFixed(2)}
                                </span>
                            </SheetDescription>
                        </SheetHeader>

                        <ScrollArea className="flex-1 overflow-y-auto bg-muted/20">
                            <div className="p-5 space-y-4">
                                {/* Progress */}
                                {order.status !== "cancelled" &&
                                    order.status !== "pending_payment" && (
                                        <Panel>
                                            <SectionTitle>Progress</SectionTitle>
                                            <Progress currentIdx={currentIdx} />
                                        </Panel>
                                    )}

                                {/* Customer note */}
                                {(order as any).notes && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/40 px-3 py-2.5 flex gap-2">
                                        <StickyNote className="h-4 w-4 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-amber-950 dark:text-amber-100 min-w-0">
                                            <p className="font-semibold text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-0.5">
                                                Customer note
                                            </p>
                                            {(order as any).notes}
                                        </div>
                                    </div>
                                )}

                                {/* Customer */}
                                <Panel>
                                    <SectionTitle>Customer</SectionTitle>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                                            {(order.user?.name ?? "G").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm truncate">
                                                {order.user?.name ?? "Guest"}
                                            </p>
                                            {order.user?.email && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {order.user.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {(order.user?.email || order.user?.phone) && (
                                        <div className="flex gap-2 mt-3">
                                            {order.user?.email && (
                                                <a
                                                    href={`mailto:${order.user.email}`}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-muted hover:bg-muted/70 text-foreground rounded-lg px-3 py-2 transition-colors"
                                                >
                                                    <Mail className="h-3.5 w-3.5" />
                                                    Email
                                                </a>
                                            )}
                                            {order.user?.phone && (
                                                <a
                                                    href={`tel:${order.user.phone}`}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-muted hover:bg-muted/70 text-foreground rounded-lg px-3 py-2 transition-colors"
                                                >
                                                    <Phone className="h-3.5 w-3.5" />
                                                    Call
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </Panel>

                                {/* Delivery address */}
                                {address && (
                                    <Panel>
                                        <div className="flex items-start justify-between mb-2 gap-2">
                                            <SectionTitle className="mb-0">Delivery</SectionTitle>
                                            {address.line1 && (
                                                <a
                                                    href={`https://www.google.com/maps?q=${encodeURIComponent(
                                                        [address.line1, address.city, address.postcode]
                                                            .filter(Boolean)
                                                            .join(", "),
                                                    )}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-medium text-primary hover:underline"
                                                >
                                                    Open map
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex items-start gap-2.5">
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
                                                    <p className="text-xs italic mt-1.5 p-2 bg-muted/60 rounded-md">
                                                        &ldquo;{address.instructions}&rdquo;
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Panel>
                                )}

                                {/* Items */}
                                <Panel>
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
                                                    className="flex items-center gap-3 py-1.5"
                                                >
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/50">
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
                                                        <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center px-1 shadow-sm ring-2 ring-card">
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
                                </Panel>

                                {/* Bill */}
                                <Panel>
                                    <SectionTitle>Bill</SectionTitle>
                                    <div className="space-y-1.5 text-sm">
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
                                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 mt-1 border-t border-border/60">
                                            <span className="flex items-center gap-1.5">
                                                {order.paymentMethod === "card" ? (
                                                    <CreditCard className="h-3 w-3" />
                                                ) : (
                                                    <Banknote className="h-3 w-3" />
                                                )}
                                                {order.paymentMethod === "card"
                                                    ? "Paid by card"
                                                    : "Cash on delivery"}
                                            </span>
                                            <span className="inline-flex items-center gap-1 uppercase tracking-wider">
                                                <Receipt className="h-3 w-3" />
                                                {(order as any).paymentStatus || "paid"}
                                            </span>
                                        </div>
                                    </div>
                                </Panel>
                            </div>
                        </ScrollArea>

                        {/* Sticky action bar */}
                        <div className="p-4 border-t bg-card space-y-2 flex-shrink-0">
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

// ------- small atoms -------

function Panel({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-card border border-border/60 rounded-xl p-4 shadow-xs">
            {children}
        </div>
    )
}

function SectionTitle({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <p
            className={cn(
                "text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider",
                className,
            )}
        >
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

function Progress({ currentIdx }: { currentIdx: number }) {
    return (
        <div className="relative pt-1">
            <div className="absolute left-[15px] right-[15px] top-[22px] h-0.5 bg-border" />
            <div
                className="absolute left-[15px] top-[22px] h-0.5 bg-primary transition-all"
                style={{
                    width:
                        currentIdx <= 0
                            ? "0"
                            : `calc(${Math.min(currentIdx, statusFlow.length - 1) * 25}% - ${currentIdx === 0 ? 0 : 7.5}px)`,
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
                            className="flex flex-col items-center text-center gap-1.5 w-14"
                        >
                            <div
                                className={cn(
                                    "w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all",
                                    done
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "bg-card border-2 border-border text-muted-foreground",
                                    active && "ring-4 ring-primary/20",
                                )}
                            >
                                <stepMeta.Icon className="h-3.5 w-3.5" />
                            </div>
                            <span
                                className={cn(
                                    "text-[10px] leading-tight",
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
