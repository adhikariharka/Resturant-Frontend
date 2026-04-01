"use client"

import { Download, Printer, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useGetOrderQuery } from "@/lib/store/api"

interface InvoiceContentProps {
  orderId: string
}

export function InvoiceContent({ orderId }: InvoiceContentProps) {
  const { data: order, isLoading, isError } = useGetOrderQuery(orderId)

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h1 className="text-xl font-semibold">Order not found</h1>
        <p className="text-muted-foreground">Could not load invoice details.</p>
        <Button asChild variant="outline">
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    )
  }

  // Parse address if needed
  const address = typeof order.deliveryAddress === 'string'
    ? JSON.parse(order.deliveryAddress)
    : order.deliveryAddress;

  // Use user data for customer info if available, otherwise fallback or empty
  const customerName = order.user?.name || "Guest Customer";
  const customerEmail = order.user?.email || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Action buttons - hidden when printing */}
      <div className="print:hidden container mx-auto px-4 py-4 flex justify-between items-center max-w-2xl bg-muted/20 mb-4 rounded-lg">
        <Button variant="ghost" asChild className="gap-2">
          <Link href={`/orders/${orderId}`}>Back to Order</Link>
        </Button>
        {/* <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint} className="gap-2 bg-transparent">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button className="gap-2" disabled>
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div> */}
      </div>

      {/* Invoice */}
      <div className="container mx-auto px-4 py-8 max-w-2xl print:max-w-none print:px-8 print:py-0">
        <div className="bg-card border border-border rounded-xl p-8 print:border-0 print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-foreground mb-1">Invoice</h1>
              <p className="text-muted-foreground font-mono">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-serif text-xl font-semibold text-foreground">The Kitchen</p>
              <p className="text-sm text-muted-foreground">123 High Street</p>
              <p className="text-sm text-muted-foreground">London, W1A 1AA</p>
            </div>
          </div>

          {/* Customer & Order info */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Bill To</h3>
              <p className="font-medium text-foreground">{customerName}</p>
              <p className="text-sm text-muted-foreground">{customerEmail}</p>
              <div className="text-sm text-muted-foreground mt-2">
                <p>{address?.line1}</p>
                {address?.line2 && <p>{address.line2}</p>}
                <p>{address?.city}, {address?.postcode}</p>
              </div>
            </div>
            <div className="sm:text-right">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Invoice Details</h3>
              <p className="text-sm text-muted-foreground">
                Date:{" "}
                <span className="text-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Order No: <span className="text-foreground font-mono">{order.orderNumber}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Payment Method: <span className="text-foreground capitalize">{order.paymentMethod}</span>
              </p>
            </div>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto">
            <table className="w-full mb-8 min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Item</th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground">Qty</th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-3 text-sm text-foreground">
                      <div className="font-medium">{item.foodItem?.name || "Item"}</div>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="text-xs text-muted-foreground">{item.selectedOptions.map((o: any) => o.name).join(", ")}</div>
                      )}
                    </td>
                    <td className="py-3 text-sm text-foreground text-center">{item.quantity}</td>
                    <td className="py-3 text-sm text-foreground text-right">£{Number(item.priceAtOrder).toFixed(2)}</td>
                    <td className="py-3 text-sm text-foreground text-right">
                      £{(item.priceAtOrder * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">£{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-foreground">£3.50</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT (20%)</span>
                <span className="text-foreground">£{Number(order.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Charge (10%)</span>
                <span className="text-foreground">£{Number(order.serviceCharge).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-semibold text-lg text-foreground">£{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Thank you for dining with The Kitchen!</p>
            <p>For questions, contact us at hello@thekitchen.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
