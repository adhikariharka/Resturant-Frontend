"use client"

import { useState } from "react"
import { Star, Check, X, Flag, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Mock reviews
const mockReviews = [
  {
    id: "1",
    orderId: "ORD-12340",
    userName: "Sarah M.",
    rating: 5,
    comment: "Absolutely delicious! The ribeye was cooked to perfection and the service was excellent.",
    createdAt: "2024-12-21T18:30:00Z",
    isApproved: true,
  },
  {
    id: "2",
    orderId: "ORD-12335",
    userName: "James W.",
    rating: 4,
    comment: "Great food, delivery was a bit delayed but the quality made up for it.",
    createdAt: "2024-12-20T20:15:00Z",
    isApproved: true,
  },
  {
    id: "3",
    orderId: "ORD-12330",
    userName: "Emma L.",
    rating: 3,
    comment: "Food was good but portion sizes could be larger for the price.",
    createdAt: "2024-12-19T19:45:00Z",
    isApproved: false,
  },
  {
    id: "4",
    orderId: "ORD-12325",
    userName: "Michael B.",
    rating: 5,
    comment: "Best restaurant in the area! Will definitely order again.",
    createdAt: "2024-12-18T21:00:00Z",
    isApproved: true,
  },
]

type FilterType = "all" | "pending" | "approved"

export function AdminReviewsContent() {
  const [filter, setFilter] = useState<FilterType>("all")

  const filteredReviews = mockReviews.filter((review) => {
    if (filter === "all") return true
    if (filter === "pending") return !review.isApproved
    if (filter === "approved") return review.isApproved
    return true
  })

  const pendingCount = mockReviews.filter((r) => !r.isApproved).length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Reviews</p>
          <p className="text-2xl font-semibold text-foreground">{mockReviews.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Average Rating</p>
          <p className="text-2xl font-semibold text-foreground flex items-center gap-1">
            4.3 <Star className="w-5 h-5 fill-accent text-accent" />
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Pending Approval</p>
          <p className="text-2xl font-semibold text-foreground">{pendingCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">5-Star Reviews</p>
          <p className="text-2xl font-semibold text-foreground">{mockReviews.filter((r) => r.rating === 5).length}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "approved"] as FilterType[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize",
              filter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {status}
            {status === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 bg-primary-foreground/20 px-1.5 py-0.5 rounded-full text-xs">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-card border border-border rounded-xl p-4 md:p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {review.userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{review.userName}</p>
                  <p className="text-sm text-muted-foreground">Order {review.orderId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!review.isApproved && (
                  <Badge variant="secondary" className="bg-warning/10 text-warning">
                    Pending
                  </Badge>
                )}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn("w-4 h-4", i < review.rating ? "fill-accent text-accent" : "text-muted-foreground")}
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-foreground mb-3">{review.comment}</p>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              <div className="flex items-center gap-2">
                {!review.isApproved && (
                  <>
                    <Button size="sm" variant="outline" className="gap-1.5 bg-transparent text-success">
                      <Check className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 bg-transparent text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </>
                )}
                <Button size="sm" variant="ghost" className="gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  Reply
                </Button>
                <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
