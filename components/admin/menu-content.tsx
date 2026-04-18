"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import {
    ChevronDown,
    Flame,
    ImageIcon,
    MoreVertical,
    Pencil,
    Plus,
    Search,
    Sparkles,
    Trash2,
    UtensilsCrossed,
    X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
    useCreateFoodItemMutation,
    useDeleteFoodItemMutation,
    useGetCategoriesQuery,
    useGetFoodItemsQuery,
    useUpdateFoodItemMutation,
} from "@/lib/store/api"
import { toast } from "sonner"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"

type FormState = {
    name: string
    slug: string
    description: string
    price: string
    discountPrice: string
    categoryId: string
    image: string
    isAvailable: boolean
    isPopular: boolean
    tags: string[]
    allergens: string[]
    quantity: string
    preparationTime: string
    calories: string
    spicyLevel: number
}

const emptyForm: FormState = {
    name: "",
    slug: "",
    description: "",
    price: "",
    discountPrice: "",
    categoryId: "",
    image: "",
    isAvailable: true,
    isPopular: false,
    tags: [],
    allergens: [],
    quantity: "50",
    preparationTime: "15",
    calories: "",
    spicyLevel: 0,
}

const ALLERGENS = [
    "gluten",
    "dairy",
    "egg",
    "nuts",
    "peanuts",
    "soy",
    "fish",
    "shellfish",
    "sesame",
    "sulphites",
    "celery",
    "mustard",
    "molluscs",
    "lupin",
]

