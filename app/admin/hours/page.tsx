import { OpeningHoursContent } from "@/components/admin/opening-hours-content"

export const metadata = {
  title: "Opening Hours | Admin Dashboard",
}

export default function AdminHoursPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">Opening Hours</h1>
        <p className="text-muted-foreground">Manage your restaurant's operating hours and holiday closures.</p>
      </div>

      <OpeningHoursContent />
    </div>
  )
}
