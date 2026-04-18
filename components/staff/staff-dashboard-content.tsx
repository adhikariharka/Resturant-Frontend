"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Bell,
    BellOff,
    ChefHat,
    CircleDot,
    CreditCard,
    LayoutGrid,
    List,
    LogOut,
    RefreshCw,
    Search,
    Sparkles,
    Truck,
    PackageCheck,
    PoundSterling,
    Timer,
    WifiOff,
    Wifi,
    CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { API_URL } from "@/lib/store/api"
import {
    clearStaffSession,
    getStaffSession,
    hasPermission,
    StaffSession,
} from "@/lib/staff-auth"
import { useStaffSocket } from "@/lib/use-staff-socket"
import {
    StaffOrder,
    StaffOrderCard,
    StaffOrderStatus,
    statusMeta,
} from "./staff-order-card"
import { StaffOrderDetails } from "./staff-order-details"

type ViewMode = "board" | "list"
type ActiveFilter = "all" | StaffOrderStatus

const kanbanColumns: Array<{ status: StaffOrderStatus; title: string; Icon: any; accent: string }> = [
    { status: "placed", title: "New", Icon: Sparkles, accent: "sky" },
    { status: "confirmed", title: "Confirmed", Icon: CheckCircle2, accent: "indigo" },
    { status: "cooking", title: "Cooking", Icon: ChefHat, accent: "orange" },
    { status: "on_the_way", title: "On the Way", Icon: Truck, accent: "purple" },
    { status: "delivered", title: "Delivered", Icon: PackageCheck, accent: "emerald" },
]

function useBeep() {
    const ctxRef = useRef<AudioContext | null>(null)

    const play = useCallback(() => {
        try {
            if (typeof window === "undefined") return
            if (!ctxRef.current) {
                const AudioCtx =
                    (window.AudioContext as any) || (window as any).webkitAudioContext
                if (!AudioCtx) return
                ctxRef.current = new AudioCtx()
            }
            const ctx = ctxRef.current!
            if (ctx.state === "suspended") ctx.resume()

            const now = ctx.currentTime
            const notes = [880, 1100, 1320]
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = "sine"
                osc.frequency.value = freq
                gain.gain.value = 0
                osc.connect(gain)
                gain.connect(ctx.destination)

                const start = now + i * 0.12
                const end = start + 0.18
                gain.gain.setValueAtTime(0, start)
                gain.gain.linearRampToValueAtTime(0.22, start + 0.015)
                gain.gain.exponentialRampToValueAtTime(0.0001, end)
                osc.start(start)
                osc.stop(end + 0.05)
            })
        } catch {
            /* noop */
        }
    }, [])

    return play
}

