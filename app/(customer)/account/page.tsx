import { Suspense } from "react"
import { AccountContent } from "@/components/account/account-content"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "My Account | The Kitchen",
  description: "Manage your account settings and addresses.",
}

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">My Account</h1>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        }
      >
        <AccountContent />
      </Suspense>
    </div>
  )
}
