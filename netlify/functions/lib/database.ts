// PostgreSQL database for Netlify Functions
// Connects to Neon PostgreSQL database

import { Pool } from 'pg'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  name?: string
  password: string
  role: 'CUSTOMER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
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
  description?: string
  category: string
  categories?: string[] // New field for multiple categories
  basePrice: number
  images: string[]
  sizes: string[]
  colors: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // Enhanced customization fields
  customizationOptions?: any // JSON field for CustomizationOptions
  threeDModelUrl?: string
  materialInfo?: any // JSON field for MaterialInfo[]
  careInstructions?: string[]
  // Fixed colors support
  hasFixedColors?: boolean // True if colors are fixed to the product design/image
  colorType?: 'customizable' | 'fixed' // Type of color options available
  // Size and color pricing variations
  sizePricing?: Record<string, number> // Size name to price modifier mapping
  colorPricing?: Record<string, number> // Color code/name to price modifier mapping
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
  // Enhanced customization fields
  sleeveId?: string
  customMeasurements?: any // JSON field for MeasurementFields
  customOptions?: any // JSON field for custom options
  priceBreakdown?: any // JSON field for price calculation details
}

export interface Order {
  id: string
  userId: string
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'MANUFACTURING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED'
  totalAmount: number
  paymentId?: string
  shippingInfo: any
  trackingCode?: string
  trackingUrl?: string
  adminNotes?: string
  contactMethod?: string
  customerInstagram?: string
  statusHistory?: any
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

export interface CustomerReview {
  id: string
  productId: string
  customerId: string
  customerName: string
  rating: number // 1-5 stars
  title: string
  content: string
  verified: boolean // purchased customer
  helpful: number // helpful votes
  createdAt: Date
  updatedAt: Date
}

export interface ReviewPhoto {
  id: string
  reviewId: string
  storagePath: string // Supabase Storage path
  publicUrl: string // Supabase public URL
  alt?: string
  width?: number
  height?: number
  format?: string
  fileSize: number
  originalFilename?: string
  bucketName: string
  createdAt: Date
}

export interface CustomerMeasurements {
  id: string
  customerId: string
  measurements: any // JSON field for MeasurementFields
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CustomizationPreferences {
  id: string
  customerId: string
  savedMeasurements?: any // JSON field for MeasurementFields
  preferredColors: string[]
  preferredSizes: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// PostgreSQL connection pool
let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.SUPABASE_DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('SUPABASE_DATABASE_URL environment variable is not set');
    }
    
