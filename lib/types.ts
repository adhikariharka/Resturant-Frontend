// Food & Menu Types
export interface FoodItem {
  id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  image: string
  slug: string
  categoryId: string
  category?: Category
  isAvailable: boolean
  isPopular?: boolean
  options?: FoodOption[]
}

export interface FoodOption {
  id: string
  name: string
  choices: {
    id: string
    name: string
    priceModifier?: number
  }[]
}

export interface Category {
  id: string
  name: string
  slug: string
  image?: string
  itemCount?: number
}

// Order Types
export type OrderStatus = "placed" | "confirmed" | "cooking" | "on_the_way" | "delivered" | "cancelled"

export interface OrderItem {
  id: string
  foodItem: FoodItem
  quantity: number
  options?: string[]
  totalPrice: number
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  tax: number
  serviceCharge: number
  total: number
  deliveryAddress: Address
  paymentMethod: "card" | "cash"
  createdAt: string
  estimatedDelivery?: string
}

// User & Address Types
export interface Address {
  id: string
  label: string
  line1: string
  line2?: string
  city: string
  postcode: string
  isDefault?: boolean
}

// Restaurant Types
export interface OpeningHours {
  day: string
  open: string
  close: string
  isClosed?: boolean
}

export interface RestaurantInfo {
  isOpen: boolean
  nextOpenTime?: string
  holidayMessage?: string
  openingHours: OpeningHours[]
}

// Review Types
export interface Review {
  id: string
  orderId: string
  userId: string
  userName: string
  rating: number
  comment?: string
  createdAt: string
  isApproved?: boolean
}

// Banner Types
export interface Banner {
  id: string
  title: string
  subtitle?: string
  image: string
  ctaText?: string
  ctaLink?: string
  isActive?: boolean
}
