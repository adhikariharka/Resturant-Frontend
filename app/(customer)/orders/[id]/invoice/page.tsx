import { InvoiceContent } from "@/components/orders/invoice-content"

export const metadata = {
  title: "Invoice | The Kitchen",
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <InvoiceContent orderId={id} />
}