export function StaffDashboardContent() {
    const router = useRouter()
    const [session, setSession] = useState<StaffSession | null>(null)
    const [authChecked, setAuthChecked] = useState(false)

    const [orders, setOrders] = useState<StaffOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [soundOn, setSoundOn] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>("board")
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<ActiveFilter>("all")
    const [selected, setSelected] = useState<StaffOrder | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set())
    const playBeep = useBeep()

    // ------- Auth bootstrap -------
    useEffect(() => {
        const existing = getStaffSession()
        if (!existing) {
            router.replace("/login")
            return
        }
        setSession(existing)
        setAuthChecked(true)
    }, [router])

    // ------- Fetch orders -------
    const fetchOrders = useCallback(
        async (showSpinner = false) => {
            if (!session) return
            if (showSpinner) setRefreshing(true)
            try {
                const res = await fetch(`${API_URL}/staff/orders`, {
                    headers: { Authorization: `Bearer ${session.token}` },
                })
                if (res.status === 401) {
                    clearStaffSession()
                    toast.error("Session expired. Please sign in again.")
                    router.replace("/login")
                    return
                }
                if (!res.ok) {
                    toast.error("Failed to load orders.")
                    return
                }
                const data: StaffOrder[] = await res.json()
                setOrders(data)
            } catch (e) {
                console.error(e)
                toast.error("Unable to reach the kitchen server.")
            } finally {
                setLoading(false)
                if (showSpinner) setRefreshing(false)
            }
        },
        [session, router],
    )

    useEffect(() => {
        if (!session) return
        fetchOrders()
    }, [session, fetchOrders])

    // Polling fallback
    useEffect(() => {
        if (!session) return
        const t = setInterval(() => fetchOrders(), 45_000)
        return () => clearInterval(t)
    }, [session, fetchOrders])

    // ------- Socket.io real-time -------
    const clearHighlight = useCallback((id: string) => {
        setTimeout(() => {
            setHighlightIds((prev) => {
                if (!prev.has(id)) return prev
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }, 6000)
    }, [])

    useStaffSocket(!!session, {
        onConnectChange: setIsConnected,
        onNewOrder: (order) => {
            setOrders((prev) => {
                if (prev.some((o) => o.id === order.id)) return prev
                return [order, ...prev]
            })
            setHighlightIds((prev) => {
                const next = new Set(prev)
                next.add(order.id)
                return next
            })
            clearHighlight(order.id)
            if (soundOn) playBeep()
            toast.success(`New order #${order.orderNumber}`, {
                description: `${order.user?.name || "Guest"} · £${Number(order.total).toFixed(2)}`,
                duration: 5000,
            })
        },
        onOrderUpdated: ({ orderId, status, order: updatedOrder }) => {
            setOrders((prev) => {
                // Remove delivered/cancelled from the active view
                if (status === "delivered" || status === "cancelled") {
                    return prev.filter((o) => o.id !== orderId)
                }
                return prev.map((o) =>
                    o.id === orderId ? { ...o, ...(updatedOrder || {}), status: status as StaffOrderStatus } : o,
                )
            })
        },
    })

    // ------- Status update -------
    const updateStatus = useCallback(
        async (order: StaffOrder, status: StaffOrderStatus) => {
            if (!session) return
            setUpdatingId(order.id)
            try {
                const res = await fetch(`${API_URL}/staff/orders/${order.id}/status`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.token}`,
                    },
                    body: JSON.stringify({ status }),
                })
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}))
                    toast.error(err?.message || "Failed to update status")
                    return
                }
                toast.success(`Order moved to ${statusMeta[status].label}`)
                // Optimistic update — socket will confirm
                setOrders((prev) =>
                    status === "delivered" || status === "cancelled"
                        ? prev.filter((o) => o.id !== order.id)
                        : prev.map((o) => (o.id === order.id ? { ...o, status } : o)),
                )
                if (selected?.id === order.id) {
                    if (status === "delivered" || status === "cancelled") {
                        setSelected(null)
                    } else {
                        setSelected({ ...order, status })
                    }
                }
            } catch (e) {
                console.error(e)
                toast.error("Unable to update status")
            } finally {
                setUpdatingId(null)
            }
        },
        [session, selected],
    )

    const canAdvance = useCallback(
        (next: StaffOrderStatus) => {
            if (!session) return false
            if (session.role === "admin") return true
            if (["confirmed", "cooking", "on_the_way"].includes(next) && hasPermission("kitchen")) return true
            if (next === "delivered" && hasPermission("delivery")) return true
            return false
        },
        [session],
    )
    const canCancel = session?.role === "admin"

    // ------- Logout -------
    const logout = () => {
        clearStaffSession()
        toast.success("Signed out")
        router.replace("/login")
    }

    // ------- Derived: filtering & stats -------
    const visibleOrders = useMemo(() => {
        const q = search.trim().toLowerCase()
        return orders.filter((o) => {
            const matchesSearch =
                !q ||
                o.orderNumber.toLowerCase().includes(q) ||
                (o.user?.name || "").toLowerCase().includes(q) ||
                (o.user?.email || "").toLowerCase().includes(q)
            const matchesFilter = filter === "all" || o.status === filter
            return matchesSearch && matchesFilter
        })
    }, [orders, search, filter])

    const stats = useMemo(() => {
        const now = Date.now()
        const today = new Date().toDateString()
        const active = orders.length
        const todays = orders.filter(
            (o) => new Date(o.createdAt).toDateString() === today,
        )
        const revenueToday = todays.reduce((sum, o) => sum + Number(o.total || 0), 0)
        const newCount = orders.filter((o) => o.status === "placed").length
        const cookingCount = orders.filter((o) => o.status === "cooking").length
        const urgent = orders.filter(
            (o) =>
                (o.status === "placed" || o.status === "confirmed") &&
                now - new Date(o.createdAt).getTime() > 5 * 60 * 1000,
        ).length
        return { active, revenueToday, newCount, cookingCount, urgent }
    }, [orders])

    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/40">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b border-border">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                            <ChefHat className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-serif text-base sm:text-lg font-semibold text-foreground leading-tight">
                                Kitchen Console
                            </h1>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="truncate max-w-[120px] sm:max-w-none">{session?.name}</span>
                                <span aria-hidden>•</span>
                                <Badge
                                    variant="outline"
                                    className="h-4 px-1 text-[9px] uppercase tracking-wider font-semibold"
                                >
                                    {session?.role}
                                </Badge>
                                <span
                                    className={cn(
                                        "flex items-center gap-1 ml-1",
                                        isConnected ? "text-emerald-600" : "text-rose-600",
                                    )}
                                    title={isConnected ? "Live connection" : "Offline — reconnecting…"}
                                >
                                    {isConnected ? (
                                        <Wifi className="h-3 w-3" />
                                    ) : (
                                        <WifiOff className="h-3 w-3" />
                                    )}
                                    <CircleDot
                                        className={cn(
                                            "h-2 w-2",
                                            isConnected ? "text-emerald-500 animate-pulse" : "text-rose-500",
                                        )}
                                    />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSoundOn((v) => !v)}
                            title={soundOn ? "Mute new-order sound" : "Unmute new-order sound"}
                        >
                            {soundOn ? (
                                <Bell className="h-4 w-4" />
                            ) : (
                                <BellOff className="h-4 w-4 text-muted-foreground" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => fetchOrders(true)}
                            disabled={refreshing}
                            title="Refresh"
                        >
                            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={logout} className="gap-1.5">
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Sign out</span>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full p-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard
                        label="Active Orders"
                        value={stats.active}
                        Icon={ChefHat}
                        accent="primary"
                        hint={`${stats.newCount} new · ${stats.cookingCount} cooking`}
                    />
                    <StatCard
                        label="New Today"
                        value={stats.newCount}
                        Icon={Sparkles}
                        accent="sky"
                        hint={stats.newCount === 0 ? "All caught up" : "Tap to filter"}
                        onClick={() => setFilter(filter === "placed" ? "all" : "placed")}
                        active={filter === "placed"}
                    />
                    <StatCard
                        label="Urgent"
                        value={stats.urgent}
                        Icon={Timer}
                        accent="amber"
                        hint="Older than 5 min"
                    />
                    <StatCard
                        label="Revenue Today"
                        value={`£${stats.revenueToday.toFixed(2)}`}
                        Icon={PoundSterling}
                        accent="emerald"
                        hint={`${orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString()).length} orders`}
                    />
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search order #, customer name or email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                        <TabsList>
                            <TabsTrigger value="board" className="gap-1.5">
                                <LayoutGrid className="h-3.5 w-3.5" />
                                Board
                            </TabsTrigger>
                            <TabsTrigger value="list" className="gap-1.5">
                                <List className="h-3.5 w-3.5" />
                                List
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                    <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
                    {(
                        [
                            { k: "placed", label: "New" },
                            { k: "confirmed", label: "Confirmed" },
                            { k: "cooking", label: "Cooking" },
                            { k: "on_the_way", label: "On the Way" },
                        ] as Array<{ k: StaffOrderStatus; label: string }>
                    ).map(({ k, label }) => {
                        const count = orders.filter((o) => o.status === k).length
                        return (
                            <FilterChip
                                key={k}
                                label={`${label}${count ? ` · ${count}` : ""}`}
                                active={filter === k}
                                onClick={() => setFilter(k)}
                            />
                        )
                    })}
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingState />
                ) : orders.length === 0 ? (
                    <EmptyKitchenState />
                ) : viewMode === "board" ? (
                    <KanbanBoard
                        orders={visibleOrders}
                        onAdvance={updateStatus}
                        onOpen={setSelected}
                        canAdvance={canAdvance}
                        updatingId={updatingId}
                        highlightIds={highlightIds}
                    />
                ) : (
                    <ListView
                        orders={visibleOrders}
                        onAdvance={updateStatus}
                        onOpen={setSelected}
                        canAdvance={canAdvance}
                        updatingId={updatingId}
                        highlightIds={highlightIds}
                    />
                )}
            </div>

            {/* Details Sheet */}
            <StaffOrderDetails
                order={selected}
                onClose={() => setSelected(null)}
                onAdvance={updateStatus}
                onCancel={(o) => updateStatus(o, "cancelled")}
                canAdvance={canAdvance}
                canCancel={!!canCancel}
                isUpdating={!!updatingId}
            />
        </div>
    )
}

// -------- Sub-components --------

function StatCard({
    label,
    value,
    Icon,
    accent,
    hint,
    onClick,
    active,
}: {
    label: string
    value: string | number
    Icon: any
    accent: "primary" | "sky" | "amber" | "emerald"
    hint?: string
    onClick?: () => void
    active?: boolean
}) {
    const accentClasses: Record<string, string> = {
        primary: "from-primary/10 to-primary/5 text-primary",
        sky: "from-sky-500/10 to-sky-500/5 text-sky-600 dark:text-sky-400",
        amber: "from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400",
        emerald:
            "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    }
    const ringClasses: Record<string, string> = {
        primary: "ring-primary/40",
        sky: "ring-sky-400/50",
        amber: "ring-amber-400/50",
        emerald: "ring-emerald-400/50",
    }
    return (
        <Card
            onClick={onClick}
            className={cn(
                "p-3 transition-all bg-gradient-to-br",
                accentClasses[accent],
                onClick && "cursor-pointer hover:shadow-md",
                active && "ring-2",
                active && ringClasses[accent],
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
                        {label}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
                    {hint && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{hint}</p>}
                </div>
                <div className="rounded-lg p-2 bg-background/60">
                    <Icon className="h-4 w-4" />
                </div>
            </div>
        </Card>
    )
}

function FilterChip({
    label,
    active,
    onClick,
}: {
    label: string
    active: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
            )}
        >
            {label}
        </button>
    )
}

function KanbanBoard({
    orders,
    onAdvance,
    onOpen,
    canAdvance,
    updatingId,
    highlightIds,
}: {
    orders: StaffOrder[]
    onAdvance: (order: StaffOrder, next: StaffOrderStatus) => void
    onOpen: (order: StaffOrder) => void
    canAdvance: (next: StaffOrderStatus) => boolean
    updatingId: string | null
    highlightIds: Set<string>
}) {
    // Show the first 4 columns only (delivered will rarely be here since we remove after delivery)
    const columns = kanbanColumns.slice(0, 4)
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {columns.map((col) => {
                const colOrders = orders.filter((o) => o.status === col.status)
                return (
                    <div key={col.status} className="flex flex-col gap-2 min-h-[200px]">
                        <div className="flex items-center justify-between pb-1 border-b border-border/70">
                            <div className="flex items-center gap-1.5">
                                <col.Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                    {col.title}
                                </h3>
                            </div>
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                {colOrders.length}
                            </Badge>
                        </div>
                        <div className="space-y-2 flex-1">
                            {colOrders.length === 0 ? (
                                <div className="text-center text-xs text-muted-foreground py-6 border border-dashed border-border/60 rounded-xl">
                                    No orders
                                </div>
                            ) : (
                                colOrders.map((o) => (
                                    <StaffOrderCard
                                        key={o.id}
                                        order={o}
                                        onAdvance={onAdvance}
                                        onOpen={onOpen}
                                        canAdvance={canAdvance}
                                        isUpdating={updatingId === o.id}
                                        highlight={highlightIds.has(o.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function ListView({
    orders,
    onAdvance,
    onOpen,
    canAdvance,
    updatingId,
    highlightIds,
}: {
    orders: StaffOrder[]
    onAdvance: (order: StaffOrder, next: StaffOrderStatus) => void
    onOpen: (order: StaffOrder) => void
    canAdvance: (next: StaffOrderStatus) => boolean
    updatingId: string | null
    highlightIds: Set<string>
}) {
    if (orders.length === 0) {
        return (
            <Card className="p-10 text-center text-muted-foreground">
                No orders match your filters.
            </Card>
        )
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {orders.map((o) => (
                <StaffOrderCard
                    key={o.id}
                    order={o}
                    onAdvance={onAdvance}
                    onOpen={onOpen}
                    canAdvance={canAdvance}
                    isUpdating={updatingId === o.id}
                    highlight={highlightIds.has(o.id)}
                />
            ))}
        </div>
    )
}

function LoadingState() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    {Array.from({ length: 2 }).map((_, j) => (
                        <div
                            key={j}
                            className="h-40 bg-muted/60 animate-pulse rounded-xl border border-border/50"
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

function EmptyKitchenState() {
    return (
        <Card className="p-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <ChefHat className="h-7 w-7" />
            </div>
            <h3 className="font-serif text-lg font-semibold">All caught up!</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                No active orders in the kitchen right now. New orders will appear here in real time.
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                Waiting for the next ticket…
            </div>
        </Card>
    )
}
