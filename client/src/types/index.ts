export interface User {
  id: string
  email: string
  name?: string
  role: string
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  productCount: number
  subcategories?: ProductCategory[]
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  categories?: string[] // New field for multiple categories
  basePrice: number
  images: string[]
  sizes: string[]
  colors: string[]
}

export interface Customization {
  id: string
  userId: string
  productId: string
  size: string
  color: string
  embroidery?: any
  logoUrl?: string
  previewUrl?: string
  totalPrice: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  productId: string
  productName: string
  customizationId: string
  size: string
  color: string
  price: number
  quantity: number
  previewUrl?: string
  embroidery?: string
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  totalAmount: number
  paymentId?: string
  shippingInfo: any
  trackingCode?: string
  trackingUrl?: string
  adminNotes?: string
  contactMethod?: string
  customerInstagram?: string
  statusHistory?: StatusHistoryEntry[]
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  customizationId: string
  quantity: number
  price: number
  product: {
    name: string
    images: string[]
  }
  customization: {
    size: string
    color: string
    previewUrl?: string
    embroidery?: any
  }
}

export interface StatusHistoryEntry {
  status: OrderStatus
  timestamp: string
  previousStatus?: OrderStatus
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export interface SavedAddress {
  id: string
  userId: string
  label: string
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}