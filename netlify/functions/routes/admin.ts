import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getDatabase } from '../lib/database'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = Router()

// Apply admin authentication to all routes
router.use(authenticateToken, requireAdmin)

// Get admin stats
router.get('/stats', async (req, res) => {
  try {
    const db = await getDatabase()
    const [totalProducts, totalOrders, totalUsers, totalRevenue] = await Promise.all([
      db.countProducts({ isActive: true }),
      db.countOrders(),
      db.countUsers(),
      db.getTotalRevenue()
    ])

    // Get recent orders with user info
    const recentOrdersData = await db.findOrders({}, 0, 5)
    const recentOrders = await Promise.all(
      (recentOrdersData || []).map(async (order: any) => {
        const user = await db.findUserById(order.userId)
        const items = await db.findOrderItems(order.id)

        // Add product info to items
        const itemsWithProducts = await Promise.all(
          (items || []).map(async (item: any) => {
            const product = await db.findProductById(item.productId)
            return {
              ...item,
              product: product ? { name: product.name } : { name: 'Unknown Product' }
            }
          })
        )

        return {
          ...order,
          user: user ? {
            name: user.name,
            email: user.email
          } : {
            name: 'Unknown User',
            email: 'unknown@example.com'
          },
          items: itemsWithProducts
        }
      })
    )

    // Get top products (simplified - just get all products for now)
    const allProducts = await db.findProducts({ isActive: true })
    const topProducts = (allProducts || []).slice(0, 5).map((product: any) => ({
      ...product,
      _count: {
        orderItems: 0 // Would need more complex query to get actual order counts
      }
    }))

    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue
      },
      recentOrders,
      topProducts
    })
  } catch (error) {
    console.error('Get admin stats error:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// Get all orders (admin)
router.get('/orders', async (req, res) => {
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
      orders?.map(async (order: any) => {
        const user = await db.findUserById(order.userId)
        const items = await db.findOrderItems(order.id)

        // Add product and customization info to items
        const itemsWithDetails = await Promise.all(
          items?.map(async (item: any) => {
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
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const db = await getDatabase()
    const users = await db.getAllUsers(skip, Number(limit))

    // Add counts for each user
    const usersWithCounts = await Promise.all(
      users?.map(async (user: any) => {
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
router.get('/products', async (req, res) => {
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

// Create admin user
router.post('/users', async (req, res) => {
  try {
    const { email, name, password, role = 'ADMIN' } = req.body

    // Validation
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password are required' })
    }

    if (!['CUSTOMER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }

    const db = await getDatabase()
    
    // Check if user already exists
    const existingUser = await db.findUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' })
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await db.createUser({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      password: hashedPassword,
      role
    })

    const { password: _, ...userWithoutPassword } = user
    res.status(201).json(userWithoutPassword)
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// Update user role
router.put('/users/:id/role', async (req, res) => {
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

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()
    
    // Check if user exists
    const user = await db.findUserById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Prevent deleting the current admin user
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' })
    }

    // Check if user has orders
    const orderCount = await db.countOrders()
    const userOrders = await db.findOrders({ userId: id })
    const userOrderCount = userOrders?.length || 0
    
    if (userOrderCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete user: They have ${userOrderCount} order(s). Consider deactivating instead.` 
      })
    }

    // Delete user
    await db.deleteUser(id)
    
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// Create product (admin)
router.post('/products', async (req, res) => {
  try {
    const { name, description, category, basePrice, images, sizes, colors } = req.body

    if (!name || !category || !basePrice) {
      return res.status(400).json({ error: 'Name, category, and basePrice are required' })
    }

    const db = await getDatabase()
    const product = await db.createProduct({
      name,
      description,
      category,
      basePrice: parseFloat(basePrice),
      images: images || [],
      sizes: sizes || [],
      colors: colors || [],
      isActive: true
    })

    res.status(201).json(product)
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// Update product (admin)
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, category, basePrice, images, sizes, colors, isActive } = req.body
    
    const db = await getDatabase()
    const product = await db.updateProduct(id, {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(basePrice && { basePrice: parseFloat(basePrice) }),
      ...(images && { images }),
      ...(sizes && { sizes }),
      ...(colors && { colors }),
      ...(isActive !== undefined && { isActive })
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json(product)
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// Delete product (admin)
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()
    const product = await db.updateProduct(id, { isActive: false })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({ message: 'Product deactivated successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const db = await getDatabase()
    const [recentOrders, recentUsers, recentCustomizations] = await Promise.all([
      db.findOrders({}, 0, 5),
      db.getAllUsers(0, 5),
      db.findCustomizations()
    ])

    // Add user info to orders
    const ordersWithUsers = await Promise.all(
      recentOrders?.map(async (order: any) => {
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

    const usersWithoutPasswords = recentUsers?.map((user: any) => {
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

// Category management routes
router.get('/categories', async (req, res) => {
  try {
    const db = await getDatabase()
    const categories = await db.getCategoriesWithProductCounts()
    res.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

router.post('/categories', async (req, res) => {
  try {
    const { name, description, icon } = req.body

    // Validation
    if (!name || !description || !icon) {
      return res.status(400).json({ 
        error: 'Name, description, and icon are required' 
      })
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({ 
        error: 'Category name must be between 2 and 50 characters' 
      })
    }

    if (description.trim().length < 10 || description.trim().length > 200) {
      return res.status(400).json({ 
        error: 'Description must be between 10 and 200 characters' 
      })
    }

    const db = await getDatabase()
    
    // Generate slug from name
    const slug = name.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()

    // Check if category with same name or slug already exists
    const existingBySlug = await db.findCategoryBySlug(slug)
    if (existingBySlug) {
      return res.status(409).json({ 
        error: 'A category with this name already exists' 
      })
    }

    // Generate unique ID
    const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

    // Create category
    const category = await db.createCategory({
      id,
      name: name.trim(),
      slug,
      description: description.trim(),
      icon: icon.trim(),
      productCount: 0
    })

    res.status(201).json(category)
  } catch (error) {
    console.error('Failed to create category:', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
})

router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, icon } = req.body

    // Validation
    if (!name || !description || !icon) {
      return res.status(400).json({ 
        error: 'Name, description, and icon are required' 
      })
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({ 
        error: 'Category name must be between 2 and 50 characters' 
      })
    }

    if (description.trim().length < 10 || description.trim().length > 200) {
      return res.status(400).json({ 
        error: 'Description must be between 10 and 200 characters' 
      })
    }

    const db = await getDatabase()
    
    // Check if category exists
    const existingCategory = await db.findCategoryById(id)
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' })
    }

    // Generate new slug from name
    const slug = name.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()

    // Check if another category with same slug exists (excluding current category)
    const existingBySlug = await db.findCategoryBySlug(slug)
    if (existingBySlug && existingBySlug.id !== id) {
      return res.status(409).json({ 
        error: 'A category with this name already exists' 
      })
    }

    // Update category
    const updatedCategory = await db.updateCategory(id, {
      name: name.trim(),
      slug,
      description: description.trim(),
      icon: icon.trim()
    })

    res.json(updatedCategory)
  } catch (error) {
    console.error('Failed to update category:', error)
    res.status(500).json({ error: 'Failed to update category' })
  }
})

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()
    
    // Check if category exists
    const category = await db.findCategoryById(id)
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    // Check if category has products
    const productCount = await db.getCategoryProductCount(id)
    if (productCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category: It contains ${productCount} product(s). Please move or delete all products in this category first.` 
      })
    }

    // Delete category
    await db.deleteCategory(id)
    
    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Failed to delete category:', error)
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

export default router