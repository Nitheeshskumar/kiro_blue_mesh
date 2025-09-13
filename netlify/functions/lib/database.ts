// Lightweight in-memory database for Netlify Functions
// This replaces Prisma with a simple JSON-based storage

export interface User {
  id: string
  email: string
  name?: string
  password: string
  role: 'CUSTOMER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  description?: string
  category: string
  basePrice: number
  images: string[]
  sizes: string[]
  colors: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
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
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'MANUFACTURING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  totalAmount: number
  paymentId?: string
  shippingInfo: any
  trackingCode?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  customizationId: string
  quantity: number
  price: number
}

// In-memory storage
let users: User[] = []
let products: Product[] = []
let customizations: Customization[] = []
let orders: Order[] = []
let orderItems: OrderItem[] = []

// Initialize with sample data
function initializeData() {
  if (users.length === 0) {
    // Sample admin user
    users.push({
      id: 'admin-1',
      email: 'admin@willowbrook.com',
      name: 'Admin User',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // secret123
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Sample products
    products.push(
      {
        id: 'prod-1',
        name: 'Classic T-Shirt',
        description: 'Comfortable cotton t-shirt perfect for customization',
        category: 'shirts',
        basePrice: 25.00,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00', '#FFFF00'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod-2',
        name: 'Premium Hoodie',
        description: 'Warm and cozy hoodie with premium materials',
        category: 'hoodies',
        basePrice: 45.00,
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['#000000', '#FFFFFF', '#808080', '#000080', '#800000'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod-3',
        name: 'Baseball Cap',
        description: 'Classic baseball cap with adjustable strap',
        category: 'accessories',
        basePrice: 20.00,
        images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400'],
        sizes: ['One Size'],
        colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    )
  }
}

// Utility functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Database operations
export class Database {
  constructor() {
    initializeData()
  }

  // User operations
  async findUserByEmail(email: string): Promise<User | null> {
    return users.find(u => u.email === email) || null
  }

  async findUserById(id: string): Promise<User | null> {
    return users.find(u => u.id === id) || null
  }

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    users.push(user)
    return user
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const index = users.findIndex(u => u.id === id)
    if (index === -1) return null
    
    users[index] = { ...users[index], ...data, updatedAt: new Date() }
    return users[index]
  }

  async countUsers(): Promise<number> {
    return users.length
  }

  async getAllUsers(skip = 0, take = 20): Promise<User[]> {
    return users.slice(skip, skip + take)
  }

  // Product operations
  async findProducts(where: { isActive?: boolean; category?: string } = {}): Promise<Product[]> {
    let filtered = products
    if (where.isActive !== undefined) {
      filtered = filtered.filter(p => p.isActive === where.isActive)
    }
    if (where.category) {
      filtered = filtered.filter(p => p.category === where.category)
    }
    return filtered
  }

  async findProductById(id: string): Promise<Product | null> {
    return products.find(p => p.id === id) || null
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const product: Product = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    products.push(product)
    return product
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    const index = products.findIndex(p => p.id === id)
    if (index === -1) return null
    
    products[index] = { ...products[index], ...data, updatedAt: new Date() }
    return products[index]
  }

  async countProducts(where: { isActive?: boolean } = {}): Promise<number> {
    let filtered = products
    if (where.isActive !== undefined) {
      filtered = filtered.filter(p => p.isActive === where.isActive)
    }
    return filtered.length
  }

  // Customization operations
  async findCustomizations(where: { userId?: string } = {}): Promise<Customization[]> {
    let filtered = customizations
    if (where.userId) {
      filtered = filtered.filter(c => c.userId === where.userId)
    }
    return filtered
  }

  async findCustomizationById(id: string): Promise<Customization | null> {
    return customizations.find(c => c.id === id) || null
  }

  async createCustomization(data: Omit<Customization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customization> {
    const customization: Customization = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    customizations.push(customization)
    return customization
  }

  async updateCustomization(id: string, data: Partial<Customization>): Promise<Customization | null> {
    const index = customizations.findIndex(c => c.id === id)
    if (index === -1) return null
    
    customizations[index] = { ...customizations[index], ...data, updatedAt: new Date() }
    return customizations[index]
  }

  async deleteCustomization(id: string): Promise<boolean> {
    const index = customizations.findIndex(c => c.id === id)
    if (index === -1) return false
    
    customizations.splice(index, 1)
    return true
  }

  async countCustomizations(where: { userId?: string } = {}): Promise<number> {
    let filtered = customizations
    if (where.userId) {
      filtered = filtered.filter(c => c.userId === where.userId)
    }
    return filtered.length
  }

  // Order operations
  async findOrders(where: { userId?: string; status?: string } = {}, skip = 0, take = 20): Promise<Order[]> {
    let filtered = orders
    if (where.userId) {
      filtered = filtered.filter(o => o.userId === where.userId)
    }
    if (where.status) {
      filtered = filtered.filter(o => o.status === where.status)
    }
    return filtered.slice(skip, skip + take).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async findOrderById(id: string): Promise<Order | null> {
    return orders.find(o => o.id === id) || null
  }

  async createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const order: Order = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    orders.push(order)
    return order
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | null> {
    const index = orders.findIndex(o => o.id === id)
    if (index === -1) return null
    
    orders[index] = { ...orders[index], ...data, updatedAt: new Date() }
    return orders[index]
  }

  async countOrders(where: { status?: string } = {}): Promise<number> {
    let filtered = orders
    if (where.status) {
      filtered = filtered.filter(o => o.status === where.status)
    }
    return filtered.length
  }

  async getTotalRevenue(): Promise<number> {
    return orders
      .filter(o => ['PAID', 'PROCESSING', 'MANUFACTURING', 'SHIPPED', 'DELIVERED'].includes(o.status))
      .reduce((sum, order) => sum + order.totalAmount, 0)
  }

  // Order item operations
  async createOrderItems(items: Omit<OrderItem, 'id'>[]): Promise<OrderItem[]> {
    const newItems = items.map(item => ({
      ...item,
      id: generateId()
    }))
    orderItems.push(...newItems)
    return newItems
  }

  async findOrderItems(orderId: string): Promise<OrderItem[]> {
    return orderItems.filter(item => item.orderId === orderId)
  }

  // Enhanced queries with relations
  async findOrderWithItems(orderId: string): Promise<(Order & { items: (OrderItem & { product: Product; customization: Customization })[] }) | null> {
    const order = await this.findOrderById(orderId)
    if (!order) return null

    const items = await this.findOrderItems(orderId)
    const itemsWithRelations = await Promise.all(
      items.map(async (item) => {
        const product = await this.findProductById(item.productId)
        const customization = await this.findCustomizationById(item.customizationId)
        return {
          ...item,
          product: product!,
          customization: customization!
        }
      })
    )

    return {
      ...order,
      items: itemsWithRelations
    }
  }

  async findUserOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product; customization: Customization })[] })[]> {
    const userOrders = await this.findOrders({ userId })
    
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await this.findOrderItems(order.id)
        const itemsWithRelations = await Promise.all(
          items.map(async (item) => {
            const product = await this.findProductById(item.productId)
            const customization = await this.findCustomizationById(item.customizationId)
            return {
              ...item,
              product: product!,
              customization: customization!
            }
          })
        )

        return {
          ...order,
          items: itemsWithRelations
        }
      })
    )

    return ordersWithItems
  }
}

// Export singleton instance
export const db = new Database()