import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function FeaturedSection() {
  return (
    <section className="py-8 md:py-16">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {/* Feature Card 1 */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-auto md:min-h-[400px] group">
          <Image
            src="/restaurant-chef-preparing-food.jpg"
            alt="Our Story"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h3 className="font-serif text-2xl md:text-3xl font-semibold text-background mb-2">Our Story</h3>
            <p className="text-background/80 mb-4 max-w-sm">
              Discover the passion and craftsmanship behind every dish we create.
            </p>
            <Button variant="secondary" className="rounded-full" asChild>
              <Link href="/about">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature Card 2 */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-auto md:min-h-[400px] group">
          <Image
            src="/food-delivery-person-with-bag.jpg"
            alt="Fast Delivery"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h3 className="font-serif text-2xl md:text-3xl font-semibold text-background mb-2">Fast & Fresh</h3>
            <p className="text-background/80 mb-4 max-w-sm">
              Delivered to your door in 30 minutes or less, guaranteed fresh.
            </p>
            <Button className="rounded-full bg-primary hover:bg-primary/90" asChild>
              <Link href="/menu">
                Order Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
