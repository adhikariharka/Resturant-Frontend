import { Suspense } from "react"
import { AdminSettingsContent } from "../../../components/admin/settings-content"
import { AdminTableSkeleton } from "@/components/skeletons/admin-skeleton"

export const metadata = {
    title: "Restaurant Settings | Admin Dashboard",
}

export default function AdminSettingsPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">Restaurant Settings</h1>
                <p className="text-muted-foreground">Manage tax rates, service charges, holidays, and opening hours.</p>
            </div>

            <Suspense fallback={<AdminTableSkeleton rows={5} />}>
                <AdminSettingsContent />
            </Suspense>
        </div>
    )
}
