"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  orderId: string
  onSubmit?: (rating: number, comment: string) => void
  onCancel?: () => void
}

export function ReviewForm({ orderId, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return

    setIsSubmitting(true)
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)

    onSubmit?.(rating, comment)
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block">How was your experience?</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  (hoveredRating || rating) >= value ? "fill-accent text-accent" : "text-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="comment" className="mb-2 block">
          Tell us more (optional)
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you enjoy? Any feedback for us?"
          className="min-h-[100px]"
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="bg-transparent">
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
