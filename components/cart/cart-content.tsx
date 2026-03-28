"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2, ShoppingBag, ArrowRight, Loader2, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuantitySelector } from "@/components/ui/quantity-selector"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation, useGetRestaurantSettingsQuery, useGetRestaurantStatusQuery } from "@/lib/store/api"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function CartContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { data: cartItems, isLoading } = useGetCartQuery(undefined, { skip: !session })
  const { data: settings } = useGetRestaurantSettingsQuery(undefined)
  const { data: storeStatus, isLoading: isStoreStatusLoading } = useGetRestaurantStatusQuery(undefined)
  const [updateCartItem] = useUpdateCartItemMutation()
  const [removeFromCart] = useRemoveFromCartMutation()

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  if (isLoading || status === "loading") {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const isEmpty = !cartItems || cartItems.length === 0

  if (isEmpty) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven't added any items to your cart yet."
        action={{ label: "Browse Menu", href: "/menu" }}
      />
    )
  }

  // Calculate totals
  const subtotal = cartItems.reduce((total: number, item: any) => {
    const price = item.foodItem.discountPrice || item.foodItem.price
    return total + (price * item.quantity)
  }, 0)

  const taxRate = settings?.taxRate || 0.20
  const serviceCharge = settings?.serviceCharge || 0.10
  const tax = subtotal * taxRate
  const service = subtotal * serviceCharge
  const total = subtotal + tax + service

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      await updateCartItem({ id: cartItemId, quantity: newQuantity }).unwrap()
    } catch (error) {
      console.error("Update quantity error:", error)
      toast.error("Failed to update quantity")
    }
  }

  const handleRemoveItem = async (cartItemId: string, itemName: string) => {
    try {
      await removeFromCart(cartItemId).unwrap()
      toast.success(`${itemName} removed from cart`)
    } catch (error) {
      console.error("Remove item error:", error)
      toast.error("Failed to remove item")
    }
  }

  const isCheckoutDisabled = !storeStatus?.isOpen;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Cart items */}
      <div className="lg:col-span-2">
        {/* Store Closed Warning */}
        {isCheckoutDisabled && (
          <Alert variant="destructive" className="mb-6">
            <Store className="h-4 w-4" />
            <AlertTitle>Restaurant is Closed</AlertTitle>
            <AlertDescription>
              {storeStatus?.message || "We are currently closed. Please check back later."}
              {storeStatus?.nextOpenTime && <span> Opens {storeStatus.nextOpenTime}.</span>}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-0">
          {cartItems.map((item: any, index: number) => {
            const foodItem = item.foodItem
            const price = foodItem.discountPrice || foodItem.price

            return (
              <div
                key={item.id}
                className={cn("flex gap-4 py-5", index !== cartItems.length - 1 && "border-b border-border")}
              >
                {/* Image */}
                <Link href={`/menu/${foodItem.slug}`} className="flex-shrink-0">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted">
                    <Image src={foodItem.image || "/placeholder.svg"} alt={foodItem.name} fill className="object-cover" />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/menu/${foodItem.slug}`} className="font-medium text-foreground hover:text-primary">
                        {foodItem.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        £{price.toFixed(2)} each
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
                      onClick={() => handleRemoveItem(item.id, foodItem.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <QuantitySelector
                      quantity={item.quantity}
                      onIncrease={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      onDecrease={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      size="sm"
                    />
                    <span className="font-semibold text-foreground">£{(price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Continue shopping */}
        <div className="mt-6 pt-6 border-t border-border">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <div className="bg-surface rounded-xl p-6 sticky top-24">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Subtotal ({cartItems.reduce((t: number, i: any) => t + i.quantity, 0)} items)
              </span>
              <span className="text-foreground">£{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(0)}%)</span>
              <span className="text-foreground">£{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Charge ({(serviceCharge * 100).toFixed(0)}%)</span>
              <span className="text-foreground">£{service.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-border my-4" />

          <div className="flex justify-between items-center mb-6">
            <span className="font-medium text-foreground">Total</span>
            <span className="text-xl font-semibold text-foreground">£{total.toFixed(2)}</span>
          </div>

          <Button
            size="lg"
            className="w-full rounded-lg"
            disabled={isCheckoutDisabled || isStoreStatusLoading}
            asChild={!isCheckoutDisabled}
          >
            {isCheckoutDisabled ? (
              <span>Closed</span>
            ) : (
              <Link href="/checkout">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            )}

          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">Prices include tax and service charge</p>
        </div>
      </div>
    </div>
  )
}
