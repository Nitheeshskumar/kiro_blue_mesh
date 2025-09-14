import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { getDatabase } from '../lib/database'

const router = Router()

// Helper function to verify JWT token
const verifyToken = async (authHeader: string | undefined) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided')
  }

  const token = authHeader.split(' ')[1]
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
  
  const db = await getDatabase()
  const user = await db.findUserById(decoded.userId)
  if (!user) {
    throw new Error('Invalid token')
  }

  return user
}

// Middleware to check admin role
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const user = await verifyToken(req.headers.authorization)
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

// Get admin stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const db = await getDatabase()
    const [totalProducts, totalOrders, totalUsers, totalRevenue] = await Promise.all([
      db.countProducts({ isActive: true }),
      db.countOrders(),
      db.countUsers(),
      db.getTotalRevenue()
    ])

    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue
      }
    })
  } catch (error) {
    console.error('Get admin stats error:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// Get all orders (admin)
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const db = await getDatabase()
    const orders = await db.findOrders(
      status ? { status: status as string } : {},
      skip,
      Number(limit)
    )

    // Add user info to orders
    const ordersWithUsers = await Promise.all(
      orders.map(async (order: any) => {
        const user = await db.findUserById(order.userId)
        const items = await db.findOrderItems(order.id)
        
        // Add product and customization info to items
        const itemsWithDetails = await Promise.all(
          items.map(async (item: any) => {
            const product = await db.findProductById(item.productId)
            const customization = await db.findCustomizationById(item.customizationId)
            return {
              ...item,
              product: product ? { name: product.name, images: product.images } : null,
              customization: customization ? { 
                size: customization.size, 
                color: customization.color, 
                previewUrl: customization.previewUrl 
              } : null
            }
          })
        )

        return {
          ...order,
          user: user ? { id: user.id, email: user.email, name: user.name } : null,
          items: itemsWithDetails
        }
      })
    )

    const total = await db.countOrders(status ? { status: status as string } : {})

    res.json({
      orders: ordersWithUsers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get admin orders error:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Get all users (admin)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const db = await getDatabase()
    const users = await db.getAllUsers(skip, Number(limit))
    
    // Add counts for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user: any) => {
        const orderCount = await db.countOrders()
        const customizationCount = await db.countCustomizations({ userId: user.id })
        
        const { password: _, ...userWithoutPassword } = user
        return {
          ...userWithoutPassword,
          _count: {
            orders: orderCount,
            customizations: customizationCount
          }
        }
      })
    )

    const total = await db.countUsers()

    res.json({
      users: usersWithCounts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get admin users error:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Get all products (admin)
router.get('/products', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const db = await getDatabase()
    const products = await db.findProducts(
      category ? { category: category as string } : {}
    )

    // Add counts for each product
    const productsWithCounts = await Promise.all(
      products.slice(skip, skip + Number(limit)).map(async (product: any) => {
        const customizations = await db.findCustomizations()
        const customizationCount = customizations.filter((c: any) => c.productId === product.id).length
        
        return {
          ...product,
          _count: {
            customizations: customizationCount,
            orderItems: 0 // Would need to implement order items counting
          }
        }
      })
    )

    const total = products.length

    res.json({
      products: productsWithCounts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Get admin products error:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// Update user role
router.put('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!['CUSTOMER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const db = await getDatabase()
    const user = await db.updateUser(id, { role })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { password: _, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Update user role error:', error)
    res.status(500).json({ error: 'Failed to update user role' })
  }
})

// Get recent activity
router.get('/activity', requireAdmin, async (req, res) => {
  try {
    const db = await getDatabase()
    const [recentOrders, recentUsers, recentCustomizations] = await Promise.all([
      db.findOrders({}, 0, 5),
      db.getAllUsers(0, 5),
      db.findCustomizations()
    ])

    // Add user info to orders
    const ordersWithUsers = await Promise.all(
      recentOrders.map(async (order: any) => {
        const user = await db.findUserById(order.userId)
        return {
          ...order,
          user: user ? { email: user.email, name: user.name } : null
        }
      })
    )

    // Add user and product info to customizations
    const customizationsWithDetails = await Promise.all(
      recentCustomizations.slice(0, 5).map(async (customization: any) => {
        const user = await db.findUserById(customization.userId)
        const product = await db.findProductById(customization.productId)
        return {
          ...customization,
          user: user ? { email: user.email, name: user.name } : null,
          product: product ? { name: product.name } : null
        }
      })
    )

    const usersWithoutPasswords = recentUsers.map((user: any) => {
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    res.json({
      recentOrders: ordersWithUsers,
      recentUsers: usersWithoutPasswords,
      recentCustomizations: customizationsWithDetails
    })
  } catch (error) {
    console.error('Get admin activity error:', error)
    res.status(500).json({ error: 'Failed to fetch activity' })
  }
})

export default router