"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { CreditCard, Banknote, MapPin, Plus, Check, Loader2, Home, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
// import { useCartStore } from "@/lib/store/cart-store" // Removed client store
import { useSession } from "next-auth/react"
// import { useAuthStore } from "@/lib/store/auth-store"
import { useGetAddressesQuery, useCreateOrderMutation, useGetCartQuery, useGetRestaurantSettingsQuery, useClearCartMutation, useGetRestaurantStatusQuery } from "@/lib/store/api"
import { toast } from "sonner"
import { type Address } from "@/lib/types" // Ensure Address type is available
import { AddressDialog } from "@/components/address/address-dialog"
import { useRouter } from "next/navigation"

export function CheckoutContent() {
  const router = useRouter()
  // Ensure we have user auth
  const { data: session, status } = useSession()
  const user = session?.user

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Data Fetching
  const { data: cartItems = [], isLoading: isCartLoading } = useGetCartQuery(undefined, { skip: !session })
  const { data: addresses = [], isLoading: isAddressesLoading } = useGetAddressesQuery(user?.id ?? "", { skip: !user?.id })
  const { data: settings } = useGetRestaurantSettingsQuery(undefined)
  const { data: storeStatus, isLoading: isStoreStatusLoading } = useGetRestaurantStatusQuery(undefined)

  // Redirect if Cart is Empty or Store is Closed
  useEffect(() => {
    if (!isCartLoading && !isStoreStatusLoading) {
      if (cartItems.length === 0) {
        router.push("/cart")
        toast.error("Your cart is empty")
      } else if (storeStatus && !storeStatus.isOpen) {
        router.push("/cart")
        toast.error(storeStatus.message || "Restaurant is currently closed")
      }
    }
  }, [cartItems, isCartLoading, storeStatus, isStoreStatusLoading, router])

  // Mutations
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation()
  const [clearCart] = useClearCartMutation()

  // State
  const [selectedAddress, setSelectedAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card")
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)

  // Initialize selected address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((a: any) => a.isDefault)
      setSelectedAddress(defaultAddr ? defaultAddr.id : addresses[0].id)
    }
  }, [addresses, selectedAddress])

  // Calculations
  const subtotal = cartItems.reduce((total: number, item: any) => {
    const price = item.foodItem.discountPrice || item.foodItem.price
    return total + (price * item.quantity)
  }, 0)

  const taxRate = settings?.taxRate || 0.20
  const serviceChargeRate = settings?.serviceCharge || 0.10 // Default 10%
  const deliveryFee = 3.5 // Could also be from settings

  const tax = subtotal * taxRate
  const serviceCharge = subtotal * serviceChargeRate
  const total = subtotal + deliveryFee + tax + serviceCharge

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please login to place an order")
      return
    }
    if (!selectedAddress) {
      toast.error("Please select a delivery address")
      return
    }
    if (cartItems.length === 0) {
      toast.error("Cart is empty")
      return
    }

    // Find full address object
    const deliveryAddress = addresses.find((a: any) => a.id === selectedAddress)

    try {
      const orderPayload = {
        userId: user.id,
        // We pass items to satisfy DTO, but backend should verify/reconstruct.
        // Actually, we are adhering to the user's request "calculate total price from db".
        // Use backend logic. But for now send structure.
        items: cartItems.map((item: any) => ({
          foodItemId: item.foodItemId,
          quantity: item.quantity,
          selectedOptions: [] // Options not fully implemented in cartItems structure yet
        })),
        deliveryAddress: deliveryAddress,
        paymentMethod: paymentMethod,
        subtotal,
        tax,
        serviceCharge,
        total
      }

      const result = await createOrder(orderPayload).unwrap()

      if (result.checkoutUrl) {
        // Redirect to Stripe - DO NOT CLEAR CART yet
        window.location.href = result.checkoutUrl
      } else {
        // Cash order - Clear cart and redirect
        // Clear server cart explicitly if backend doesn't do it automatically (it should, but safety first)
        await clearCart(undefined).unwrap()
        toast.success("Order placed successfully!")
        router.push(`/order-success?orderId=${result.id}`)
      }
    } catch (err: any) {
      console.error("Order error", err)
      toast.error(err?.data?.message || "Failed to place order")
    }
  }

  const handleAddressAdded = (newAddressId: string) => {
    setSelectedAddress(newAddressId)
  }

  if (isCartLoading || isStoreStatusLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8" /></div>
  }

  // NOTE: Original "cartItems.length === 0" check removed as useEffect redirects.
  // We can keep a fallback null or small loader just in case render happens before redirect
  if (cartItems.length === 0) return null;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main checkout form */}
      <div className="lg:col-span-2 space-y-8">
        {/* Delivery Address */}
        <section>
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Delivery Address
          </h2>

          {isAddressesLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {addresses.map((address: Address) => {
                const label = address.label.toLowerCase();
                let Icon = MapPin;
                if (label.includes("home")) Icon = Home;
                else if (label.includes("work") || label.includes("office")) Icon = Briefcase;

                return (
                  <div
                    key={address.id}
                    className={cn(
                      "relative flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-muted/50",
                      selectedAddress === address.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border"
                    )}
                    onClick={() => setSelectedAddress(address.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground capitalize">{address.label}</span>
                      </div>
                      {address.isDefault && (
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Default</span>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground leading-relaxed flex-1">
                      <p>{address.line1}</p>
                      {address.line2 && <p>{address.line2}</p>}
                      <p>{address.city}, {address.postcode}</p>
                    </div>

                    <div className="absolute top-4 right-4">
                      <div className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                        selectedAddress === address.id ? "border-primary" : "border-muted-foreground/30"
                      )}>
                        {selectedAddress === address.id && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              <div
                className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 cursor-pointer transition-all gap-3 min-h-[140px] group"
                onClick={() => setAddressDialogOpen(true)}
              >
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-background transition-all shadow-sm">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">Add New Address</span>
              </div>
            </div>
          )}
        </section>

        {/* Payment Method */}
        <section>
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment Method
          </h2>

          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as "card" | "cash")}
            className="space-y-3"
          >
            {/* Card payment */}
            <Label
              htmlFor="payment-card"
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors",
                paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              )}
            >
              <RadioGroupItem value="card" id="payment-card" />
              <div className="flex-1">
                <span className="font-medium text-foreground">Pay with Card</span>
                <p className="text-sm text-muted-foreground">Secure payment via Stripe</p>
              </div>
              <CreditCard className="w-5 h-5 text-muted-foreground" />
            </Label>

            {/* Cash payment */}
            <Label
              htmlFor="payment-cash"
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors",
                paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              )}
            >
              <RadioGroupItem value="cash" id="payment-cash" />
              <div className="flex-1">
                <span className="font-medium text-foreground">Cash on Delivery</span>
                <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
              </div>
              <Banknote className="w-5 h-5 text-muted-foreground" />
            </Label>
          </RadioGroup>
        </section>

        {/* Special instructions */}
        <section>
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Special Instructions</h2>
          <textarea
            className="w-full min-h-[100px] px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Any special requests or delivery instructions..."
          />
        </section>
      </div>

      {/* Order summary sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-surface rounded-xl p-6 sticky top-24">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Order Summary</h2>

          {/* Items list */}
          <div className="space-y-3 mb-4">
            {cartItems.map((item: any) => {
              const foodItem = item.foodItem
              const price = foodItem.discountPrice || foodItem.price
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image src={foodItem.image || "/placeholder.svg"} alt={foodItem.name} fill className="object-cover" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{foodItem.name}</p>
                    {/* Options display if available in schema */}
                  </div>
                  <span className="text-sm font-medium text-foreground">£{(price * item.quantity).toFixed(2)}</span>
                </div>
              )
            })}
          </div>

          <Link href="/cart" className="text-sm text-primary hover:underline">
            Edit cart
          </Link>

          <div className="border-t border-border my-4" />

          {/* Price breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">£{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-foreground">£{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(0)}%)</span>
              <span className="text-foreground">£{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Charge ({(serviceChargeRate * 100).toFixed(1)}%)</span>
              <span className="text-foreground">£{serviceCharge.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-border my-4" />

          <div className="flex justify-between items-center mb-6">
            <span className="font-medium text-foreground">Total</span>
            <span className="text-xl font-semibold text-foreground">£{total.toFixed(2)}</span>
          </div>

          <Button size="lg" className="w-full rounded-lg" onClick={handlePlaceOrder} disabled={isCreatingOrder}>
            {isCreatingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isCreatingOrder ? "Processing..." : (paymentMethod === 'card' ? "Pay with Stripe" : "Place Order")}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            By placing your order, you agree to our{" "}
            <Link href="/terms" className="underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>

      <AddressDialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        userId={user?.id || ""}
        onSuccess={handleAddressAdded}
      />
    </div>
  )
}
