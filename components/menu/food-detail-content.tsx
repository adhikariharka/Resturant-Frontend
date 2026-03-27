"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Minus, Plus, ShoppingBag, Clock, Flame, Leaf, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
// import type { FoodItem } from "@/lib/types" // Inferred
import { useGetFoodItemBySlugQuery, useAddToCartMutation } from "@/lib/store/api"
import { useSession } from "next-auth/react"
import { LoginDialog } from "@/components/auth/login-dialog"

interface FoodDetailContentProps {
  itemSlug: string
}

export function FoodDetailContent({ itemSlug }: FoodDetailContentProps) {
  const { data: item, isLoading, error } = useGetFoodItemBySlugQuery(itemSlug)
  const { data: session } = useSession()
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation()

  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)

  // Reset state when item changes
  useEffect(() => {
    setQuantity(1)
    setSelectedOptions({})
  }, [itemSlug])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-semibold mb-4">Item not found</h2>
        <Link href="/menu">
          <Button>Back to Menu</Button>
        </Link>
      </div>
    )
  }

  const hasDiscount = item.discountPrice && item.discountPrice < item.price
  const basePrice = hasDiscount ? item.discountPrice! : item.price

  // Calculate total price including option modifiers
  const optionsPrice = Object.entries(selectedOptions).reduce((total, [optionId, choiceId]) => {
    const option = item.options?.find((o: any) => o.id === optionId)
    const choice = option?.choices.find((c: any) => c.id === choiceId)
    return total + (choice?.priceModifier || 0)
  }, 0)

  const totalPrice = (basePrice + optionsPrice) * quantity

  const executeAddToCart = async () => {
    // Check if all required options are selected
    const missingOptions = item.options?.filter((option: any) => !selectedOptions[option.id])
    if (missingOptions && missingOptions.length > 0) {
      toast.error(`Please select: ${missingOptions.map((o: any) => o.name).join(", ")}`)
      return
    }

    try {
      // For now, add to cart without options (we can enhance this later)
      await addToCart({ foodItemId: item.id, quantity }).unwrap()
      toast.success(`Added ${quantity}x ${item.name} to cart`)

      // Reset quantity after adding
      setQuantity(1)
    } catch (error) {
      console.error("Add to cart error:", error)
      toast.error("Failed to add item to cart")
    }
  }

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!session) {
      setLoginDialogOpen(true)
      return
    }

    await executeAddToCart()
  }

  const handleLoginSuccess = async () => {
    // Retry adding to cart after successful login
    // We skip the session check here because the user just logged in
    await executeAddToCart()
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menu
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            fill
            className={cn("object-cover", !item.isAvailable && "grayscale opacity-70")}
            priority
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {hasDiscount && (
              <Badge variant="secondary" className="bg-destructive text-destructive-foreground">-{Math.round((1 - item.discountPrice! / item.price) * 100)}%</Badge>
            )}
            {item.isPopular && (
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                Popular
              </Badge>
            )}
          </div>

          {!item.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
              <span className="bg-background text-foreground px-4 py-2 rounded-full font-medium">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Category */}
          <div>
            <span className="text-sm text-primary font-medium uppercase tracking-wide">{item.category?.name}</span>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mt-1">{item.name}</h1>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{item.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {item.tags && item.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="capitalize">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-foreground">£{basePrice.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">£{item.price.toFixed(2)}</span>
            )}
          </div>

          {/* Options */}
          {item.options && item.options.length > 0 && (
            <div className="space-y-6 pt-4 border-t border-border">
              {item.options.map((option: any) => (
                <div key={option.id}>
                  <Label className="text-sm font-medium mb-3 block">{option.name}</Label>
                  <RadioGroup
                    value={selectedOptions[option.id] || ""}
                    onValueChange={(value) => setSelectedOptions((prev) => ({ ...prev, [option.id]: value }))}
                    className="flex flex-wrap gap-2"
                  >
                    {option.choices.map((choice: any) => (
                      <Label
                        key={choice.id}
                        htmlFor={`${option.id}-${choice.id}`}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-full border cursor-pointer transition-colors",
                          selectedOptions[option.id] === choice.id
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <RadioGroupItem value={choice.id} id={`${option.id}-${choice.id}`} className="sr-only" />
                        <span className="text-sm">{choice.name}</span>
                        {choice.priceModifier && choice.priceModifier > 0 && (
                          <span className="text-xs text-muted-foreground">+£{choice.priceModifier.toFixed(2)}</span>
                        )}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          )}

          {/* Quantity and Add to cart */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center border border-border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={!item.isAvailable || quantity <= 1}
                className="h-12 w-12 rounded-r-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium tabular-nums">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={!item.isAvailable}
                className="h-12 w-12 rounded-l-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="lg"
              className="flex-1 h-12 rounded-lg"
              disabled={!item.isAvailable || isAddingToCart}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {isAddingToCart ? "Adding..." : `Add to Cart — £${totalPrice.toFixed(2)}`}
            </Button>
          </div>

          {!item.isAvailable && (
            <p className="text-sm text-destructive">This item is currently unavailable. Please check back later.</p>
          )}
        </div>
      </div>

      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onSuccess={handleLoginSuccess}
      />
    </div>
  )
}
