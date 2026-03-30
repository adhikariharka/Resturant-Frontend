"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Package,
  ChefHat,
  Truck,
  CheckCircle,
  Download,
  XCircle,
  Clock,
  MapPin,
  CreditCard,
  Loader2,
  AlertCircle,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { cn } from "@/lib/utils"
// Ensure this import path is correct and the hook is exported
import { useGetOrderQuery } from "@/lib/store/api"

const statusSteps = [
  { key: "placed", label: "Placed", icon: Package },
  { key: "cooking", label: "Cooking", icon: ChefHat },
  { key: "on_the_way", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
]

interface OrderDetailContentProps {
  orderId: string
}

export function OrderDetailContent({ orderId }: OrderDetailContentProps) {
  // Use real data hook
  const { data: order, isLoading, isError } = useGetOrderQuery(orderId, {
    pollingInterval: 5000 // Poll for updates
  })

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    )
  }

  // Error State
  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-semibold">Order not found</h2>
        <p className="text-muted-foreground">Unable to load order details. Please try again.</p>
        <Button asChild variant="outline">
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    )
  }

  const canCancel = ["placed", "confirmed"].includes(order.status)
  // Parse delivery address if it's stored as JSON (backend schema says jsonb)
  // Assuming the hook/backend returns it directly or we need to parse if string
  // If RTK Query transforms correctly, it should be an object. 
  // Safety check if it comes as string (shouldn't if using jsonb properly)
  const address = typeof order.deliveryAddress === 'string'
    ? JSON.parse(order.deliveryAddress)
    : order.deliveryAddress;

  const getStepStatus = (stepKey: string) => {
    // Mapping backend statuses to steps
    // Backend: pending_payment, placed, confirmed, cooking, on_the_way, delivered, cancelled

    // If pending payment, nothing is really active in the "cooking" flow yet
    if (order.status === "pending_payment") return "pending"
    if (order.status === "cancelled") return "cancelled"

    // Define indices for logic
    // We treat 'confirmed' as part of the 'placed' or 'cooking' flow?
    // Let's map strict order
    const orderStatus = order.status;
    const steps = ["placed", "cooking", "on_the_way", "delivered"];

    // Status hierarchy for progress
    // If status is 'confirmed', it is past 'placed' but before 'cooking' in UI steps? 
    // Or we map 'confirmed' to 'placed' step completion?
    // Let's imply: 
    // placed -> confirmed -> cooking -> on_the_way -> delivered

    let currentStepIndex = -1;
    if (orderStatus === 'placed' || orderStatus === 'confirmed') currentStepIndex = 0; // Placed is active
    else if (orderStatus === 'cooking') currentStepIndex = 1;
    else if (orderStatus === 'on_the_way') currentStepIndex = 2;
    else if (orderStatus === 'delivered') currentStepIndex = 3;

    const stepIndex = statusSteps.findIndex((s) => s.key === stepKey);

    if (stepIndex < currentStepIndex) return "completed";
    if (stepIndex === currentStepIndex) return "current";
    return "pending";
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      {/* Back link */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        {/* {canCancel && (
          <Button variant="outline" className="gap-2 text-destructive hover:text-destructive bg-transparent hover:bg-destructive/10 border-destructive/20">
            <XCircle className="w-4 h-4" />
            Cancel Order
          </Button>
        )} */}
      </div>

      {/* Status timeline */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          {/* <Clock className="w-5 h-5 text-primary" /> */}
          {/* <span className="font-medium text-foreground">
            {order.estimatedDelivery ?
              `Estimated delivery: ${new Date(order.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : "Estimated delivery times will be updated soon"}
          </span> */}
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="relative min-w-[300px]">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted rounded-full">
              {/* Dynamic Width Calculation */}
              <div
                className="h-full bg-primary transition-all duration-1000 ease-in-out rounded-full"
                style={{
                  width: `${(() => {
                    // Calculate percentage based on current step
                    const steps = ["placed", "cooking", "on_the_way", "delivered"];
                    let idx = 0;
                    if (order.status === 'confirmed') idx = 0.5; // halfway between placed and cooking?
                    else if (order.status === 'cooking') idx = 1;
                    else if (order.status === 'on_the_way') idx = 2;
                    else if (order.status === 'delivered') idx = 3;
                    else if (order.status === 'placed') idx = 0;

                    return (idx / (steps.length - 1)) * 100;
                  })()}%`,
                }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const stepStatus = getStepStatus(step.key)
                const Icon = step.icon

                return (
                  <div key={step.key} className="flex flex-col items-center group">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-card",
                        stepStatus === "completed" && "bg-primary border-primary text-primary-foreground scale-105",
                        stepStatus === "current" && "bg-primary border-primary text-primary-foreground animate-pulse shadow-[0_0_0_4px_rgba(var(--primary),0.2)]",
                        stepStatus === "pending" && "border-muted text-muted-foreground bg-muted/20",
                        stepStatus === "cancelled" && "bg-destructive/10 border-destructive text-destructive",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={cn(
                        "text-xs mt-3 font-medium transition-colors duration-300 whitespace-nowrap",
                        stepStatus === "completed" || stepStatus === "current"
                          ? "text-primary font-semibold"
                          : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                <Image
                  src={item.foodItem?.image || "/placeholder.svg"}
                  alt={item.foodItem?.name || "Item"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{item.foodItem?.name || "Unknown Item"}</p>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <p className="text-sm text-muted-foreground">{item.selectedOptions.map((o: any) => o.name).join(" • ")}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-foreground">£{(item.priceAtOrder * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery & Payment info */}
      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-foreground">Delivery Address</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">{address?.label || "Address"}</p>
            <p>{address?.line1}</p>
            {address?.line2 && <p>{address?.line2}</p>}
            <p>{address?.city}, {address?.postcode}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-foreground">Payment Method</h3>
          </div>
          <p className="text-sm text-muted-foreground capitalize flex items-center gap-2">
            <span className={cn(
              "w-2 h-2 rounded-full",
              order.paymentMethod === 'card' ? "bg-blue-500" : "bg-green-500"
            )} />
            {order.paymentMethod === "card" ? "Card Payment" : "Cash on Delivery"}
          </p>
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-surface rounded-xl p-6 mb-6 shadow-sm border border-border">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Order Summary</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">£{Number(order.subtotal).toFixed(2)}</span>
          </div>
          {/* Assuming delivery is constant or stored, schema didn't explicitly show delivery fee column in order but calculated in code as 'deliveryFee' */}
          {/* We might display 0 if not saved or calculate. Code in service said 3.5 fixed. */}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span className="text-foreground">£3.50</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span className="text-foreground">£{Number(order.tax).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Charge</span>
            <span className="text-foreground">£{Number(order.serviceCharge).toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-4 border-t border-border font-medium">
            <span className="text-foreground text-base">Total</span>
            <span className="text-xl text-foreground">£{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" asChild className="gap-2 bg-transparent border-primary/20 hover:bg-primary/5 text-primary">
          <Link href={`/orders/${order.id}/invoice`}>
            <FileText className="w-4 h-4" />
            Invoice
          </Link>
        </Button>
      </div>
    </div>
  )
}
