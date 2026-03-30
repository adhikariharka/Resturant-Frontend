"use client"

import { useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Package, ArrowRight, Download, Home, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useGetOrderQuery } from "@/lib/store/api"

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("orderId")
  const sessionId = searchParams.get("session_id")

  // Clean URL if session_id is present (purely cosmetic now)
  useEffect(() => {
    if (sessionId) {
      router.replace(`/order-success?orderId=${orderId}`, { scroll: false })
    }
  }, [sessionId, router, orderId])

  const { data: order, isLoading, error } = useGetOrderQuery(orderId, {
    skip: !orderId,
    pollingInterval: 2000, // Poll every 2 seconds for status updates
  })

  // Protect route: Redirect if no order ID provided
  useEffect(() => {
    if (!orderId) {
      router.push("/")
    }
  }, [orderId, router])

  // Handle Loading
  if (isLoading || (!order && !error)) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Handle Error or Not Found (extra protection)
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">We couldn't find the order details. It might not exist or you don't have permission to view it.</p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    )
  }

  // Parse items if they are not already in the expected structure (though API usually returns them)
  const items = order.items || []

  // Handle Pending Payment State
  if (order.status === 'pending_payment') {
    return (
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Loader2 className="w-10 h-10 text-yellow-600 dark:text-yellow-400 animate-spin" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">Processing Payment...</h1>
            <p className="text-muted-foreground">
              We are verifying your payment securely. This usually takes a few seconds.
              <br />
              Please do not close this window.
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg text-sm text-left font-mono">
            <p className="flex justify-between mb-1"><span>Order:</span> <span>{order.orderNumber}</span></p>
            <p className="flex justify-between"><span>Amount:</span> <span>£{Number(order.total).toFixed(2)}</span></p>
          </div>
        </div>
      </div>
    )
  }

  // Handle Cancelled State
  if (order.status === 'cancelled') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Cancelled</h1>
        <p className="text-muted-foreground mb-6">Payment was not completed or was cancelled.</p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/checkout">Try Again</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success icon */}
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-8">Thank you for your order. We've received it and will start preparing it soon.</p>

        {/* Order number card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Order Number</span>
          </div>
          <p className="text-2xl font-mono font-semibold text-foreground">{order.orderNumber}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Status: <span className="capitalize font-medium text-foreground">{order.status}</span>
          </p>
        </div>

        {/* Order summary */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left shadow-sm">
          <h2 className="font-medium text-foreground mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm mb-4">
            {items.map((item: any) => {
              const foodName = item.foodItem?.name || "Unknown Item";
              return (
                <div key={item.id} className="flex justify-between items-start">
                  <span className="text-muted-foreground">
                    {item.quantity}x {foodName}
                  </span>
                  <span className="text-foreground">£{(item.priceAtOrder * item.quantity).toFixed(2)}</span>
                </div>
              )
            })}
          </div>
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">£{Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-foreground">£{Number(order.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Charge</span>
              <span className="text-foreground">£{Number(order.serviceCharge).toFixed(2)}</span>
            </div>
            {/* Delivery fee not explicitly stored sometimes? Assuming it is in total or subtotal logic. 
                 But based on checkout logic: total = subtotal + tax + service + delivery
                 So we can infer delivery or just show total. 
             */}
            <div className="flex justify-between font-medium pt-2 border-t border-border mt-2">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">£{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2">
            <Link href={`/orders/${order.id}`}>
              Orders
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
