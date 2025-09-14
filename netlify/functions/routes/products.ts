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

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category } = req.query
    const db = await getDatabase()
    const products = await db.findProducts({ 
      isActive: true,
      ...(category && { category: category as string })
    })

    res.json(products)
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()
    const product = await db.findProductById(id)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Get recent customizations for this product
    const allCustomizations = await db.findCustomizations()
    const productCustomizations = allCustomizations
      .filter((c: any) => c.productId === id)
      .slice(0, 10)
      .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime())

    const productWithCustomizations = {
      ...product,
      customizations: productCustomizations.map((c: any) => ({
        id: c.id,
        previewUrl: c.previewUrl,
        color: c.color,
        size: c.size
      }))
    }

    res.json(productWithCustomizations)
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// Create product (admin only)
router.post('/', async (req, res) => {
  try {
    const user = await verifyToken(req.headers.authorization)
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' })
    }

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

// Update product (admin only)
router.put('/:id', async (req, res) => {
  try {
    const user = await verifyToken(req.headers.authorization)
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' })
    }

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

// Delete product (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const user = await verifyToken(req.headers.authorization)
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' })
    }

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

export default router