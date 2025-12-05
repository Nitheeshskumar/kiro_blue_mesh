import { Router, Request, Response } from 'express'
import { getDatabase } from '../lib/database'
import jwt from 'jsonwebtoken'

const router = Router()

// Middleware to verify JWT token
const verifyToken = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Get customer measurements
export const getCustomerMeasurements = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params
    const db = await getDatabase()
    
    const measurements = await db.findCustomerMeasurements(customerId)
    
    if (!measurements) {
      return res.status(404).json({ error: 'Measurements not found' })
    }
    
    res.json(measurements)
  } catch (error) {
    console.error('Error fetching measurements:', error)
    res.status(500).json({ error: 'Failed to fetch measurements' })
  }
}

// Save customer measurements
export const saveCustomerMeasurements = async (req: Request, res: Response) => {
  try {
    const { customerId, measurements, notes } = req.body
    const db = await getDatabase()
    
    // Check if measurements already exist
    const existing = await db.findCustomerMeasurements(customerId)
    
    let result
    if (existing) {
      // Update existing measurements
      result = await db.updateCustomerMeasurements(customerId, {
        measurements,
        notes
      })
    } else {
      // Create new measurements
      result = await db.createCustomerMeasurements({
        customerId,
        measurements,
        notes
      })
    }
    
    res.json(result)
  } catch (error) {
    console.error('Error saving measurements:', error)
    res.status(500).json({ error: 'Failed to save measurements' })
  }
}

// Get customization preferences
export const getCustomizationPreferences = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params
    const db = await getDatabase()
    
    const preferences = await db.findCustomizationPreferences(customerId)
    
    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' })
    }
    
    res.json(preferences)
  } catch (error) {
    console.error('Error fetching preferences:', error)
    res.status(500).json({ error: 'Failed to fetch preferences' })
  }
}

// Save customization preferences
export const saveCustomizationPreferences = async (req: Request, res: Response) => {
  try {
    const { customerId, savedMeasurements, preferredColors, preferredSizes, notes } = req.body
    const db = await getDatabase()
    
    // Check if preferences already exist
    const existing = await db.findCustomizationPreferences(customerId)
    
    let result
    if (existing) {
      // Update existing preferences
      result = await db.updateCustomizationPreferences(customerId, {
        savedMeasurements,
        preferredColors,
        preferredSizes,
        notes
      })
    } else {
      // Create new preferences
      result = await db.createCustomizationPreferences({
        customerId,
        savedMeasurements,
        preferredColors,
        preferredSizes,
        notes
      })
    }
    
    res.json(result)
  } catch (error) {
    console.error('Error saving preferences:', error)
    res.status(500).json({ error: 'Failed to save preferences' })
  }
}

// Get customization history
export const getCustomizationHistory = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params
    const { limit = 10, offset = 0 } = req.query
    const db = await getDatabase()
    
    const customizations = await db.findCustomizations({ 
      userId: customerId 
    })
    
    // Sort by creation date and apply pagination
    const sortedCustomizations = customizations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(Number(offset), Number(offset) + Number(limit))
    
    res.json(sortedCustomizations)
  } catch (error) {
    console.error('Error fetching customization history:', error)
    res.status(500).json({ error: 'Failed to fetch customization history' })
  }
}

// Save customization to history
export const saveCustomizationToHistory = async (req: Request, res: Response) => {
  try {
    const customization = req.body
    const db = await getDatabase()
    
    const result = await db.createCustomization(customization)
    
    res.json(result)
  } catch (error) {
    console.error('Error saving customization:', error)
    res.status(500).json({ error: 'Failed to save customization' })
  }
}

// Get enhanced product with customization options
export const getProductWithCustomization = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params
    const db = await getDatabase()
    
    const product = await db.findProductById(productId)
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    // The product already includes customizationOptions from the database
    res.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
}

// Update product customization options (admin only)
export const updateProductCustomization = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params
    const { customizationOptions, materialInfo, careInstructions, threeDModelUrl } = req.body
    const db = await getDatabase()
    
    // Verify admin role
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    
    const result = await db.updateProduct(productId, {
      customizationOptions,
      materialInfo,
      careInstructions,
      threeDModelUrl
    })
    
    if (!result) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    res.json(result)
  } catch (error) {
    console.error('Error updating product customization:', error)
    res.status(500).json({ error: 'Failed to update product customization' })
  }
}

