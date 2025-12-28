import { Router } from 'express'
import { getDatabase } from '../lib/database'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = Router()

// Get all categories (public endpoint)
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase()
    const categories = await db.getCategoriesWithProductCounts()
    res.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// Get category by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()
    const category = await db.findCategoryById(id)
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    res.json(category)
  } catch (error) {
    console.error('Failed to fetch category:', error)
    res.status(500).json({ error: 'Failed to fetch category' })
  }
})

// Admin routes - require admin authentication
router.use(authenticateToken, requireAdmin)

// Create new category
router.post('/', async (req, res) => {
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
    const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

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

// Update category
router.put('/:id', async (req, res) => {
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

// Delete category
router.delete('/:id', async (req, res) => {
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