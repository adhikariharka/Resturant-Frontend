"use client"

import Image from "next/image"
import Link from "next/link"
import {
    ArrowRight,
    Clock,
    Flame,
    Star,
    Truck,
    Utensils,
    BadgePercent,
    ChefHat,
    Soup,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    useGetFoodItemsQuery,
    useGetRestaurantStatusQuery,
    useGetCategoriesQuery,
} from "@/lib/store/api"

export function BentoGrid() {
    const { data: foodItems = [] } = useGetFoodItemsQuery(undefined)
    const { data: restaurantStatus } = useGetRestaurantStatusQuery(undefined)
    const { data: categories = [] } = useGetCategoriesQuery(undefined)

    // Find a hero item — prefer popular, then any with a discount, then any
    const popularItems = foodItems.filter((f: any) => f.isPopular && f.isAvailable)
    const discountedItems = foodItems.filter(
        (f: any) => f.isAvailable && f.discountPrice && f.discountPrice < f.price,
    )
    const heroItem = popularItems[0] || discountedItems[0] || foodItems.find((f: any) => f.isAvailable)
    const secondaryItem =
        popularItems[1] || popularItems[0] || discountedItems[0] || foodItems[1]
    const discountItem = discountedItems[0]
    const discountPct = discountItem
        ? Math.round((1 - (discountItem.discountPrice as number) / discountItem.price) * 100)
        : 0

    const isOpen = restaurantStatus?.isOpen ?? true
    const statusMessage =
        restaurantStatus?.message ||
        (isOpen ? "Open & taking orders" : "We'll be back soon")

    const displayPrice = (it: any) => (it?.discountPrice ?? it?.price ?? 0).toFixed(2)

    return (
        <section className="py-10 md:py-16">
            <div className="mb-8 md:mb-10 flex items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                        Explore The Kitchen
                    </p>
                    <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground text-balance">
                        A taste of everything we love
                    </h2>
                </div>
                <Link
                    href="/menu"
                    className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline whitespace-nowrap"
                >
                    Browse all <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-3 md:gap-4">
                {/* 1. Hero vertical card (2x2) — Chef's pick */}
                {heroItem && (
                    <Link
                        href={`/menu/${heroItem.slug}`}
                        className="group relative col-span-2 row-span-2 rounded-3xl overflow-hidden bg-muted"
                    >
                        <Image
                            src={heroItem.image || "/placeholder.svg"}
                            alt={heroItem.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        <div className="absolute top-5 left-5">
                            <div className="inline-flex items-center gap-1.5 bg-background/95 backdrop-blur text-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                                <ChefHat className="h-3.5 w-3.5 text-primary" />
                                Chef's Pick
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-white">
                            <div className="flex items-center gap-2 text-xs mb-2">
                                <div className="flex items-center gap-0.5">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                </div>
                                <span className="text-white/80">Crowd favourite</span>
                            </div>
                            <h3 className="font-serif text-2xl md:text-4xl font-semibold mb-1 text-balance">
                                {heroItem.name}
                            </h3>
                            <p className="text-white/80 text-sm md:text-base line-clamp-2 max-w-md mb-4">
                                {heroItem.description}
                            </p>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-lg md:text-xl">
                                    £{displayPrice(heroItem)}
                                </span>
                                <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold transition-transform group-hover:translate-x-1">
                                    Order now
                                    <ArrowRight className="h-3 w-3" />
                                </span>
                            </div>
                        </div>
                    </Link>
                )}

                {/* 2. Vertical — Live status (1x2) */}
                <div
                    className={cn(
                        "relative col-span-1 row-span-2 rounded-3xl overflow-hidden p-5 md:p-6 flex flex-col justify-between text-white",
                        isOpen
                            ? "bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800"
                            : "bg-gradient-to-br from-rose-500 via-rose-600 to-rose-800",
                    )}
                >
                    <div className="absolute inset-0 opacity-30 pointer-events-none">
                        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/30 blur-2xl" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
                    </div>

                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="relative flex h-2.5 w-2.5">
                                {isOpen && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                )}
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wider">
                                {isOpen ? "Live" : "Closed"}
                            </span>
                        </div>
                        <h3 className="font-serif text-xl md:text-2xl font-semibold leading-tight mb-2">
                            {isOpen ? "Kitchen is buzzing" : "Kitchen is resting"}
                        </h3>
                        <p className="text-white/85 text-xs md:text-sm line-clamp-3">
                            {statusMessage}
                        </p>
                    </div>

                    <div className="relative">
                        <div className="flex items-center gap-2 text-xs bg-white/15 backdrop-blur rounded-full px-3 py-1.5 w-fit mb-3">
                            <Clock className="h-3 w-3" />
                            Updated live
                        </div>
                        <Link
                            href="/menu"
                            className="inline-flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all"
                        >
                            {isOpen ? "Start an order" : "See the menu"}
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>

                {/* 3. Vertical — Today's best deal (1x2) */}
                <div className="relative col-span-1 row-span-2 rounded-3xl overflow-hidden bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40">
                    {discountItem?.image ? (
                        <>
                            <Image
                                src={discountItem.image}
                                alt={discountItem.name}
                                fill
                                className="object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/90 via-amber-900/60 to-transparent" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600" />
                    )}

                    <div className="relative p-5 md:p-6 h-full flex flex-col justify-between text-white">
                        <div>
                            <div className="inline-flex items-center gap-1 bg-white/95 text-amber-700 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider mb-3 shadow">
                                <BadgePercent className="h-3 w-3" />
                                {discountItem ? `${discountPct}% off` : "Hot deal"}
                            </div>
                            <h3 className="font-serif text-xl md:text-2xl font-semibold leading-tight mb-1.5 text-shadow-sm">
                                {discountItem ? discountItem.name : "Weekday Specials"}
                            </h3>
                            <p className="text-white/90 text-xs md:text-sm line-clamp-3">
                                {discountItem?.description ||
                                    "Discover our rotating chef's offers on selected mains every weekday."}
                            </p>
                        </div>

                        <div>
                            {discountItem && (
                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-xl md:text-2xl font-bold">
                                        £{discountItem.discountPrice?.toFixed(2)}
                                    </span>
                                    <span className="text-white/70 line-through text-sm">
                                        £{discountItem.price.toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <Link
                                href={discountItem ? `/menu/${discountItem.slug}` : "/menu?filter=specials"}
                                className="inline-flex items-center gap-1 bg-white text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow hover:shadow-md transition-all hover:gap-2"
                            >
                                Grab it now <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 4. Wide — Fast delivery promise (2x1) */}
                <div className="col-span-2 row-span-1 rounded-3xl overflow-hidden bg-gradient-to-r from-foreground to-foreground/80 text-background p-5 md:p-6 flex items-center gap-4 relative">
                    <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center">
                            <Truck className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs uppercase tracking-[0.2em] text-background/60 font-semibold mb-1">
                            Fast &amp; fresh
                        </p>
                        <h3 className="font-serif text-lg md:text-2xl font-semibold leading-tight mb-1">
                            At your door in 30&nbsp;minutes
                        </h3>
                        <p className="text-background/70 text-xs md:text-sm line-clamp-1">
                            Free delivery within a 5-mile radius on orders over £25.
                        </p>
                    </div>
                    <Link
                        href="/menu"
                        className="hidden md:inline-flex items-center gap-1 bg-background text-foreground px-4 py-2 rounded-full text-sm font-semibold hover:gap-2 transition-all"
                    >
                        Order now <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {/* 5. Second popular — vertical-ish (1x1) */}
                {secondaryItem && (
                    <Link
                        href={`/menu/${secondaryItem.slug}`}
                        className="group col-span-1 row-span-1 rounded-3xl overflow-hidden bg-muted relative"
                    >
                        <Image
                            src={secondaryItem.image || "/placeholder.svg"}
                            alt={secondaryItem.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute top-2 right-2">
                            <span className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 flex items-center gap-1">
                                <Flame className="h-2.5 w-2.5" />
                                Hot
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <p className="font-semibold text-sm leading-tight line-clamp-2">
                                {secondaryItem.name}
                            </p>
                            <p className="text-white/80 text-xs mt-0.5">
                                From £{displayPrice(secondaryItem)}
                            </p>
                        </div>
                    </Link>
                )}

                {/* 6. Category quick-pick (1x1) */}
                <Link
                    href="/menu"
                    className="group col-span-1 row-span-1 rounded-3xl bg-card border border-border p-4 flex flex-col justify-between hover:border-primary transition-colors"
                >
                    <div className="flex items-center gap-2 flex-wrap">
                        {categories.slice(0, 3).map((cat: any, i: number) => (
                            <span
                                key={cat.id}
                                className={cn(
                                    "text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5",
                                    i === 0
                                        ? "bg-primary/10 text-primary"
                                        : i === 1
                                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                                )}
                            >
                                {cat.name}
                            </span>
                        ))}
                        {categories.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                                +{categories.length - 3}
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Utensils className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm md:text-base leading-tight">
                            Browse the&nbsp;full menu
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {categories.length} categories &middot; {foodItems.length} dishes
                        </p>
                    </div>
                </Link>
            </div>
        </section>
    )
}

// Smaller "story strip" of vertical cards — complements the bento grid.
export function VerticalStoryStrip() {
    const { data: foodItems = [] } = useGetFoodItemsQuery(undefined)
    const items = foodItems
        .filter((i: any) => i.isAvailable)
        .slice(0, 6)

    if (items.length === 0) return null

    return (
        <section className="py-6 md:py-10">
            <div className="flex items-end justify-between mb-4 md:mb-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                        Fresh today
                    </p>
                    <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                        Straight from the pass
                    </h2>
                </div>
                <Link
                    href="/menu"
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                >
                    See all
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {items.map((item: any, idx: number) => {
                    const hasDiscount = item.discountPrice && item.discountPrice < item.price
                    return (
                        <Link
                            key={item.id}
                            href={`/menu/${item.slug}`}
                            className="group relative flex-shrink-0 w-[140px] md:w-[160px] aspect-[9/14] rounded-3xl overflow-hidden bg-muted"
                        >
                            <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

                            {/* rank chip */}
                            <div className="absolute top-2 left-2 flex items-center justify-center w-7 h-7 rounded-full bg-background/90 text-foreground font-serif text-sm font-semibold shadow">
                                {idx + 1}
                            </div>
                            {hasDiscount && (
                                <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                                    -
                                    {Math.round(
                                        (1 - item.discountPrice / item.price) * 100,
                                    )}
                                    %
                                </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                <div className="flex items-center gap-1 text-[10px] mb-1">
                                    <Soup className="h-3 w-3" />
                                    <span className="text-white/85 line-clamp-1">
                                        {item.category?.name || "Dish"}
                                    </span>
                                </div>
                                <p className="font-semibold text-sm leading-tight line-clamp-2 mb-0.5">
                                    {item.name}
                                </p>
                                <p className="text-white/85 text-xs font-medium">
                                    £{(item.discountPrice ?? item.price).toFixed(2)}
                                </p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
