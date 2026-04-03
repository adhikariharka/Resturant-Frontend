"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} from "@/lib/store/api"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import Image from "next/image"

export function AdminCategoriesContent() {
    const { data: categories = [], isLoading } = useGetCategoriesQuery(undefined)
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation()
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation()
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<any>(null)
    const [formData, setFormData] = useState({ name: "", image: "" })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingCategory) {
                await updateCategory({ id: editingCategory.id, ...formData }).unwrap()
                toast.success("Category updated")
            } else {
                await createCategory(formData).unwrap()
                toast.success("Category created")
            }
            setIsDialogOpen(false)
            setFormData({ name: "", image: "" })
            setEditingCategory(null)
        } catch (error) {
            console.error('Submit error:', error)
            toast.error("Failed to save category")
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
            try {
                await deleteCategory(id).unwrap()
                toast.success("Category deleted")
            } catch (error) {
                toast.error("Failed to delete category")
            }
        }
    }

    const openEdit = (category: any) => {
        setEditingCategory(category)
        setFormData({ name: category.name, image: category.image || "" })
        setIsDialogOpen(true)
    }

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <SheetTrigger asChild>
                        <Button onClick={() => { setEditingCategory(null); setFormData({ name: "", image: "" }) }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>{editingCategory ? "Edit Category" : "Add Category"}</SheetTitle>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Image</Label>
                                <ImageUpload
                                    value={formData.image}
                                    onChange={(url) => setFormData({ ...formData, image: url })}
                                    aspectRatio="square"
                                />
                            </div>
                            <SheetFooter>
                                <Button type="submit" disabled={isCreating || isUpdating}>
                                    {isCreating || isUpdating ? "Saving..." : "Save"}
                                </Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="text-left py-3 px-4 font-medium">Image</th>
                            <th className="text-left py-3 px-4 font-medium">Name</th>
                            <th className="text-right py-3 px-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {categories.map((category: any) => (
                            <tr key={category.id} className="hover:bg-muted/30 transition-colors">
                                <td className="py-3 px-4">
                                    {category.image ? (
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border">
                                            <Image
                                                src={category.image}
                                                alt={category.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border border-border">
                                            <span className="text-xs text-muted-foreground">No image</span>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-4 font-medium">{category.name}</td>
                                <td className="py-3 px-4 text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(category.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="font-medium">No categories found</p>
                                        <p className="text-sm">Create your first category to get started</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
