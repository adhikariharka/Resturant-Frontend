"use client"

import { useState, useEffect } from "react"
import { Search, SlidersHorizontal, X, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FoodCard } from "@/components/food/food-card"
import { cn } from "@/lib/utils"
// import type { FoodItem, Category } from "@/lib/types" // Removed as we use inferred types or valid types
import { useGetCategoriesQuery, useGetFoodItemsQuery } from "@/lib/store/api"
import { CategoryListSkeleton } from "@/components/skeletons/category-skeleton"
import { FoodGridSkeleton } from "@/components/skeletons/food-card-skeleton"
import type { Category, FoodItem } from "@/lib/types";

export function MenuContent() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Set default view based on screen size
  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode("list")
    }
  }, [])

  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesQuery(undefined)
  const { data: foodItemsData, isLoading: isFoodLoading } = useGetFoodItemsQuery(undefined)

  const categories = [
    { id: "all", name: "All", slug: "all" },
    ...(categoriesData || []),
  ]

  const isLoading = isCategoriesLoading || isFoodLoading

  if (isLoading) {
    return (
      <div className="space-y-8">
        <CategoryListSkeleton />
        <FoodGridSkeleton count={8} />
      </div>
    )
  }

  const menuItems: FoodItem[] = foodItemsData || []

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category?.slug === selectedCategory
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const availableItems = filteredItems.filter((item) => item.isAvailable)
  const unavailableItems = filteredItems.filter((item) => !item.isAvailable)

  return (
    <div className="space-y-6">
      {/* Search, filters, and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-muted rounded-lg p-1 border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === "grid" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === "list" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="sm:hidden">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Category tabs */}
      <div className={cn("flex gap-2 overflow-x-auto pb-2 scrollbar-hide", showFilters ? "flex" : "hidden sm:flex")}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.slug)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              selectedCategory === category.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Results info */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""} for "{searchQuery}"
        </p>
      )}

      {/* Food Items */}
      {filteredItems.length > 0 ? (
        <div className="space-y-8">
          {/* Available items */}
          {availableItems.length > 0 && (
            <div className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                : "space-y-4"
            )}>
              {availableItems.map((item) => (
                <FoodCard key={item.id} item={item} variant={viewMode} />
              ))}
            </div>
          )}

          {/* Unavailable items */}
          {unavailableItems.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-muted-foreground mb-4">Currently Unavailable</h3>
              <div className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                  : "space-y-4"
              )}>
                {unavailableItems.map((item) => (
                  <FoodCard key={item.id} item={item} variant={viewMode} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No dishes found matching your search.</p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("all")
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}
