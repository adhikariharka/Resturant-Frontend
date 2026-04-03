import { AdminReviewsContent } from "@/components/admin/reviews-content"

export const metadata = {
  title: "Reviews | Admin Dashboard",
}

export default function AdminReviewsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">Reviews</h1>
        <p className="text-muted-foreground">Moderate and respond to customer reviews.</p>
      </div>

      <AdminReviewsContent />
    </div>
  )
}
