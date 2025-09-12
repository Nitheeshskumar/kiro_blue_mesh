export interface User {
  id: string
  email: string
  name?: string
  role: string
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
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
  }
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  MANUFACTURING = 'MANUFACTURING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}