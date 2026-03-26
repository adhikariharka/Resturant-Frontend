"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Mock data - replace with actual data fetching
const banners = [
  {
    id: "1",
    title: "Exceptional Flavours, Delivered",
    subtitle: "Experience our chef's signature dishes from the comfort of your home",
    image: "/elegant-restaurant-interior.png",
    ctaText: "Order Now",
    ctaLink: "/menu",
  },
  {
    id: "2",
    title: "Weekend Special",
    subtitle: "20% off all main courses this weekend only",
    image: "/gourmet-steak-dish-with-vegetables-on-elegant-plat.jpg",
    ctaText: "View Specials",
    ctaLink: "/menu?filter=specials",
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
    setIsAutoPlaying(false)
  }

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-muted">
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <Image
            src={banner.image || "/placeholder.svg"}
            alt={banner.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4 max-w-3xl">
              <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-semibold text-background mb-4 text-balance">
                {banner.title}
              </h1>
              {banner.subtitle && (
                <p className="text-lg md:text-xl text-background/90 mb-8 text-pretty">{banner.subtitle}</p>
              )}
              {banner.ctaText && banner.ctaLink && (
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8"
                  asChild
                >
                  <Link href={banner.ctaLink}>{banner.ctaText}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm flex items-center justify-center transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-background" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm flex items-center justify-center transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-background" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                index === currentSlide ? "bg-background w-8" : "bg-background/50 hover:bg-background/70",
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
