import { Router } from 'express'
import { getDatabase } from '../lib/database'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = Router()

// Sample products data for development (consistent with server/src/routes/products.ts)
const sampleProducts = [
  {
    id: 'prod-1',
    name: 'Classic T-Shirt',
    description: 'Comfortable cotton t-shirt perfect for customization',
    category: 'shirts',
    categories: ['cotton-essentials', 'mother-daughter'],
    basePrice: 2075.00, // ₹2,075 (25 USD * 83)
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400'
    ],
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
    categories: ['cotton-essentials', 'birthday-celebration'],
    basePrice: 3735.00, // ₹3,735 (45 USD * 83)
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400'
    ],
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
    categories: ['accessories', 'kids-coordinated'],
    basePrice: 1660.00, // ₹1,660 (20 USD * 83)
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=400'
    ],
    sizes: ['One Size'],
    colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prod-4',
    name: 'Maternity Dress',
    description: 'Elegant and comfortable dress for expecting mothers',
    category: 'dresses',
    categories: ['maternity', 'cotton-essentials'],
    basePrice: 5395.00, // ₹5,395 (65 USD * 83)
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['#000080', '#800080', '#008000', '#000000'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prod-5',
    name: 'Baby Onesie Set',
    description: 'Soft organic cotton onesies for newborns',
    category: 'baby-clothes',
    categories: ['newborn-essentials', 'cotton-essentials'],
    basePrice: 2905.00, // ₹2,905 (35 USD * 83)
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400'
    ],
    sizes: ['0-3M', '3-6M', '6-9M', '9-12M'],
    colors: ['#FFB6C1', '#87CEEB', '#98FB98', '#FFFFE0'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prod-6',
    name: 'Birthday Party Dress',
    description: 'Special occasion dress perfect for celebrations',
    category: 'dresses',
    categories: ['birthday-celebration', 'kids-coordinated'],
    basePrice: 4565.00, // ₹4,565 (55 USD * 83)
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400',
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',
      'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400'
    ],
    sizes: ['2T', '3T', '4T', '5T', '6T'],
    colors: ['#FF69B4', '#9370DB', '#FFD700', '#FF6347'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// Sample categories data
const sampleCategories = [
  {
    id: 'mother-daughter',
    name: 'Mother & Daughter Collections',
    slug: 'mother-daughter',
    description: 'Matching outfits for special bonding moments',
    icon: '👩‍👧',
    productCount: 2
  },
  {
    id: 'birthday-celebration',
    name: 'Birthday Celebration Outfits',
    slug: 'birthday-celebration',
    description: 'Festive wear for memorable celebrations',
    icon: '🎂',
    productCount: 2
  },
  {
    id: 'cotton-essentials',
    name: 'Everyday Cotton Essentials',
    slug: 'cotton-essentials',
    description: 'Comfortable daily wear in premium cotton',
    icon: '👕',
    productCount: 4
  },
  {
    id: 'maternity',
    name: 'Maternity Collection',
    slug: 'maternity',
    description: 'Stylish and comfortable clothing for expecting mothers',
    icon: '🤱',
    productCount: 1
  },
  {
    id: 'newborn-essentials',
    name: 'Newborn Essentials',
    slug: 'newborn-essentials',
    description: 'Soft, safe clothing for babies 0-12 months',
    icon: '👶',
    productCount: 1
  },
  {
    id: 'accessories',
    name: 'Accessories & Add-ons',
    slug: 'accessories',
    description: 'Complementary items like scarves, belts, jewelry',
    icon: '👜',
    productCount: 1
  },
  {
    id: 'kids-coordinated',
    name: 'Kids Coordinated Sets',
    slug: 'kids-coordinated',
    description: 'Mix-and-match pieces for children',
    icon: '👦',
    productCount: 2
  }
]

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, categories, search } = req.query
    const db = await getDatabase()

    // Build query filters
    const where: any = { isActive: true }

    // Filter by single category
    if (category) {
      where.category = category as string
    }

    // Filter by multiple categories
    if (categories) {
      const categoryList = typeof categories === 'string'
        ? categories.split(',').map(c => c.trim())
        : categories as string[]
      where.categories = categoryList
    }

    // Fetch products from database
    let products = await db.findProducts(where)

    // Filter by search term (client-side filtering for now)
    if (search) {
      const searchTerm = (search as string).toLowerCase()
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
      )
    }

    res.json(products)
  } catch (error) {
    console.error('Get products error:', error)
    // Fallback to sample data if database fails
    console.log('Falling back to sample data')
    let filteredProducts = sampleProducts.filter(p => p.isActive)

    const { category, categories, search } = req.query

    if (category) {
      filteredProducts = filteredProducts.filter(p =>
        p.category === category || p.categories?.includes(category as string)
      )
    }

    if (categories) {
      const categoryList = typeof categories === 'string'
        ? categories.split(',').map(c => c.trim())
        : categories as string[]

      filteredProducts = filteredProducts.filter(p =>
        categoryList.some(cat =>
          p.category === cat || p.categories?.includes(cat)
        )
      )
    }

    if (search) {
      const searchTerm = (search as string).toLowerCase()
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
      )
    }

    res.json(filteredProducts)
  }
})

// Get all categories with product counts
router.get('/categories/all', async (req, res) => {
  try {
    const db = await getDatabase()
    const categories = await db.getCategoriesWithProductCounts()
    res.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    // Fallback to sample data if database fails
    console.log('Falling back to sample categories')
    res.json(sampleCategories)
  }
})

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()

    // Fetch product from database
    const product = await db.findProductById(id)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Add empty customizations array for consistency
    const productWithCustomizations = {
      ...product,
      customizations: []
    }

    res.json(productWithCustomizations)
  } catch (error) {
    console.error('Get product error:', error)
    // Fallback to sample data if database fails
    console.log('Falling back to sample data for product')
    const { id } = req.params
    const product = sampleProducts.find(p => p.id === id)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({ ...product, customizations: [] })
  }
})

// Create product (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, category, categories, basePrice, images, sizes, colors, colorType, hasFixedColors, sizePricing, colorPricing } = req.body

    if (!name || !category || !basePrice) {
      return res.status(400).json({ error: 'Name, category, and basePrice are required' })
    }

    const db = await getDatabase()
    const product = await db.createProduct({
      name,
      description,
      category,
      categories: categories || [],
      basePrice: parseFloat(basePrice),
      images: images || [],
      sizes: sizes || [],
      colors: colors || [],
      colorType: colorType || 'customizable',
      hasFixedColors: hasFixedColors || false,
      sizePricing: sizePricing || {},
      colorPricing: colorPricing || {},
      isActive: true
    })

    res.status(201).json(product)
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, category, categories, basePrice, images, sizes, colors, isActive, colorType, hasFixedColors, sizePricing, colorPricing } = req.body

    const db = await getDatabase()
    const product = await db.updateProduct(id, {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(categories !== undefined && { categories }),
      ...(basePrice && { basePrice: parseFloat(basePrice) }),
      ...(images && { images }),
      ...(sizes && { sizes }),
      ...(colors && { colors }),
      ...(colorType && { colorType }),
      ...(hasFixedColors !== undefined && { hasFixedColors }),
      ...(sizePricing !== undefined && { sizePricing }),
      ...(colorPricing !== undefined && { colorPricing }),
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
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
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

export default router