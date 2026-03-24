"use client"

import Link from "next/link"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { useGetHoursQuery, useGetContactInfoQuery } from "@/lib/store/api"

const footerLinks = {
  menu: [
    { name: "All Dishes", href: "/menu" },
    { name: "Popular", href: "/menu?filter=popular" },
    { name: "Specials", href: "/menu?filter=specials" },
  ],
  info: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Cancellation Policy", href: "/cancellation-policy" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Allergen Info", href: "/allergens" },
  ],
}

export function Footer() {
  const { data: hours = [] } = useGetHoursQuery(undefined)
  const { data: contactInfo } = useGetContactInfoQuery(undefined)

  return (
    <footer className="bg-surface border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand & Contact */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-xl font-semibold text-foreground">
                {contactInfo?.restaurantName || 'The Kitchen'}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">Fine dining experience, delivered to your door.</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {contactInfo?.address || '123 High Street, London'}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                {contactInfo?.phone || '+44 20 1234 5678'}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                {contactInfo?.email || 'hello@thekitchen.com'}
              </p>
            </div>
          </div>

          {/* Menu Links */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Menu</h4>
            <ul className="space-y-2">
              {footerLinks.menu.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Information</h4>
            <ul className="space-y-2">
              {footerLinks.info.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Opening Hours
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {hours.length > 0 ? (
                hours.map((h: any, i: number) => (
                  <li key={i} className="flex justify-between gap-4">
                    <span>{h.day}</span>
                    <span>{h.isClosed ? 'Closed' : `${h.openTime} - ${h.closeTime}`}</span>
                  </li>
                ))
              ) : (
                <li>Loading...</li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} The Kitchen. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
