import { Suspense } from "react"
import { CartContent } from "@/components/cart/cart-content"
import { CartSkeleton } from "@/components/skeletons/cart-skeleton"

export const metadata = {
  title: "Cart | The Kitchen",
  description: "Review your order before checkout.",
}

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">Your Cart</h1>

      <Suspense fallback={<CartSkeleton />}>
        <CartContent />
      </Suspense>
    </div>
  )
}