function toSlug(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

type FilterKey = "all" | "available" | "out" | "popular" | "discount"

export function AdminMenuContent() {
    const [searchQuery, setSearchQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<FilterKey>("all")
    const { data: menuItems = [], isLoading } = useGetFoodItemsQuery(undefined)
    const { data: categories = [] } = useGetCategoriesQuery(undefined)
    const [createFoodItem, { isLoading: isCreating }] = useCreateFoodItemMutation()
    const [updateFoodItem, { isLoading: isUpdating }] = useUpdateFoodItemMutation()
    const [deleteFoodItem] = useDeleteFoodItemMutation()

    const [isSheetOpen, setSheetOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<FormState>(emptyForm)
    const [slugDirty, setSlugDirty] = useState(false)
    const [tagInput, setTagInput] = useState("")

    const filteredItems = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        return menuItems.filter((item: any) => {
            const matchesSearch =
                !q ||
                item.name.toLowerCase().includes(q) ||
                (item.category?.name || "").toLowerCase().includes(q) ||
                (item.tags || []).some((t: string) => t.toLowerCase().includes(q))
            const matchesCategory = categoryFilter === "all" || item.categoryId === categoryFilter
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "available" && item.isAvailable) ||
                (statusFilter === "out" && !item.isAvailable) ||
                (statusFilter === "popular" && item.isPopular) ||
                (statusFilter === "discount" && item.discountPrice != null)
            return matchesSearch && matchesCategory && matchesStatus
        })
    }, [menuItems, searchQuery, categoryFilter, statusFilter])

    const openCreate = () => {
        setEditingId(null)
        setForm(emptyForm)
        setSlugDirty(false)
        setTagInput("")
        setSheetOpen(true)
    }

    const openEdit = (item: any) => {
        setEditingId(item.id)
        setForm({
            name: item.name ?? "",
            slug: item.slug ?? "",
            description: item.description ?? "",
            price: item.price?.toString() ?? "",
            discountPrice: item.discountPrice != null ? String(item.discountPrice) : "",
            categoryId: item.categoryId ?? "",
            image: item.image ?? "",
            isAvailable: item.isAvailable ?? true,
            isPopular: item.isPopular ?? false,
            tags: Array.isArray(item.tags) ? item.tags : [],
            allergens: Array.isArray(item.allergens) ? item.allergens : [],
            quantity: item.quantity?.toString() ?? "50",
            preparationTime: item.preparationTime?.toString() ?? "15",
            calories: item.calories != null ? String(item.calories) : "",
            spicyLevel: item.spicyLevel ?? 0,
        })
        setSlugDirty(true)
        setTagInput("")
        setSheetOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.categoryId) {
            toast.error("Please select a category")
            return
        }
        if (!form.image) {
            toast.error("Please upload an image for the dish")
            return
        }

        const priceNum = parseFloat(form.price)
        if (!Number.isFinite(priceNum) || priceNum <= 0) {
            toast.error("Price must be a positive number")
            return
        }

        const discountNum = form.discountPrice ? parseFloat(form.discountPrice) : null
        if (discountNum != null && (!Number.isFinite(discountNum) || discountNum <= 0 || discountNum >= priceNum)) {
            toast.error("Discount price must be lower than the regular price")
            return
        }

        const payload = {
            name: form.name.trim(),
            slug: (form.slug || toSlug(form.name)).trim(),
            description: form.description.trim(),
            price: priceNum,
            discountPrice: discountNum,
            categoryId: form.categoryId,
            image: form.image,
            isAvailable: form.isAvailable,
            isPopular: form.isPopular,
            tags: form.tags,
            allergens: form.allergens,
            quantity: parseInt(form.quantity || "0", 10),
            preparationTime: parseInt(form.preparationTime || "0", 10),
            calories: form.calories ? parseInt(form.calories, 10) : null,
            spicyLevel: form.spicyLevel,
        }

        try {
            if (editingId) {
                await updateFoodItem({ id: editingId, ...payload }).unwrap()
                toast.success("Item updated")
            } else {
                await createFoodItem(payload).unwrap()
                toast.success("Item added to menu")
            }
            setSheetOpen(false)
            setEditingId(null)
            setForm(emptyForm)
        } catch (err: any) {
            console.error("Submit error:", err)
            toast.error(err?.data?.message || "Failed to save item")
        }
    }

    const handleDelete = async (item: any) => {
        if (!confirm(`Remove "${item.name}" from the menu?`)) return
        try {
            await deleteFoodItem(item.id).unwrap()
            toast.success("Item deleted")
        } catch {
            toast.error("Failed to delete item")
        }
    }

    const addTag = (raw: string) => {
        const t = raw.trim().toLowerCase()
        if (!t) return
        setForm((f) => ({ ...f, tags: Array.from(new Set([...f.tags, t])) }))
        setTagInput("")
    }

    const removeTag = (tag: string) =>
        setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))

    const toggleAllergen = (allergen: string) =>
        setForm((f) => ({
            ...f,
            allergens: f.allergens.includes(allergen)
                ? f.allergens.filter((a) => a !== allergen)
                : [...f.allergens, allergen],
        }))

    const selectedCategory = categories.find((c: any) => c.id === form.categoryId)

    const statusFilterLabel: Record<FilterKey, string> = {
        all: "All",
        available: "Available",
        out: "Out of stock",
        popular: "Popular",
        discount: "On sale",
    }

    return (
        <div className="space-y-5">
            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Menu items</h1>
                    <p className="text-sm text-muted-foreground">
                        {menuItems.length} dishes · {menuItems.filter((m: any) => m.isAvailable).length} available
                        {menuItems.filter((m: any) => m.isPopular).length > 0 && (
                            <> · {menuItems.filter((m: any) => m.isPopular).length} marked popular</>
                        )}
                    </p>
                </div>
                <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <Button className="gap-1.5 w-full md:w-auto" onClick={openCreate}>
                            <Plus className="w-4 h-4" />
                            New dish
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="p-0 sm:max-w-xl flex flex-col overflow-hidden">
                        <SheetHeader className="px-6 pt-6 pb-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <UtensilsCrossed className="w-5 h-5" />
                                </div>
                                <div>
                                    <SheetTitle className="text-base">
                                        {editingId ? "Edit dish" : "Add a new dish"}
                                    </SheetTitle>
                                    <SheetDescription className="text-xs">
                                        Dishes appear on the customer menu and in the kitchen console.
                                    </SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                            <div className="px-6 py-5 space-y-6">
                                {/* Section: Basics */}
                                <section className="space-y-3">
                                    <SectionTitle>Details</SectionTitle>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="item-name">Name</Label>
                                        <Input
                                            id="item-name"
                                            placeholder="e.g. Beef Wellington"
                                            value={form.name}
                                            onChange={(e) => {
                                                const next = e.target.value
                                                setForm((f) => ({
                                                    ...f,
                                                    name: next,
                                                    slug: slugDirty ? f.slug : toSlug(next),
                                                }))
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="item-slug">URL slug</Label>
                                        <Input
                                            id="item-slug"
                                            placeholder="beef-wellington"
                                            value={form.slug}
                                            onChange={(e) => {
                                                setSlugDirty(true)
                                                setForm({ ...form, slug: toSlug(e.target.value) })
                                            }}
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                            Shown as <code className="text-foreground">/menu/{form.slug || "beef-wellington"}</code>
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="item-description">Description</Label>
                                        <Textarea
                                            id="item-description"
                                            rows={3}
                                            placeholder="Tell customers what makes this dish special."
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="item-category">Category</Label>
                                        <div className="relative">
                                            <select
                                                id="item-category"
                                                value={form.categoryId}
                                                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                                className="appearance-none w-full h-10 rounded-md border border-input bg-background pl-3 pr-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                                                required
                                            >
                                                <option value="">Select a category…</option>
                                                {categories.map((category: any) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        </div>
                                        {selectedCategory && (
                                            <p className="text-[11px] text-muted-foreground">
                                                Appears under <span className="font-medium">{selectedCategory.name}</span>
                                            </p>
                                        )}
                                    </div>
                                </section>

                                <Divider />

                                {/* Section: Pricing & stock */}
                                <section className="space-y-3">
                                    <SectionTitle>Pricing &amp; stock</SectionTitle>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="item-price">Price (£)</Label>
                                            <Input
                                                id="item-price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={form.price}
                                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="item-discount">Discount price (£)</Label>
                                            <Input
                                                id="item-discount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="Optional"
                                                value={form.discountPrice}
                                                onChange={(e) =>
                                                    setForm({ ...form, discountPrice: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="item-stock">Stock</Label>
                                            <Input
                                                id="item-stock"
                                                type="number"
                                                min="0"
                                                value={form.quantity}
                                                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="item-prep">Prep (min)</Label>
                                            <Input
                                                id="item-prep"
                                                type="number"
                                                min="0"
                                                value={form.preparationTime}
                                                onChange={(e) =>
                                                    setForm({ ...form, preparationTime: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="item-calories">Calories</Label>
                                            <Input
                                                id="item-calories"
                                                type="number"
                                                min="0"
                                                placeholder="Optional"
                                                value={form.calories}
                                                onChange={(e) => setForm({ ...form, calories: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <Divider />

                                {/* Section: Image */}
                                <section className="space-y-3">
                                    <SectionTitle>Photo</SectionTitle>
                                    <ImageUpload
                                        value={form.image}
                                        onChange={(url) => setForm({ ...form, image: url })}
                                        aspectRatio="video"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        16:9 images look best — keep the dish centred with some plate/background around it.
                                    </p>
                                </section>

                                <Divider />

                                {/* Section: Tags */}
                                <section className="space-y-3">
                                    <SectionTitle>Tags</SectionTitle>
                                    <div>
                                        <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                                            {form.tags.length === 0 ? (
                                                <span className="text-xs text-muted-foreground">No tags yet.</span>
                                            ) : (
                                                form.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2 py-1"
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(tag)}
                                                            className="hover:text-destructive"
                                                            aria-label={`Remove ${tag}`}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                        <Input
                                            placeholder="Type a tag and press Enter (e.g. vegetarian)"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === ",") {
                                                    e.preventDefault()
                                                    addTag(tagInput)
                                                } else if (e.key === "Backspace" && !tagInput && form.tags.length) {
                                                    removeTag(form.tags[form.tags.length - 1])
                                                }
                                            }}
                                        />
                                    </div>
                                </section>

                                <Divider />

                                {/* Section: Allergens */}
                                <section className="space-y-3">
                                    <SectionTitle>Allergens</SectionTitle>
                                    <div className="flex flex-wrap gap-1.5">
                                        {ALLERGENS.map((a) => {
                                            const on = form.allergens.includes(a)
                                            return (
                                                <button
                                                    key={a}
                                                    type="button"
                                                    onClick={() => toggleAllergen(a)}
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors capitalize",
                                                        on
                                                            ? "bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-200"
                                                            : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
                                                    )}
                                                >
                                                    {a}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </section>

                                <Divider />

                                {/* Section: Spicy + flags */}
                                <section className="space-y-3">
                                    <SectionTitle>Extras</SectionTitle>

                                    <div className="space-y-1.5">
                                        <Label>Spice level</Label>
                                        <div className="flex items-center gap-1.5">
                                            {[0, 1, 2, 3].map((level) => (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, spicyLevel: level })}
                                                    className={cn(
                                                        "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                                                        form.spicyLevel === level
                                                            ? "bg-rose-500/10 border-rose-400/60 text-rose-700 dark:text-rose-300"
                                                            : "bg-card border-border text-muted-foreground hover:text-foreground",
                                                    )}
                                                >
                                                    {level === 0 ? (
                                                        <span>None</span>
                                                    ) : (
                                                        <span className="flex items-center gap-0.5">
                                                            {Array.from({ length: level }).map((_, i) => (
                                                                <Flame key={i} className="w-3 h-3" />
                                                            ))}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <ToggleRow
                                            label="Available"
                                            description="Show on customer menu"
                                            checked={form.isAvailable}
                                            onChange={(v) => setForm({ ...form, isAvailable: v })}
                                        />
                                        <ToggleRow
                                            label="Popular"
                                            description="Highlighted as 'Popular right now'"
                                            checked={form.isPopular}
                                            onChange={(v) => setForm({ ...form, isPopular: v })}
                                        />
                                    </div>
                                </section>
                            </div>

                            <SheetFooter className="px-6 py-4 border-t bg-muted/30">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setSheetOpen(false)}
                                    disabled={isCreating || isUpdating}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isCreating || isUpdating}>
                                    {isCreating || isUpdating
                                        ? "Saving…"
                                        : editingId
                                            ? "Save changes"
                                            : "Add to menu"}
                                </Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search dishes, categories or tags…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 bg-transparent min-w-[10rem] justify-between">
                            {categoryFilter === "all"
                                ? "All categories"
                                : categories.find((c: any) => c.id === categoryFilter)?.name ?? "Category"}
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setCategoryFilter("all")}>
                            All categories
                        </DropdownMenuItem>
                        {categories.map((c: any) => (
                            <DropdownMenuItem key={c.id} onClick={() => setCategoryFilter(c.id)}>
                                {c.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 bg-transparent min-w-[8rem] justify-between">
                            {statusFilterLabel[statusFilter]}
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {(Object.keys(statusFilterLabel) as FilterKey[]).map((k) => (
                            <DropdownMenuItem key={k} onClick={() => setStatusFilter(k)}>
                                {statusFilterLabel[k]}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium text-foreground">No dishes match</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Try clearing filters or adding a new one.
                    </p>
                    <Button onClick={openCreate} className="gap-1.5">
                        <Plus className="w-4 h-4" />
                        Add a dish
                    </Button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map((item: any) => (
                        <MenuCard
                            key={item.id}
                            item={item}
                            onEdit={() => openEdit(item)}
                            onDelete={() => handleDelete(item)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ------ helpers ------
function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">
            {children}
        </p>
    )
}

function Divider() {
    return <div className="border-t border-border/60" />
}

function ToggleRow({
    label,
    description,
    checked,
    onChange,
}: {
    label: string
    description: string
    checked: boolean
    onChange: (v: boolean) => void
}) {
    return (
        <div className="rounded-xl border border-input p-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{description}</p>
                </div>
                <Switch checked={checked} onCheckedChange={onChange} />
            </div>
        </div>
    )
}

function MenuCard({
    item,
    onEdit,
    onDelete,
}: {
    item: any
    onEdit: () => void
    onDelete: () => void
}) {
    const hasDiscount = item.discountPrice != null && item.discountPrice < item.price
    const discountPct = hasDiscount
        ? Math.round((1 - item.discountPrice / item.price) * 100)
        : 0

    return (
        <div
            className={cn(
                "group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all",
                !item.isAvailable && "opacity-70",
            )}
        >
            <div className="relative aspect-video bg-muted">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className={cn("object-cover", !item.isAvailable && "grayscale")}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <ImageIcon className="w-8 h-8" />
                    </div>
                )}

                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {!item.isAvailable && (
                        <span className="bg-foreground/80 text-background text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            Out of stock
                        </span>
                    )}
                    {hasDiscount && (
                        <span className="bg-rose-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                            -{discountPct}% off
                        </span>
                    )}
                    {item.isPopular && (
                        <span className="bg-amber-400/90 text-amber-950 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            popular
                        </span>
                    )}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={onEdit}>
                            <Pencil className="w-4 h-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive" onClick={onDelete}>
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="p-3.5 space-y-2.5">
                <div>
                    <h3 className="font-medium text-foreground text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                        {item.category?.name || "Uncategorized"}
                    </p>
                </div>
                {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                        {item.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1.5">
                                {tag}
                            </Badge>
                        ))}
                        {item.tags.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                                +{item.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <div className="flex items-baseline gap-1.5">
                        {hasDiscount ? (
                            <>
                                <span className="font-semibold text-foreground">
                                    £{Number(item.discountPrice).toFixed(2)}
                                </span>
                                <span className="text-xs text-muted-foreground line-through">
                                    £{Number(item.price).toFixed(2)}
                                </span>
                            </>
                        ) : (
                            <span className="font-semibold text-foreground">
                                £{Number(item.price).toFixed(2)}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                        {item.quantity ?? 0} in stock
                    </span>
                </div>
            </div>
        </div>
    )
}
