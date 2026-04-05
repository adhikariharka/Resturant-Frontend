import { Suspense } from "react"
import { StaffLoginForm } from "@/components/staff/staff-login-form"
import { Skeleton } from "@/components/ui/skeleton"

function StaffLoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Skeleton className="h-96 w-full max-w-sm rounded-xl" />
    </div>
  )
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={<StaffLoginSkeleton />}>
      <StaffLoginForm />
    </Suspense>
  )
}
