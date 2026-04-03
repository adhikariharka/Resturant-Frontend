"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Plus, Pencil, Trash2, MoreVertical } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
// import { useCartStore } from "@/lib/store/cart"
import { useGetFoodItemsQuery, useDeleteFoodItemMutation } from "@/lib/store/api"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  useGetCategoriesQuery,
  useCreateFoodItemMutation,
  useUpdateFoodItemMutation,
} from "@/lib/store/api"
import { ImageUpload } from "@/components/ui/image-upload"

export function AdminMenuContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: menuItems = [], isLoading } = useGetFoodItemsQuery(undefined)
  const { data: categories = [] } = useGetCategoriesQuery(undefined)
  const [createFoodItem, { isLoading: isCreating }] = useCreateFoodItemMutation()
  const [updateFoodItem, { isLoading: isUpdating }] = useUpdateFoodItemMutation()
  const [deleteFoodItem] = useDeleteFoodItemMutation()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    image: "",
    isAvailable: true,
    isPopular: false,
    tags: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.categoryId) {
      toast.error("Please select a category")
      return
    }


    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        image: formData.image || null, // Send null if no image
      }

      if (editingItem) {
        await updateFoodItem({ id: editingItem.id, ...payload }).unwrap()
        toast.success("Item updated")
      } else {
        await createFoodItem(payload).unwrap()
        toast.success("Item created")
      }
      setIsDialogOpen(false)
      setEditingItem(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        image: "",
        isAvailable: true,
        isPopular: false,
        tags: [],
      })
    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error(error?.data?.message || "Failed to save item")
    }
  }

  const filteredItems = menuItems.filter(
    (item: any) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category?.name && item.category.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteFoodItem(id).unwrap()
        toast.success("Item deleted")
      } catch (error) {
        toast.error("Failed to delete item")
      }
    }
  }

  if (isLoading) {
    return <div>Loading menu items...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2" onClick={() => {
              setEditingItem(null)
              setFormData({
                name: "",
                description: "",
                price: "",
                categoryId: "",
                image: "",
                isAvailable: true,
                isPopular: false,
                tags: [],
              })
            }}>
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingItem ? "Edit Item" : "Add Item"}</SheetTitle>
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (£)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g. vegetarian, spicy, popular"
                  value={formData.tags.join(', ')}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    setFormData({ ...formData, tags })
                  }}
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  aspectRatio="video"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="available">Available</Label>
                <Switch
                  id="available"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="popular">Popular</Label>
                <Switch
                  id="popular"
                  checked={formData.isPopular}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
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

      {/* Menu items grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item: any) => (
          <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden group">
            <div className="relative aspect-video">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className={cn("object-cover", !item.isAvailable && "grayscale opacity-70")}
              />
              {!item.isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
                  <span className="bg-background text-foreground px-2 py-1 rounded text-xs font-medium">
                    Out of Stock
                  </span>
                </div>
              )}
              {item.discountPrice && (
                <Badge variant="discount" className="absolute top-2 left-2">
                  Sale
                </Badge>
              )}
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
                  <DropdownMenuItem className="gap-2" onClick={() => {
                    setEditingItem(item)
                    setFormData({
                      name: item.name,
                      description: item.description,
                      price: item.price.toString(),
                      categoryId: item.categoryId,
                      image: item.image,
                      isAvailable: item.isAvailable,
                      isPopular: item.isPopular,
                      tags: item.tags || [],
                    })
                    setIsDialogOpen(true)
                  }}>
                    <Pencil className="w-4 h-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-medium text-foreground line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category?.name || 'Uncategorized'}</p>
                </div>
                {item.isPopular && (
                  <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">
                    Popular
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.discountPrice ? (
                    <>
                      <span className="font-semibold text-foreground">£{item.discountPrice.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground line-through">£{item.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="font-semibold text-foreground">£{item.price.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{item.isAvailable ? "In Stock" : "Out"}</span>
                  <Switch checked={item.isAvailable} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
