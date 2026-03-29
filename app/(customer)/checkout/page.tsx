import { Suspense } from "react"
import { CheckoutContent } from "@/components/checkout/checkout-content"
import { CheckoutSkeleton } from "@/components/skeletons/checkout-skeleton"

export const metadata = {
  title: "Checkout | The Kitchen",
  description: "Complete your order.",
}

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">Checkout</h1>

      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutContent />
      </Suspense>
    </div>
  )
}
