import { Suspense } from "react"
import { AdminOrdersContent } from "@/components/admin/orders-content"
import { AdminTableSkeleton } from "@/components/skeletons/admin-skeleton"

export const metadata = {
  title: "Orders | Admin Dashboard",
}

export default function AdminOrdersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">Orders</h1>
        <p className="text-muted-foreground">Manage and update order statuses.</p>
      </div>

      <Suspense fallback={<AdminTableSkeleton rows={8} />}>
        <AdminOrdersContent />
      </Suspense>
    </div>
  )
}
