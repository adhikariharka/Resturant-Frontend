import { Suspense } from "react"
import { AdminMenuContent } from "@/components/admin/menu-content"
import { AdminTableSkeleton } from "@/components/skeletons/admin-skeleton"

export const metadata = {
  title: "Menu Management | Admin Dashboard",
}

export default function AdminMenuPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">Menu Items</h1>
        <p className="text-muted-foreground">Manage your restaurant's menu items.</p>
      </div>

      <Suspense fallback={<AdminTableSkeleton rows={8} />}>
        <AdminMenuContent />
      </Suspense>
    </div>
  )
}