// Calculate customization price
export const calculateCustomizationPrice = async (req: Request, res: Response) => {
  try {
    const { productId, selection } = req.body
    const db = await getDatabase()
    
    const product = await db.findProductById(productId)
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    let totalPriceModifier = 0
    const breakdown: any = {
      base: product.basePrice,
      modifiers: {}
    }
    
    if (product.customizationOptions) {
      const options = product.customizationOptions
      
      // Calculate color price modifier
      if (selection.colorId && options.colors) {
        const color = options.colors.find((c: any) => c.id === selection.colorId)
        if (color) {
          totalPriceModifier += color.priceModifier
          breakdown.modifiers.color = color.priceModifier
        }
      }
      
      // Calculate size price modifier
      if (selection.sizeId && options.sizes) {
        const size = options.sizes.find((s: any) => s.id === selection.sizeId)
        if (size) {
          totalPriceModifier += size.priceModifier
          breakdown.modifiers.size = size.priceModifier
        }
      }
      
      // Calculate sleeve price modifier
      if (selection.sleeveId && options.sleeves) {
        const sleeve = options.sleeves.find((s: any) => s.id === selection.sleeveId)
        if (sleeve) {
          totalPriceModifier += sleeve.priceModifier
          breakdown.modifiers.sleeve = sleeve.priceModifier
        }
      }
      
      // Calculate custom options price modifiers
      if (selection.customOptions && options.customOptions) {
        Object.entries(selection.customOptions).forEach(([optionId, value]) => {
          if (value) {
            const option = options.customOptions.find((o: any) => o.id === optionId)
            if (option) {
              totalPriceModifier += option.priceModifier
              breakdown.modifiers[optionId] = option.priceModifier
            }
          }
        })
      }
    }
    
    breakdown.totalModifier = totalPriceModifier
    breakdown.finalPrice = product.basePrice + totalPriceModifier
    
    res.json(breakdown)
  } catch (error) {
    console.error('Error calculating price:', error)
    res.status(500).json({ error: 'Failed to calculate price' })
  }
}

// Create customization (main endpoint)
export const createCustomization = async (req: Request, res: Response) => {
  try {
    const { productId, size, color, embroidery, logoUrl } = req.body
    const db = await getDatabase()
    
    // Verify user authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    // Get product to calculate price
    const product = await db.findProductById(productId)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    // Calculate total price using centralized pricing logic
    const { PRICING } = await import('../lib/pricing')
    let totalPrice = product.basePrice
    
    // Add embroidery cost if provided
    if (embroidery && embroidery.trim()) {
      totalPrice += PRICING.EMBROIDERY_COST
    }
    
    // Add logo cost if provided
    if (logoUrl) {
      totalPrice += PRICING.LOGO_COST
    }
    
    // Create customization
    const customization = await db.createCustomization({
      userId: req.user.userId,
      productId,
      size,
      color,
      embroidery: embroidery ? { text: embroidery.trim() } : undefined,
      logoUrl: logoUrl || undefined,
      previewUrl: product.images[0] || '', // Use product image as preview
      totalPrice,
      sleeveId: undefined,
      customMeasurements: undefined,
      customOptions: undefined,
      priceBreakdown: undefined
    })
    
    res.status(201).json(customization)
  } catch (error) {
    console.error('Error creating customization:', error)
    res.status(500).json({ error: 'Failed to create customization' })
  }
}

// Get customization by ID
export const getCustomizationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const db = await getDatabase()
    
    const customization = await db.findCustomizationById(id)
    if (!customization) {
      return res.status(404).json({ error: 'Customization not found' })
    }
    
    // Verify ownership or admin access
    if (req.user?.userId !== customization.userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    res.json(customization)
  } catch (error) {
    console.error('Error fetching customization:', error)
    res.status(500).json({ error: 'Failed to fetch customization' })
  }
}

// Get user customizations
export const getUserCustomizations = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    const db = await getDatabase()
    const customizations = await db.findCustomizations({ userId: req.user.userId })
    
    res.json(customizations)
  } catch (error) {
    console.error('Error fetching user customizations:', error)
    res.status(500).json({ error: 'Failed to fetch customizations' })
  }
}

// Generate preview (placeholder implementation)
export const generatePreview = async (req: Request, res: Response) => {
  try {
    const { productId, size, color, embroidery } = req.body
    const db = await getDatabase()
    
    const product = await db.findProductById(productId)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    // For now, return the product image as preview
    // In a real implementation, this would generate a custom preview
    const previewUrl = product.images[0] || ''
    
    res.json({ previewUrl })
  } catch (error) {
    console.error('Error generating preview:', error)
    res.status(500).json({ error: 'Failed to generate preview' })
  }
}

// Define routes
router.post('/', verifyToken, createCustomization)
router.get('/user', verifyToken, getUserCustomizations)
router.get('/:id', verifyToken, getCustomizationById)
router.post('/preview', generatePreview)
router.get('/measurements/:customerId', getCustomerMeasurements)
router.post('/measurements', saveCustomerMeasurements)
router.get('/preferences/:customerId', getCustomizationPreferences)
router.post('/preferences', saveCustomizationPreferences)
router.get('/history/:customerId', getCustomizationHistory)
router.post('/history', saveCustomizationToHistory)
router.get('/product/:productId', getProductWithCustomization)
router.put('/product/:productId', verifyToken, updateProductCustomization)
router.post('/calculate-price', calculateCustomizationPrice)

export default router