    console.log('Initializing database connection to:', connectionString.replace(/:[^:@]*@/, ':****@'));
    
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased timeout for Netlify
    })

    // Connection event handlers for monitoring
    pool.on('error', (err) => {
      console.error('Supabase connection pool error:', err)
    })

    pool.on('connect', () => {
      console.log('Connected to Supabase database')
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
  private supabase?: SupabaseClient // Optional Supabase client for enhanced features

  constructor() {
    try {
      this.pool = getPool()
      console.log('Database pool initialized successfully')
    } catch (error) {
      console.error('Database initialization error:', error)
      throw error
    }
    
    // Initialize optional Supabase client if credentials are available
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
      )
    }
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
        CREATE TABLE IF NOT EXISTS product_categories (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          icon VARCHAR(50),
          "productCount" INTEGER DEFAULT 0,
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
          categories TEXT[] DEFAULT '{}',
          "basePrice" DECIMAL(10,2) NOT NULL,
          images TEXT[] DEFAULT '{}',
          sizes TEXT[] DEFAULT '{}',
          colors TEXT[] DEFAULT '{}',
          "isActive" BOOLEAN DEFAULT true,
          "customizationOptions" JSONB,
          "threeDModelUrl" VARCHAR(500),
          "materialInfo" JSONB,
          "careInstructions" TEXT[],
          "sizePricing" JSONB DEFAULT '{}',
          "colorPricing" JSONB DEFAULT '{}',
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
          "sleeveId" VARCHAR(255),
          "customMeasurements" JSONB,
          "customOptions" JSONB,
          "priceBreakdown" JSONB,
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

      await this.query(`
        CREATE TABLE IF NOT EXISTS customer_reviews (
          id VARCHAR(255) PRIMARY KEY,
          "productId" VARCHAR(255) REFERENCES products(id),
          "customerId" VARCHAR(255) REFERENCES users(id),
          "customerName" VARCHAR(255) NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(500) NOT NULL,
          content TEXT NOT NULL,
          verified BOOLEAN DEFAULT false,
          helpful INTEGER DEFAULT 0,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await this.query(`
        CREATE TABLE IF NOT EXISTS review_photos (
          id VARCHAR(255) PRIMARY KEY,
          "reviewId" VARCHAR(255) REFERENCES customer_reviews(id) ON DELETE CASCADE,
          "publicId" VARCHAR(255) NOT NULL,
          url VARCHAR(500) NOT NULL,
          "thumbnailUrl" VARCHAR(500) NOT NULL,
          alt VARCHAR(255),
          width INTEGER NOT NULL,
          height INTEGER NOT NULL,
          format VARCHAR(10) NOT NULL,
          bytes INTEGER NOT NULL,
          "originalFilename" VARCHAR(255),
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await this.query(`
        CREATE TABLE IF NOT EXISTS customer_measurements (
          id VARCHAR(255) PRIMARY KEY,
          "customerId" VARCHAR(255) REFERENCES users(id),
          measurements JSONB NOT NULL,
          notes TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await this.query(`
        CREATE TABLE IF NOT EXISTS customization_preferences (
          id VARCHAR(255) PRIMARY KEY,
          "customerId" VARCHAR(255) REFERENCES users(id),
          "savedMeasurements" JSONB,
          "preferredColors" TEXT[] DEFAULT '{}',
          "preferredSizes" TEXT[] DEFAULT '{}',
          notes TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      // Check if categories exist
      const categoriesExist = await this.query('SELECT id FROM product_categories LIMIT 1')
      
      if (categoriesExist.rows.length === 0) {
        // Insert product categories
        const categories = [
          {
            id: 'mother-daughter',
            name: 'Mother & Daughter Collections',
            slug: 'mother-daughter',
            description: 'Matching outfits for special bonding moments',
            icon: '👩‍👧'
          },
          {
            id: 'birthday-celebration',
            name: 'Birthday Celebration Outfits',
            slug: 'birthday-celebration',
            description: 'Festive wear for memorable celebrations',
            icon: '🎂'
          },
          {
            id: 'cotton-essentials',
            name: 'Everyday Cotton Essentials',
            slug: 'cotton-essentials',
            description: 'Comfortable daily wear in premium cotton',
            icon: '👕'
          },
          {
            id: 'maternity',
            name: 'Maternity Collection',
            slug: 'maternity',
            description: 'Stylish and comfortable clothing for expecting mothers',
            icon: '🤱'
          },
          {
            id: 'newborn-essentials',
            name: 'Newborn Essentials',
            slug: 'newborn-essentials',
            description: 'Soft, safe clothing for babies 0-12 months',
            icon: '👶'
          },
          {
            id: 'accessories',
            name: 'Accessories & Add-ons',
            slug: 'accessories',
            description: 'Complementary items like scarves, belts, jewelry',
            icon: '👜'
          },
          {
            id: 'kids-coordinated',
            name: 'Kids Coordinated Sets',
            slug: 'kids-coordinated',
            description: 'Mix-and-match pieces for children',
            icon: '👦'
          }
        ]

        for (const category of categories) {
          await this.query(`
            INSERT INTO product_categories (id, name, slug, description, icon, "productCount")
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [category.id, category.name, category.slug, category.description, category.icon, 0])
        }

        console.log('Product categories inserted successfully')
      }

      // Check if admin user exists
      const adminExists = await this.query('SELECT id FROM users WHERE email = $1', ['admin@willowbrook.com'])

      if (adminExists.rows.length === 0) {
        // Insert admin user (password: secret123)
        await this.query(`
          INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, ['admin-1', 'admin@willowbrook.com', 'Admin User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'ADMIN'])

        // Insert sample products with enhanced customization options
        const products = [
          {
            id: 'prod-1',
            name: 'Classic T-Shirt',
            description: 'Comfortable cotton t-shirt perfect for customization',
            category: 'shirts',
            categories: ['cotton-essentials', 'mother-daughter'],
            basePrice: 2075.00, // ₹2,075 (25 USD * 83)
            images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00', '#FFFF00'],
            customizationOptions: {
              colors: [
                { id: 'black', name: 'Black', hexCode: '#000000', available: true, priceModifier: 0 },
                { id: 'white', name: 'White', hexCode: '#FFFFFF', available: true, priceModifier: 0 },
                { id: 'red', name: 'Red', hexCode: '#FF0000', available: true, priceModifier: 166 }, // ₹166 (2 USD * 83)
                { id: 'blue', name: 'Blue', hexCode: '#0000FF', available: true, priceModifier: 166 }, // ₹166 (2 USD * 83)
                { id: 'green', name: 'Green', hexCode: '#00FF00', available: true, priceModifier: 166 }, // ₹166 (2 USD * 83)
                { id: 'yellow', name: 'Yellow', hexCode: '#FFFF00', available: true, priceModifier: 166 } // ₹166 (2 USD * 83)
              ],
              sizes: [
                { id: 'xs', name: 'XS', category: 'standard', available: true, priceModifier: 0 },
                { id: 's', name: 'S', category: 'standard', available: true, priceModifier: 0 },
                { id: 'm', name: 'M', category: 'standard', available: true, priceModifier: 0 },
                { id: 'l', name: 'L', category: 'standard', available: true, priceModifier: 0 },
                { id: 'xl', name: 'XL', category: 'standard', available: true, priceModifier: 249 }, // ₹249 (3 USD * 83)
                { id: 'xxl', name: 'XXL', category: 'standard', available: true, priceModifier: 415 }, // ₹415 (5 USD * 83)
                { id: 'custom', name: 'Custom Measurements', category: 'custom', available: true, priceModifier: 830 } // ₹830 (10 USD * 83)
              ],
              sleeves: [
                { id: 'short', name: 'Short Sleeve', description: 'Classic short sleeves', category: 'short', available: true, priceModifier: 0 },
                { id: 'long', name: 'Long Sleeve', description: 'Full-length sleeves', category: 'long', available: true, priceModifier: 415 }, // ₹415 (5 USD * 83)
                { id: 'sleeveless', name: 'Tank Top', description: 'No sleeves', category: 'sleeveless', available: true, priceModifier: -249 } // -₹249 (-3 USD * 83)
              ],
              customOptions: [
                { id: 'embroidery', name: 'Custom Embroidery', type: 'text', required: false, priceModifier: 664 }, // ₹664 (8 USD * 83)
                { id: 'logo', name: 'Logo Upload', type: 'image', required: false, priceModifier: 996 } // ₹996 (12 USD * 83)
              ],
              allowCustomMeasurements: true
            },
            materialInfo: [
              { name: 'Cotton', percentage: 100, properties: ['Breathable', 'Soft', 'Durable'] }
            ],
            careInstructions: ['Machine wash cold', 'Tumble dry low', 'Do not bleach']
          },
          {
            id: 'prod-2',
            name: 'Premium Hoodie',
            description: 'Warm and cozy hoodie with premium materials',
            category: 'hoodies',
            categories: ['cotton-essentials', 'birthday-celebration'],
            basePrice: 3735.00, // ₹3,735 (45 USD * 83)
            images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['#000000', '#FFFFFF', '#808080', '#000080', '#800000']
          },
          {
            id: 'prod-3',
            name: 'Baseball Cap',
            description: 'Classic baseball cap with adjustable strap',
            category: 'accessories',
            categories: ['accessories', 'kids-coordinated'],
            basePrice: 1660.00, // ₹1,660 (20 USD * 83)
            images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400'],
            sizes: ['One Size'],
            colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00']
          },
          {
            id: 'prod-4',
            name: 'Maternity Dress',
            description: 'Elegant and comfortable dress for expecting mothers',
            category: 'dresses',
            categories: ['maternity', 'cotton-essentials'],
            basePrice: 5395.00, // ₹5,395 (65 USD * 83)
            images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            colors: ['#000080', '#800080', '#008000', '#000000']
          },
          {
            id: 'prod-5',
            name: 'Baby Onesie Set',
            description: 'Soft organic cotton onesies for newborns',
            category: 'baby-clothes',
            categories: ['newborn-essentials', 'cotton-essentials'],
            basePrice: 2905.00, // ₹2,905 (35 USD * 83)
            images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400'],
            sizes: ['0-3M', '3-6M', '6-9M', '9-12M'],
            colors: ['#FFB6C1', '#87CEEB', '#98FB98', '#FFFFE0']
          },
          {
            id: 'prod-6',
            name: 'Birthday Party Dress',
            description: 'Special occasion dress perfect for celebrations',
            category: 'dresses',
            categories: ['birthday-celebration', 'kids-coordinated'],
            basePrice: 4565.00, // ₹4,565 (55 USD * 83)
            images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400'],
            sizes: ['2T', '3T', '4T', '5T', '6T'],
            colors: ['#FF69B4', '#9370DB', '#FFD700', '#FF6347']
          }
        ]

        for (const product of products) {
          await this.query(`
            INSERT INTO products (id, name, description, category, categories, "basePrice", images, sizes, colors, "customizationOptions", "materialInfo", "careInstructions")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `, [
            product.id, product.name, product.description, product.category, product.categories,
            product.basePrice, product.images, product.sizes, product.colors,
            product.customizationOptions, product.materialInfo, product.careInstructions
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

  async deleteUser(id: string): Promise<boolean> {
    try {
      // Delete related data first (customizations, then user)
      await this.query('DELETE FROM customizations WHERE "userId" = $1', [id])
      
      // Delete the user
      const result = await this.query('DELETE FROM users WHERE id = $1', [id])
      return result.rowCount > 0
    } catch (error) {
      console.error('Delete user error:', error)
      throw error
    }
  }

  // Category operations
  async findCategories(): Promise<ProductCategory[]> {
    const result = await this.query('SELECT * FROM product_categories ORDER BY name')
    return result.rows
  }

  async findCategoryById(id: string): Promise<ProductCategory | null> {
    const result = await this.query('SELECT * FROM product_categories WHERE id = $1', [id])
    return result.rows[0] || null
  }

  async findCategoryBySlug(slug: string): Promise<ProductCategory | null> {
    const result = await this.query('SELECT * FROM product_categories WHERE slug = $1', [slug])
    return result.rows[0] || null
  }

  async updateCategoryProductCount(categoryId: string, count: number): Promise<void> {
    await this.query('UPDATE product_categories SET "productCount" = $1 WHERE id = $2', [count, categoryId])
  }

  async getCategoriesWithProductCounts(): Promise<ProductCategory[]> {
    // Get all categories
    const categories = await this.findCategories()
    
    // Update product counts for each category
    for (const category of categories) {
      const result = await this.query(`
        SELECT COUNT(*) as count 
        FROM products 
        WHERE "isActive" = true AND ($1 = ANY(categories) OR category = $1)
      `, [category.id])
      
      const count = parseInt(result.rows[0].count)
      category.productCount = count
      
      // Update in database
      await this.updateCategoryProductCount(category.id, count)
    }
    
    return categories
  }

  async createCategory(categoryData: {
    id: string
    name: string
    slug: string
    description: string
    icon: string
    productCount: number
  }): Promise<ProductCategory> {
    const result = await this.query(`
      INSERT INTO product_categories (id, name, slug, description, icon, "productCount")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      categoryData.id,
      categoryData.name,
      categoryData.slug,
      categoryData.description,
      categoryData.icon,
      categoryData.productCount
    ])
    return result.rows[0]
  }

  async updateCategory(id: string, updates: {
    name?: string
    slug?: string
    description?: string
    icon?: string
  }): Promise<ProductCategory> {
    const fields = []
    const values = []
    let paramCount = 1

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount}`)
      values.push(updates.name)
      paramCount++
    }

    if (updates.slug !== undefined) {
      fields.push(`slug = $${paramCount}`)
      values.push(updates.slug)
      paramCount++
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount}`)
      values.push(updates.description)
      paramCount++
    }

    if (updates.icon !== undefined) {
      fields.push(`icon = $${paramCount}`)
      values.push(updates.icon)
      paramCount++
    }

    if (fields.length === 0) {
      throw new Error('No fields to update')
    }

    fields.push(`"updatedAt" = CURRENT_TIMESTAMP`)
    values.push(id)

    const query = `
      UPDATE product_categories 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await this.query(query, values)
    return result.rows[0]
  }

  async deleteCategory(id: string): Promise<void> {
    await this.query('DELETE FROM product_categories WHERE id = $1', [id])
  }

  async getCategoryProductCount(categoryId: string): Promise<number> {
    const result = await this.query(`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE "isActive" = true AND ($1 = ANY(categories) OR category = $1)
    `, [categoryId])
    
    return parseInt(result.rows[0].count)
  }

  // Product operations
  async findProducts(where: { isActive?: boolean; category?: string; categories?: string[] } = {}): Promise<Product[]> {
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

    if (where.categories && where.categories.length > 0) {
      // Filter by multiple categories - product must match at least one category
      const categoryConditions = where.categories.map((_, index) => {
        const paramIndex = paramCount + index
        return `($${paramIndex} = ANY(categories) OR category = $${paramIndex})`
      })
      query += ` AND (${categoryConditions.join(' OR ')})`
      params.push(...where.categories)
      paramCount += where.categories.length
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
      INSERT INTO products (id, name, description, category, categories, "basePrice", images, sizes, colors, "isActive", "hasFixedColors", "colorType", "sizePricing", "colorPricing", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [id, data.name, data.description, data.category, data.categories || [], data.basePrice, data.images, data.sizes, data.colors, data.isActive, data.hasFixedColors || false, data.colorType || 'customizable', JSON.stringify(data.sizePricing || {}), JSON.stringify(data.colorPricing || {})])
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
      INSERT INTO customizations (id, "userId", "productId", size, color, embroidery, "logoUrl", "previewUrl", "totalPrice", "sleeveId", "customMeasurements", "customOptions", "priceBreakdown", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [id, data.userId, data.productId, data.size, data.color, data.embroidery, data.logoUrl, data.previewUrl, data.totalPrice, data.sleeveId, data.customMeasurements, data.customOptions, data.priceBreakdown])
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
      INSERT INTO orders (id, "userId", status, "totalAmount", "paymentId", "shippingInfo", "trackingCode", "trackingUrl", "adminNotes", "contactMethod", "customerInstagram", "statusHistory", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      id, 
      data.userId, 
      data.status, 
      data.totalAmount, 
      data.paymentId || null, 
      data.shippingInfo, 
      data.trackingCode || null,
      data.trackingUrl || null,
      data.adminNotes || null,
      data.contactMethod || 'WHATSAPP', // Changed default from INSTAGRAM to WHATSAPP
      data.customerInstagram || null,
      data.statusHistory || '[]'
    ])
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

  // Review operations
  async findReviews(where: { productId?: string; customerId?: string; verified?: boolean } = {}, skip = 0, take = 20): Promise<CustomerReview[]> {
    let query = 'SELECT * FROM customer_reviews WHERE 1=1'
    const params = []
    let paramCount = 1

    if (where.productId) {
      query += ` AND "productId" = $${paramCount}`
      params.push(where.productId)
      paramCount++
    }

    if (where.customerId) {
      query += ` AND "customerId" = $${paramCount}`
      params.push(where.customerId)
      paramCount++
    }

    if (where.verified !== undefined) {
      query += ` AND verified = $${paramCount}`
      params.push(where.verified)
      paramCount++
    }

    query += ` ORDER BY "createdAt" DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    params.push(take, skip)

    const result = await this.query(query, params)
    return result.rows
  }

  async findReviewById(id: string): Promise<CustomerReview | null> {
    const result = await this.query('SELECT * FROM customer_reviews WHERE id = $1', [id])
    return result.rows[0] || null
  }

  async createReview(data: Omit<CustomerReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerReview> {
    const id = generateId()
    const result = await this.query(`
      INSERT INTO customer_reviews (id, "productId", "customerId", "customerName", rating, title, content, verified, helpful, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [id, data.productId, data.customerId, data.customerName, data.rating, data.title, data.content, data.verified, data.helpful])
    return result.rows[0]
  }

  async updateReview(id: string, data: Partial<CustomerReview>): Promise<CustomerReview | null> {
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
      UPDATE customer_reviews SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values)

    return result.rows[0] || null
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await this.query('DELETE FROM customer_reviews WHERE id = $1', [id])
    return result.rowCount > 0
  }

  async countReviews(where: { productId?: string; verified?: boolean } = {}): Promise<number> {
    let query = 'SELECT COUNT(*) FROM customer_reviews WHERE 1=1'
    const params = []
    let paramCount = 1

    if (where.productId) {
      query += ` AND "productId" = $${paramCount}`
      params.push(where.productId)
      paramCount++
    }

    if (where.verified !== undefined) {
      query += ` AND verified = $${paramCount}`
      params.push(where.verified)
      paramCount++
    }

    const result = await this.query(query, params)
    return parseInt(result.rows[0].count)
  }

  async getReviewSummary(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
    verifiedPurchasePercentage: number;
    photoReviewCount: number;
  }> {
    // Get basic review stats
    const statsResult = await this.query(`
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN verified = true THEN 1 END) as verified_count
      FROM customer_reviews 
      WHERE "productId" = $1
    `, [productId])

    const stats = statsResult.rows[0]
    const averageRating = parseFloat(stats.average_rating) || 0
    const totalReviews = parseInt(stats.total_reviews) || 0
    const verifiedCount = parseInt(stats.verified_count) || 0

    // Get rating distribution
    const distributionResult = await this.query(`
      SELECT rating, COUNT(*) as count
      FROM customer_reviews 
      WHERE "productId" = $1
      GROUP BY rating
      ORDER BY rating
    `, [productId])

    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    distributionResult.rows.forEach((row: any) => {
      ratingDistribution[row.rating] = parseInt(row.count)
    })

    // Get photo review count
    const photoCountResult = await this.query(`
      SELECT COUNT(DISTINCT cr.id) as photo_review_count
      FROM customer_reviews cr
      INNER JOIN review_photos rp ON cr.id = rp."reviewId"
      WHERE cr."productId" = $1
    `, [productId])

    const photoReviewCount = parseInt(photoCountResult.rows[0].photo_review_count) || 0
    const verifiedPurchasePercentage = totalReviews > 0 ? (verifiedCount / totalReviews) * 100 : 0

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
      verifiedPurchasePercentage,
      photoReviewCount
    }
  }

  // Review photo operations
  async createReviewPhotos(photos: Omit<ReviewPhoto, 'id'>[]): Promise<ReviewPhoto[]> {
    const results = []
    for (const photo of photos) {
      const id = generateId()
      const result = await this.query(`
        INSERT INTO review_photos (id, "reviewId", "storagePath", "publicUrl", alt, width, height, format, "fileSize", "originalFilename", "bucketName", "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
        RETURNING *
      `, [id, photo.reviewId, photo.storagePath, photo.publicUrl, photo.alt, photo.width, photo.height, photo.format, photo.fileSize, photo.originalFilename, photo.bucketName])
      results.push(result.rows[0])
    }
    return results
  }

  async findReviewPhotos(reviewId: string): Promise<ReviewPhoto[]> {
    const result = await this.query('SELECT * FROM review_photos WHERE "reviewId" = $1 ORDER BY "createdAt"', [reviewId])
    return result.rows
  }

  async deleteReviewPhotos(reviewId: string): Promise<boolean> {
    const result = await this.query('DELETE FROM review_photos WHERE "reviewId" = $1', [reviewId])
    return result.rowCount > 0
  }

  // Enhanced review queries with photos
  async findReviewsWithPhotos(where: { productId?: string; customerId?: string; verified?: boolean; withPhotos?: boolean } = {}, skip = 0, take = 20): Promise<(CustomerReview & { photos: ReviewPhoto[] })[]> {
    let query = 'SELECT * FROM customer_reviews WHERE 1=1'
    const params = []
    let paramCount = 1

    if (where.productId) {
      query += ` AND "productId" = $${paramCount}`
      params.push(where.productId)
      paramCount++
    }

    if (where.customerId) {
      query += ` AND "customerId" = $${paramCount}`
      params.push(where.customerId)
      paramCount++
    }

    if (where.verified !== undefined) {
      query += ` AND verified = $${paramCount}`
      params.push(where.verified)
      paramCount++
    }

    if (where.withPhotos) {
      query += ` AND EXISTS (SELECT 1 FROM review_photos WHERE "reviewId" = customer_reviews.id)`
    }

    query += ` ORDER BY "createdAt" DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    params.push(take, skip)

    const result = await this.query(query, params)
    const reviews = result.rows

    // Get photos for each review
    const reviewsWithPhotos = await Promise.all(
      reviews.map(async (review: any) => {
        const photos = await this.findReviewPhotos(review.id)
        return {
          ...review,
          photos
        }
      })
    )

    return reviewsWithPhotos
  }

  async checkUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const result = await this.query(`
      SELECT 1 FROM orders o
      INNER JOIN order_items oi ON o.id = oi."orderId"
      WHERE o."userId" = $1 AND oi."productId" = $2 AND o.status IN ('PAID', 'PROCESSING', 'MANUFACTURING', 'SHIPPED', 'DELIVERED')
      LIMIT 1
    `, [userId, productId])
    
    return result.rows.length > 0
  }

  // Customer measurements operations
  async findCustomerMeasurements(customerId: string): Promise<CustomerMeasurements | null> {
    const result = await this.query('SELECT * FROM customer_measurements WHERE "customerId" = $1 ORDER BY "updatedAt" DESC LIMIT 1', [customerId])
    return result.rows[0] || null
  }

  async createCustomerMeasurements(data: Omit<CustomerMeasurements, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerMeasurements> {
    const id = generateId()
    const result = await this.query(`
      INSERT INTO customer_measurements (id, "customerId", measurements, notes, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [id, data.customerId, data.measurements, data.notes])
    return result.rows[0]
  }

  async updateCustomerMeasurements(customerId: string, data: Partial<CustomerMeasurements>): Promise<CustomerMeasurements | null> {
    const fields = []
    const values = []
    let paramCount = 1

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'customerId' && key !== 'createdAt') {
        fields.push(`"${key}" = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    if (fields.length === 0) return null

    fields.push(`"updatedAt" = CURRENT_TIMESTAMP`)
    values.push(customerId)

    const result = await this.query(`
      UPDATE customer_measurements SET ${fields.join(', ')}
      WHERE "customerId" = $${paramCount}
      RETURNING *
    `, values)

    return result.rows[0] || null
  }

  // Customization preferences operations
  async findCustomizationPreferences(customerId: string): Promise<CustomizationPreferences | null> {
    const result = await this.query('SELECT * FROM customization_preferences WHERE "customerId" = $1', [customerId])
    return result.rows[0] || null
  }

  async createCustomizationPreferences(data: Omit<CustomizationPreferences, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomizationPreferences> {
    const id = generateId()
    const result = await this.query(`
      INSERT INTO customization_preferences (id, "customerId", "savedMeasurements", "preferredColors", "preferredSizes", notes, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [id, data.customerId, data.savedMeasurements, data.preferredColors, data.preferredSizes, data.notes])
    return result.rows[0]
  }

  async updateCustomizationPreferences(customerId: string, data: Partial<CustomizationPreferences>): Promise<CustomizationPreferences | null> {
    const fields = []
    const values = []
    let paramCount = 1

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'customerId' && key !== 'createdAt') {
        fields.push(`"${key}" = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    if (fields.length === 0) return null

    fields.push(`"updatedAt" = CURRENT_TIMESTAMP`)
    values.push(customerId)

    const result = await this.query(`
      UPDATE customization_preferences SET ${fields.join(', ')}
      WHERE "customerId" = $${paramCount}
      RETURNING *
    `, values)

    return result.rows[0] || null
  }

  // Optional Supabase enhancement methods
  // These methods provide additional functionality when Supabase client is available
  
  /**
   * Get Supabase client instance for enhanced features
   * @returns SupabaseClient instance or null if not configured
   */
  getSupabaseClient(): SupabaseClient | null {
    return this.supabase || null
  }

  /**
   * Subscribe to real-time order updates (future enhancement)
   * @param userId - User ID to filter orders
   * @param callback - Callback function for order updates
   * @returns Subscription object or null if Supabase client not available
   */
  async subscribeToOrderUpdates(userId: string, callback: (payload: any) => void) {
    if (!this.supabase) return null
    
    return this.supabase
      .channel('order-updates')
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `userId=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  /**
   * Authenticate user with Supabase (future enhancement)
   * @param token - JWT token to validate
   * @returns User data or null if authentication fails
   */
  async authenticateWithSupabase(token: string) {
    if (!this.supabase) return null
    
    try {
      const { data, error } = await this.supabase.auth.getUser(token)
      if (error) throw error
      return data.user
    } catch (error) {
      console.error('Supabase authentication error:', error)
      return null
    }
  }

  /**
   * Validate database connection and schema
   * @returns Promise<boolean> indicating if migration is valid
   */
  async validateMigration(): Promise<boolean> {
    try {
      // Check table existence
      const tables = ['users', 'products', 'orders', 'customizations', 'customer_reviews']
      for (const table of tables) {
        const result = await this.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [table])
        
        if (!result.rows[0].exists) {
          console.error(`Table ${table} not found`)
          return false
        }
      }

      // Validate data integrity
      const userCount = await this.countUsers()
      const productCount = await this.countProducts()
      
      console.log(`Migration validation: ${userCount} users, ${productCount} products`)
      return true
    } catch (error) {
      console.error('Migration validation failed:', error)
      return false
    }
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