"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ShoppingBag, Menu, User, Clock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useWhoamiQuery, useGetRestaurantStatusQuery, useGetCartQuery } from "@/lib/store/api"
import { LogoutDialog } from "@/components/logout-dialog"

interface HeaderProps {
  // Props removed - we'll fetch status from API
}

const navigation = [
  { name: "Menu", href: "/menu" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export function Header({ }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const { data: session } = useSession()
  const { data: userData } = useWhoamiQuery(undefined, { skip: !session })
  const user = userData || session?.user

  // Fetch restaurant status from API
  const { data: statusData } = useGetRestaurantStatusQuery(undefined, {
    pollingInterval: 60000, // Refresh every minute
  })


  // Get cart count from database for logged-in users
  const { data: cartData } = useGetCartQuery(undefined, { skip: !session })
  const cartItemCount = cartData?.reduce((total: number, item: any) => total + item.quantity, 0) || 0

  const router = useRouter()

  const handleLogout = () => {
    setLogoutDialogOpen(true)
  }

  const isOpen = statusData?.isOpen ?? true
  const nextOpenTime = statusData?.nextOpenTime ?? null

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl md:text-2xl font-semibold text-foreground">The Kitchen</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Restaurant status badge */}
            <div
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                isOpen ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", isOpen ? "bg-success" : "bg-muted-foreground")} />
              {isOpen ? "Open Now" : (statusData?.message || "Closed")}
              {/* {!isOpen && nextOpenTime && (
                <span className="text-muted-foreground ml-1">
                  <Clock className="inline w-3 h-3 mr-0.5" />
                  {nextOpenTime}
                </span>
              )} */}
            </div>

            {/* Account / Login - Desktop */}
            <div className="hidden md:flex">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="max-w-[100px] truncate">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/account">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">Order History</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </div>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground"
                  >
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </Badge>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-serif text-xl font-semibold">Menu</span>
                  </div>

                  {/* Mobile status */}
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium mb-6",
                      isOpen ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full", isOpen ? "bg-success" : "bg-muted-foreground")} />
                    {isOpen ? "Open Now" : "Closed"}
                    {/* {!isOpen && nextOpenTime && <span className="text-muted-foreground">• Opens {nextOpenTime}</span>} */}
                  </div>

                  <nav className="flex flex-col gap-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-3 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}

                    {user ? (
                      <>
                        <div className="my-2 border-t border-border" />
                        <div className="px-3 py-2 text-sm font-medium text-muted-foreground">Signed in as {user.name}</div>
                        <Link
                          href="/account"
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-3 py-3 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          My Account
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-3 py-3 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          Order History
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout()
                            setMobileMenuOpen(false)
                          }}
                          className="px-3 py-3 text-base font-medium text-destructive hover:bg-muted rounded-lg transition-colors text-left"
                        >
                          Log Out
                        </button>
                      </>
                    ) : (
                      <div className="mt-auto pt-6 border-t border-border">
                        <Button className="w-full" asChild>
                          <Link href="/login">Sign In</Link>
                        </Button>
                      </div>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Logout Dialog */}
      <LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} />
    </header>
  )
}
