// PostgreSQL database for Netlify Functions
// Connects to Neon PostgreSQL database

import { Pool, PoolClient } from 'pg'

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

// PostgreSQL connection pool
let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return pool
}

// Utility functions
function generateId(): string {
  return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// Database operations
export class Database {
  private pool: Pool

  constructor() {
    this.pool = getPool()
  }

  private async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }

  // Initialize database tables if they don't exist
  async initialize(): Promise<void> {
    try {
      // Create tables if they don't exist
      await this.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'CUSTOMER',
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await this.query(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(255) NOT NULL,
          "basePrice" DECIMAL(10,2) NOT NULL,
          images TEXT[] DEFAULT '{}',
          sizes TEXT[] DEFAULT '{}',
          colors TEXT[] DEFAULT '{}',
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await this.query(`
        CREATE TABLE IF NOT EXISTS customizations (
          id VARCHAR(255) PRIMARY KEY,
          "userId" VARCHAR(255) REFERENCES users(id),
          "productId" VARCHAR(255) REFERENCES products(id),
          size VARCHAR(255) NOT NULL,
          color VARCHAR(255) NOT NULL,
          embroidery JSONB,
          "logoUrl" VARCHAR(500),
          "previewUrl" VARCHAR(500),
          "totalPrice" DECIMAL(10,2) NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await this.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(255) PRIMARY KEY,
          "userId" VARCHAR(255) REFERENCES users(id),
          status VARCHAR(50) DEFAULT 'PENDING',
          "totalAmount" DECIMAL(10,2) NOT NULL,
          "paymentId" VARCHAR(255),
          "shippingInfo" JSONB NOT NULL,
          "trackingCode" VARCHAR(255),
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await this.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id VARCHAR(255) PRIMARY KEY,
          "orderId" VARCHAR(255) REFERENCES orders(id),
          "productId" VARCHAR(255) REFERENCES products(id),
          "customizationId" VARCHAR(255) REFERENCES customizations(id),
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL
        )
      `)

      // Insert sample data if tables are empty
      await this.insertSampleData()
    } catch (error) {
      console.error('Database initialization error:', error)
    }
  }

  private async insertSampleData(): Promise<void> {
    try {
      // Check if admin user exists
      const adminExists = await this.query('SELECT id FROM users WHERE email = $1', ['admin@willowbrook.com'])

      if (adminExists.rows.length === 0) {
        // Insert admin user (password: secret123)
        await this.query(`
          INSERT INTO users (id, email, name, password, role)
          VALUES ($1, $2, $3, $4, $5)
        `, ['admin-1', 'admin@willowbrook.com', 'Admin User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'ADMIN'])

        // Insert sample products
        const products = [
          {
            id: 'prod-1',
            name: 'Classic T-Shirt',
            description: 'Comfortable cotton t-shirt perfect for customization',
            category: 'shirts',
            basePrice: 25.00,
            images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00', '#FFFF00']
          },
          {
            id: 'prod-2',
            name: 'Premium Hoodie',
            description: 'Warm and cozy hoodie with premium materials',
            category: 'hoodies',
            basePrice: 45.00,
            images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['#000000', '#FFFFFF', '#808080', '#000080', '#800000']
          },
          {
            id: 'prod-3',
            name: 'Baseball Cap',
            description: 'Classic baseball cap with adjustable strap',
            category: 'accessories',
            basePrice: 20.00,
            images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400'],
            sizes: ['One Size'],
            colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00']
          }
        ]

        for (const product of products) {
          await this.query(`
            INSERT INTO products (id, name, description, category, "basePrice", images, sizes, colors)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            product.id, product.name, product.description, product.category,
            product.basePrice, product.images, product.sizes, product.colors
          ])
        }

        console.log('Sample data inserted successfully')
      }
    } catch (error) {
      console.error('Error inserting sample data:', error)
    }
  }

  // User operations
  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.query('SELECT * FROM users WHERE email = $1', [email])
    return result.rows[0] || null
  }

  async findUserById(id: string): Promise<User | null> {
    const result = await this.query('SELECT * FROM users WHERE id = $1', [id])
    return result.rows[0] || null
  }

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = generateId()
    const result = await this.query(`
      INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [id, data.email, data.name, data.password, data.role])
    return result.rows[0]
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const fields = []
    const values = []
    let paramCount = 1

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'createdAt') {
        fields.push(`"${key}" = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    if (fields.length === 0) return null

    fields.push(`"updatedAt" = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await this.query(`
      UPDATE users SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values)

    return result.rows[0] || null
  }

  async countUsers(): Promise<number> {
    const result = await this.query('SELECT COUNT(*) FROM users')
    return parseInt(result.rows[0].count)
  }

  async getAllUsers(skip = 0, take = 20): Promise<User[]> {
    const result = await this.query('SELECT * FROM users ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2', [take, skip])
    return result.rows
  }

  // Product operations
  async findProducts(where: { isActive?: boolean; category?: string } = {}): Promise<Product[]> {
    let query = 'SELECT * FROM products WHERE 1=1'
    const params = []
    let paramCount = 1

    if (where.isActive !== undefined) {
      query += ` AND "isActive" = $${paramCount}`
      params.push(where.isActive)
      paramCount++
    }

    if (where.category) {
      query += ` AND category = $${paramCount}`
      params.push(where.category)
      paramCount++
    }

    query += ' ORDER BY "createdAt" DESC'

    const result = await this.query(query, params)
    return result.rows
  }

  async findProductById(id: string): Promise<Product | null> {
    const result = await this.query('SELECT * FROM products WHERE id = $1', [id])
    return result.rows[0] || null
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const id = generateId()
    const result = await this.query(`
      INSERT INTO products (id, name, description, category, "basePrice", images, sizes, colors, "isActive", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [id, data.name, data.description, data.category, data.basePrice, data.images, data.sizes, data.colors, data.isActive])
    return result.rows[0]
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    const fields = []
    const values = []
    let paramCount = 1

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'createdAt') {
        fields.push(`"${key}" = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    if (fields.length === 0) return null

    fields.push(`"updatedAt" = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await this.query(`
      UPDATE products SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values)

    return result.rows[0] || null
  }

  async countProducts(where: { isActive?: boolean } = {}): Promise<number> {
    let query = 'SELECT COUNT(*) FROM products WHERE 1=1'
    const params = []

    if (where.isActive !== undefined) {
      query += ' AND "isActive" = $1'
      params.push(where.isActive)
    }

    const result = await this.query(query, params)
    return parseInt(result.rows[0].count)
  }

  // Customization operations
  async findCustomizations(where: { userId?: string } = {}): Promise<Customization[]> {
    let query = 'SELECT * FROM customizations WHERE 1=1'
    const params = []

    if (where.userId) {
      query += ' AND "userId" = $1'
      params.push(where.userId)
    }

    query += ' ORDER BY "createdAt" DESC'

    const result = await this.query(query, params)
    return result.rows
  }

  async findCustomizationById(id: string): Promise<Customization | null> {
    const result = await this.query('SELECT * FROM customizations WHERE id = $1', [id])
    return result.rows[0] || null
  }

  async createCustomization(data: Omit<Customization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customization> {
    const id = generateId()
    const result = await this.query(`
      INSERT INTO customizations (id, "userId", "productId", size, color, embroidery, "logoUrl", "previewUrl", "totalPrice", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [id, data.userId, data.productId, data.size, data.color, data.embroidery, data.logoUrl, data.previewUrl, data.totalPrice])
    return result.rows[0]
  }

  async updateCustomization(id: string, data: Partial<Customization>): Promise<Customization | null> {
    const fields = []
    const values = []
    let paramCount = 1

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'createdAt') {
        fields.push(`"${key}" = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    if (fields.length === 0) return null

    fields.push(`"updatedAt" = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await this.query(`
      UPDATE customizations SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values)

    return result.rows[0] || null
  }

  async deleteCustomization(id: string): Promise<boolean> {
    const result = await this.query('DELETE FROM customizations WHERE id = $1', [id])
    return result.rowCount > 0
  }

  async countCustomizations(where: { userId?: string } = {}): Promise<number> {
    let query = 'SELECT COUNT(*) FROM customizations WHERE 1=1'
    const params = []

    if (where.userId) {
      query += ' AND "userId" = $1'
      params.push(where.userId)
    }

    const result = await this.query(query, params)
    return parseInt(result.rows[0].count)
  }

  // Order operations
  async findOrders(where: { userId?: string; status?: string } = {}, skip = 0, take = 20): Promise<Order[]> {
    let query = 'SELECT * FROM orders WHERE 1=1'
    const params = []
    let paramCount = 1

    if (where.userId) {
      query += ` AND "userId" = $${paramCount}`
      params.push(where.userId)
      paramCount++
    }

    if (where.status) {
      query += ` AND status = $${paramCount}`
      params.push(where.status)
      paramCount++
    }

    query += ` ORDER BY "createdAt" DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    params.push(take, skip)

    const result = await this.query(query, params)
    return result.rows
  }

  async findOrderById(id: string): Promise<Order | null> {
    const result = await this.query('SELECT * FROM orders WHERE id = $1', [id])
    return result.rows[0] || null
  }

  async createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const id = generateId()
    const result = await this.query(`
      INSERT INTO orders (id, "userId", status, "totalAmount", "paymentId", "shippingInfo", "trackingCode", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [id, data.userId, data.status, data.totalAmount, data.paymentId, data.shippingInfo, data.trackingCode])
    return result.rows[0]
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | null> {
    const fields = []
    const values = []
    let paramCount = 1

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'createdAt') {
        fields.push(`"${key}" = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    if (fields.length === 0) return null

    fields.push(`"updatedAt" = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await this.query(`
      UPDATE orders SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values)

    return result.rows[0] || null
  }

  async countOrders(where: { status?: string } = {}): Promise<number> {
    let query = 'SELECT COUNT(*) FROM orders WHERE 1=1'
    const params = []

    if (where.status) {
      query += ' AND status = $1'
      params.push(where.status)
    }

    const result = await this.query(query, params)
    return parseInt(result.rows[0].count)
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.query(`
      SELECT COALESCE(SUM("totalAmount"), 0) as total
      FROM orders 
      WHERE status IN ('PAID', 'PROCESSING', 'MANUFACTURING', 'SHIPPED', 'DELIVERED')
    `)
    return parseFloat(result.rows[0].total)
  }

  // Order item operations
  async createOrderItems(items: Omit<OrderItem, 'id'>[]): Promise<OrderItem[]> {
    const results = []
    for (const item of items) {
      const id = generateId()
      const result = await this.query(`
        INSERT INTO order_items (id, "orderId", "productId", "customizationId", quantity, price)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [id, item.orderId, item.productId, item.customizationId, item.quantity, item.price])
      results.push(result.rows[0])
    }
    return results
  }

  async findOrderItems(orderId: string): Promise<OrderItem[]> {
    const result = await this.query('SELECT * FROM order_items WHERE "orderId" = $1', [orderId])
    return result.rows
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

// Create and initialize database instance
let dbInstance: Database | null = null

export const getDatabase = async (): Promise<Database> => {
  if (!dbInstance) {
    dbInstance = new Database()
    await dbInstance.initialize()
  }
  return dbInstance
}

// Export for backward compatibility
export const db = {
  async getInstance() {
    return await getDatabase()
  }
}