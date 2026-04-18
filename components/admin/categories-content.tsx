"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { FolderOpen, Pencil, Plus, Search, Trash2, UtensilsCrossed } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
import { Switch } from "@/components/ui/switch"
import {
    useCreateCategoryMutation,
    useDeleteCategoryMutation,
    useGetCategoriesQuery,
    useGetFoodItemsQuery,
    useUpdateCategoryMutation,
} from "@/lib/store/api"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import { cn } from "@/lib/utils"

type FormState = {
    name: string
    slug: string
    description: string
    image: string
    displayOrder: number
    isActive: boolean
}

const emptyForm: FormState = {
    name: "",
    slug: "",
    description: "",
    image: "",
    displayOrder: 0,
    isActive: true,
}

function toSlug(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

export function AdminCategoriesContent() {
    const { data: categories = [], isLoading } = useGetCategoriesQuery(undefined)
    const { data: foodItems = [] } = useGetFoodItemsQuery(undefined)
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation()
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation()
    const [deleteCategory] = useDeleteCategoryMutation()

    const [isSheetOpen, setSheetOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [form, setForm] = useState<FormState>(emptyForm)
    const [slugDirty, setSlugDirty] = useState(false)

    const itemsByCategory = useMemo(() => {
        const map = new Map<string, number>()
        for (const item of foodItems) {
            map.set(item.categoryId, (map.get(item.categoryId) ?? 0) + 1)
        }
        return map
    }, [foodItems])

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        const arr = q
            ? categories.filter(
                (c: any) =>
                    c.name.toLowerCase().includes(q) ||
                    (c.slug || "").toLowerCase().includes(q),
            )
            : categories
        return [...arr].sort(
            (a: any, b: any) =>
                (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
                a.name.localeCompare(b.name),
        )
    }, [categories, search])

    const openCreate = () => {
        setEditingId(null)
        setForm(emptyForm)
        setSlugDirty(false)
        setSheetOpen(true)
    }

    const openEdit = (category: any) => {
        setEditingId(category.id)
        setForm({
            name: category.name ?? "",
            slug: category.slug ?? "",
            description: category.description ?? "",
            image: category.image ?? "",
            displayOrder: Number.isFinite(category.displayOrder) ? category.displayOrder : 0,
            isActive: category.isActive !== false,
        })
        setSlugDirty(true)
        setSheetOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim()) {
            toast.error("Name is required")
            return
        }
        const payload = {
            name: form.name.trim(),
            slug: (form.slug || toSlug(form.name)).trim(),
            description: form.description.trim() || undefined,
            image: form.image || undefined,
            displayOrder: Number(form.displayOrder) || 0,
            isActive: form.isActive,
        }

        try {
            if (editingId) {
                await updateCategory({ id: editingId, ...payload }).unwrap()
                toast.success("Category updated")
            } else {
                await createCategory(payload).unwrap()
                toast.success("Category created")
            }
            setSheetOpen(false)
            setForm(emptyForm)
            setEditingId(null)
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to save category")
        }
    }

    const handleDelete = async (id: string, name: string) => {
        const count = itemsByCategory.get(id) ?? 0
        if (count > 0) {
            toast.error(`Can't delete — "${name}" still has ${count} item${count === 1 ? "" : "s"}.`)
            return
        }
        if (!confirm(`Delete category "${name}"?`)) return
        try {
            await deleteCategory(id).unwrap()
            toast.success("Category deleted")
        } catch {
            toast.error("Failed to delete category")
        }
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Categories</h1>
                    <p className="text-sm text-muted-foreground">
                        Group dishes on the menu. {categories.length}{" "}
                        {categories.length === 1 ? "category" : "categories"} in total.
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button className="gap-1.5 shrink-0" onClick={openCreate}>
                                <Plus className="w-4 h-4" />
                                New
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="p-0 sm:max-w-md flex flex-col overflow-hidden">
                            <SheetHeader className="px-6 pt-6 pb-4 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <FolderOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <SheetTitle className="text-base">
                                            {editingId ? "Edit category" : "New category"}
                                        </SheetTitle>
                                        <SheetDescription className="text-xs">
                                            Categories sort the menu and appear in the customer UI.
                                        </SheetDescription>
                                    </div>
                                </div>
                            </SheetHeader>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                                <div className="px-6 py-5 space-y-5">
                                    {/* Basics */}
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="cat-name">Name</Label>
                                            <Input
                                                id="cat-name"
                                                placeholder="e.g. British Classics"
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
                                            <Label htmlFor="cat-slug">URL slug</Label>
                                            <Input
                                                id="cat-slug"
                                                placeholder="british-classics"
                                                value={form.slug}
                                                onChange={(e) => {
                                                    setSlugDirty(true)
                                                    setForm({ ...form, slug: toSlug(e.target.value) })
                                                }}
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Used in links like <code className="text-foreground">/menu?category={form.slug || "classics"}</code>
                                            </p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="cat-description">Description (optional)</Label>
                                            <Textarea
                                                id="cat-description"
                                                rows={3}
                                                placeholder="Short blurb shown at the top of the category page."
                                                value={form.description}
                                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-border/60" />

                                    {/* Image */}
                                    <div className="space-y-1.5">
                                        <Label>Image</Label>
                                        <ImageUpload
                                            value={form.image}
                                            onChange={(url) => setForm({ ...form, image: url })}
                                            aspectRatio="square"
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                            Square crop works best — shown as the category thumbnail.
                                        </p>
                                    </div>

                                    <div className="border-t border-border/60" />

                                    {/* Display options */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="cat-order">Display order</Label>
                                            <Input
                                                id="cat-order"
                                                type="number"
                                                min={0}
                                                value={form.displayOrder}
                                                onChange={(e) =>
                                                    setForm({ ...form, displayOrder: Number(e.target.value) })
                                                }
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Lower = shows earlier.
                                            </p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="mb-2 block">Visible</Label>
                                            <div className="flex items-center h-10 px-3 rounded-md border border-input justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    {form.isActive ? "Shown to customers" : "Hidden"}
                                                </span>
                                                <Switch
                                                    checked={form.isActive}
                                                    onCheckedChange={(checked) =>
                                                        setForm({ ...form, isActive: checked })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
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
                                                : "Create category"}
                                    </Button>
                                </SheetFooter>
                            </form>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Category cards */}
            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                        <FolderOpen className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium text-foreground">No categories yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Add a category to group dishes on the menu.
                    </p>
                    <Button onClick={openCreate} className="gap-1.5">
                        <Plus className="w-4 h-4" />
                        Create the first category
                    </Button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((c: any) => {
                        const itemCount = itemsByCategory.get(c.id) ?? 0
                        const isActive = c.isActive !== false
                        return (
                            <div
                                key={c.id}
                                className={cn(
                                    "group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all",
                                    !isActive && "opacity-60",
                                )}
                            >
                                <div className="relative aspect-[5/3] bg-muted">
                                    {c.image ? (
                                        <Image src={c.image} alt={c.name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <UtensilsCrossed className="w-8 h-8" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                                        {!isActive && (
                                            <span className="bg-foreground/80 text-background text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                                Hidden
                                            </span>
                                        )}
                                        {typeof c.displayOrder === "number" && (
                                            <span className="bg-background/90 text-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                                #{c.displayOrder}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-8 w-8"
                                            onClick={() => openEdit(c)}
                                            aria-label="Edit"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(c.id, c.name)}
                                            aria-label="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="font-medium text-foreground truncate">{c.name}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-muted-foreground truncate font-mono">
                                            /{c.slug}
                                        </span>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {itemCount} {itemCount === 1 ? "item" : "items"}
                                        </span>
                                    </div>
                                    {c.description && (
                                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                            {c.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
