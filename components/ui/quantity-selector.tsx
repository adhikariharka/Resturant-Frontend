"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuantitySelectorProps {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  min?: number
  max?: number
  disabled?: boolean
  size?: "sm" | "default"
  className?: string
}

export function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
  disabled = false,
  size = "default",
  className,
}: QuantitySelectorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border border-border rounded-lg",
        size === "sm" ? "h-8" : "h-10",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onDecrease}
        disabled={disabled || quantity <= min}
        className={cn("rounded-r-none border-r border-border", size === "sm" ? "h-8 w-8" : "h-10 w-10")}
      >
        <Minus className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
        <span className="sr-only">Decrease quantity</span>
      </Button>
      <span className={cn("font-medium tabular-nums text-center", size === "sm" ? "w-8 text-sm" : "w-12")}>
        {quantity}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onIncrease}
        disabled={disabled || quantity >= max}
        className={cn("rounded-l-none border-l border-border", size === "sm" ? "h-8 w-8" : "h-10 w-10")}
      >
        <Plus className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
        <span className="sr-only">Increase quantity</span>
      </Button>
    </div>
  )
}
