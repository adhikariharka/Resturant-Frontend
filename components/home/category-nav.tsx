"use client"

import Link from "next/link"
import Image from "next/image"
import { useGetCategoriesQuery } from "@/lib/store/api"
import { CategoryListSkeleton } from "@/components/skeletons/category-skeleton"

export function CategoryNav() {
  const { data: categories = [], isLoading } = useGetCategoriesQuery(undefined)

  if (isLoading) {
    return <CategoryListSkeleton />
  }

  return (
    <section className="py-6 md:py-8">
      <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6">Browse by Category</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:gap-6">
        {categories.map((category: any) => (
          <Link
            key={category.id}
            href={`/menu?category=${category.slug}`}
            className="flex flex-col items-center gap-2 min-w-[80px] group"
          >
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-muted border-2 border-transparent group-hover:border-primary transition-colors">
              <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
              {category.name}
            </span>
          </Link>
        ))}
        {categories.length === 0 && <p className="text-muted-foreground">No categories found.</p>}
      </div>
    </section>
  )
}
