import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../lib/database'

const router = Router()

// Helper function to verify JWT token
const verifyToken = async (authHeader: string | undefined) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided')
  }

  const token = authHeader.split(' ')[1]
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
  
  const user = await db.findUserById(decoded.userId)
  if (!user) {
    throw new Error('Invalid token')
  }

  return user
}

// Create customization
router.post('/', async (req, res) => {
  try {
    const user = await verifyToken(req.headers.authorization)
    const { productId, size, color, embroidery, logoUrl } = req.body
    
    if (!productId || !size || !color) {
      return res.status(400).json({ error: 'Product ID, size, and color are required' })
    }

    const product = await db.findProductById(productId)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    let totalPrice = product.basePrice
    if (embroidery) totalPrice += 15
    if (logoUrl) totalPrice += 10

    // Generate preview URL
    let previewUrl = product.images.length > 0 ? product.images[0] : 
      `https://via.placeholder.com/400x400/${color.replace('#', '')}/ffffff?text=${encodeURIComponent(size + ' ' + product.name)}`

    const customization = await db.createCustomization({
      userId: user.id,
      productId,
      size,
      color,
      embroidery,
      logoUrl,
      previewUrl,
      totalPrice
    })

    // Return customization with product info
    const customizationWithProduct = {
      ...customization,
      product: {
        name: product.name,
        images: product.images,
        category: product.category
      }
    }

    res.status(201).json(customizationWithProduct)
  } catch (error) {
    console.error('Create customization error:', error)
    res.status(500).json({ error: 'Failed to create customization' })
  }
})

// Get user customizations
router.get('/user', async (req, res) => {
  try {
    const user = await verifyToken(req.headers.authorization)
    const customizations = await db.findCustomizations({ userId: user.id })

    // Add product info to each customization
    const customizationsWithProducts = await Promise.all(
      customizations.map(async (customization) => {
        const product = await db.findProductById(customization.productId)
        return {
          ...customization,
          product: product ? {
            name: product.name,
            images: product.images,
            category: product.category
          } : null
        }
      })
    )

    res.json(customizationsWithProducts)
  } catch (error) {
    console.error('Get customizations error:', error)
    res.status(500).json({ error: 'Failed to fetch customizations' })
  }
})

// Get customization by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await verifyToken(req.headers.authorization)
    const { id } = req.params
    
    const customization = await db.findCustomizationById(id)
    if (!customization || customization.userId !== user.id) {
      return res.status(404).json({ error: 'Customization not found' })
    }

    const product = await db.findProductById(customization.productId)
    const customizationWithProduct = {
      ...customization,
      product: product ? {
        name: product.name,
        images: product.images,
        category: product.category
      } : null
    }

    res.json(customizationWithProduct)
  } catch (error) {
    console.error('Get customization error:', error)
    res.status(500).json({ error: 'Failed to fetch customization' })
  }
})

// Update customization
router.put('/:id', async (req, res) => {
  try {
    const user = await verifyToken(req.headers.authorization)
    const { id } = req.params
    const { size, color, embroidery, logoUrl } = req.body

    const existingCustomization = await db.findCustomizationById(id)
    if (!existingCustomization || existingCustomization.userId !== user.id) {
      return res.status(404).json({ error: 'Customization not found' })
    }

    const product = await db.findProductById(existingCustomization.productId)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Recalculate price
    let totalPrice = product.basePrice
    if (embroidery) totalPrice += 15
    if (logoUrl) totalPrice += 10

    // Generate new preview URL
    let previewUrl = product.images.length > 0 ? 
      product.images[0] : 
      `https://via.placeholder.com/400x400/${color.replace('#', '')}/ffffff?text=${encodeURIComponent(size + ' ' + product.name)}`

    const customization = await db.updateCustomization(id, {
      ...(size && { size }),
      ...(color && { color }),
      ...(embroidery !== undefined && { embroidery }),
      ...(logoUrl !== undefined && { logoUrl }),
      previewUrl,
      totalPrice
    })

    if (!customization) {
      return res.status(404).json({ error: 'Failed to update customization' })
    }

    const customizationWithProduct = {
      ...customization,
      product: {
        name: product.name,
        images: product.images,
        category: product.category
      }
    }

    res.json(customizationWithProduct)
  } catch (error) {
    console.error('Update customization error:', error)
    res.status(500).json({ error: 'Failed to update customization' })
  }
})

// Delete customization
router.delete('/:id', async (req, res) => {
  try {
    const user = await verifyToken(req.headers.authorization)
    const { id } = req.params

    const customization = await db.findCustomizationById(id)
    if (!customization || customization.userId !== user.id) {
      return res.status(404).json({ error: 'Customization not found' })
    }

    const deleted = await db.deleteCustomization(id)
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete customization' })
    }

    res.json({ message: 'Customization deleted successfully' })
  } catch (error) {
    console.error('Delete customization error:', error)
    res.status(500).json({ error: 'Failed to delete customization' })
  }
})

export default router