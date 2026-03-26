"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { FoodItem } from "@/lib/types"
import { useSession } from "next-auth/react"
import { useAddToCartMutation } from "@/lib/store/api"
import { toast } from "sonner"
import { LoginDialog } from "@/components/auth/login-dialog"

interface FoodCardProps {
  item: FoodItem
  className?: string
  variant?: "grid" | "list"
}

export function FoodCard({ item, className, variant = "grid" }: FoodCardProps) {
  const { data: session } = useSession()
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [addToCart, { isLoading }] = useAddToCartMutation()

  const hasDiscount = item.discountPrice && item.discountPrice < item.price
  const displayPrice = hasDiscount ? item.discountPrice : item.price
  const discountPercent = hasDiscount ? Math.round((1 - item.discountPrice! / item.price) * 100) : 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()

    // Check if user is logged in
    if (!session) {
      setLoginDialogOpen(true)
      return
    }

    try {
      await addToCart({ foodItemId: item.id, quantity: 1 }).unwrap()
      toast.success(`${item.name} added to cart`)
    } catch (error) {
      console.error("Add to cart error:", error)
      toast.error("Failed to add item to cart")
    }
  }

  const handleLoginSuccess = async () => {
    // Retry adding to cart after successful login
    try {
      await addToCart({ foodItemId: item.id, quantity: 1 }).unwrap()
      toast.success(`${item.name} added to cart`)
    } catch (error) {
      console.error("Add to cart error:", error)
      toast.error("Failed to add item to cart")
    }
  }

  if (variant === "list") {
    return (
      <>
        <div className={cn("group flex flex-col sm:flex-row gap-4 bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all", className)}>
          {/* Image */}
          <div className="relative w-full sm:w-32 h-32 md:w-40 md:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            {/* Link wrapper for image */}
            <Link href={`/menu/${item.slug}`} className="block w-full h-full">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className={cn(
                  "object-cover transition-transform duration-300 group-hover:scale-105",
                  !item.isAvailable && "grayscale opacity-70",
                )}
              />
              {!item.isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
                  <span className="bg-background text-foreground px-2 py-0.5 rounded-full text-xs font-medium">
                    Out of Stock
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-1">
                <Link href={`/menu/${item.slug}`} className="hover:text-primary transition-colors">
                  <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
                </Link>
                <span className="font-semibold text-primary">£{displayPrice?.toFixed(2)}</span>
              </div>
              <p className="text-muted-foreground text-sm line-clamp-2 md:line-clamp-none mb-3">{item.description}</p>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 sm:border-0 sm:mt-0 sm:pt-0">
              {/* Tags/Category */}
              <div className="flex gap-2">
                {hasDiscount && (
                  <Badge variant="discount" className="text-xs">
                    -{discountPercent}%
                  </Badge>
                )}
                <div className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                  {item.category?.name || "Dish"}
                </div>
              </div>

              <Button
                size="sm"
                disabled={!item.isAvailable || isLoading}
                onClick={handleAddToCart}
                className=""
              >
                {isLoading ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </div>

        <LoginDialog
          open={loginDialogOpen}
          onOpenChange={setLoginDialogOpen}
          onSuccess={handleLoginSuccess}
        />
      </>
    )
  }

  return (
    <>
      <div className={cn("group", className)}>
        <Link href={`/menu/${item.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden rounded-xl mb-3 bg-muted">
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              fill
              className={cn(
                "object-cover transition-transform duration-300 group-hover:scale-105",
                !item.isAvailable && "grayscale opacity-70",
              )}
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {hasDiscount && (
                <Badge variant="discount" className="text-xs">
                  -{discountPercent}%
                </Badge>
              )}
              {item.isPopular && (
                <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">
                  Popular
                </Badge>
              )}
            </div>

            {/* Out of stock overlay */}
            {!item.isAvailable && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
                <span className="bg-background text-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </Link>

        <div className="space-y-1">
          <Link href={`/menu/${item.slug}`}>
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {item.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">£{displayPrice?.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">£{item.price.toFixed(2)}</span>
              )}
            </div>
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors bg-transparent"
              disabled={!item.isAvailable || isLoading}
              onClick={handleAddToCart}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add to cart</span>
            </Button>
          </div>
        </div>
      </div>

      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onSuccess={handleLoginSuccess}
      />
    </>
  )
}
