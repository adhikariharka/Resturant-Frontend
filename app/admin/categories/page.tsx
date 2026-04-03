import { Suspense } from "react"
import { AdminCategoriesContent } from "@/components/admin/categories-content"
import { AdminTableSkeleton } from "@/components/skeletons/admin-skeleton"

export const metadata = {
    title: "Categories Management | Admin Dashboard",
}

export default function AdminCategoriesPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">Categories</h1>
                <p className="text-muted-foreground">Manage your food categories.</p>
            </div>

            <Suspense fallback={<AdminTableSkeleton rows={5} />}>
                <AdminCategoriesContent />
            </Suspense>
        </div>
    )
}
