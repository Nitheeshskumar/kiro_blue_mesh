import { Router, Request, Response } from 'express'
import { randomUUID } from 'crypto'
import { Pool } from 'pg'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Create database pool
const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj: any) => {
  return {
    id: obj.id,
    userId: obj.user_id,
    label: obj.label,
    fullName: obj.full_name,
    phone: obj.phone,
    address: obj.address,
    city: obj.city,
    state: obj.state,
    zipCode: obj.zip_code,
    country: obj.country,
    isDefault: obj.is_default,
    createdAt: obj.created_at,
    updatedAt: obj.updated_at
  }
}

// Get all addresses for current user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const result = await pool.query(
      `SELECT * FROM saved_addresses 
       WHERE user_id = $1 
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    )

    res.json(result.rows.map(toCamelCase))
  } catch (error) {
    console.error('Error fetching addresses:', error)
    res.status(500).json({ error: 'Failed to fetch addresses' })
  }
})

// Get default address
router.get('/default', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const result = await pool.query(
      `SELECT * FROM saved_addresses 
       WHERE user_id = $1 AND is_default = true 
       LIMIT 1`,
      [userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No default address found' })
    }

    res.json(toCamelCase(result.rows[0]))
  } catch (error) {
    console.error('Error fetching default address:', error)
    res.status(500).json({ error: 'Failed to fetch default address' })
  }
})

// Create new address
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const {
      label,
      fullName,
      phone,
      address,
      city,
      state,
      zipCode,
      country = 'India',
      isDefault = false
    } = req.body

    // Validation
    if (!label || !fullName || !phone || !address || !city || !state || !zipCode) {
      return res.status(400).json({ error: 'All address fields are required' })
    }

    const addressId = randomUUID()

    const result = await pool.query(
      `INSERT INTO saved_addresses 
       (id, user_id, label, full_name, phone, address, city, state, zip_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [addressId, userId, label, fullName, phone, address, city, state, zipCode, country, isDefault]
    )

    res.status(201).json(toCamelCase(result.rows[0]))
  } catch (error) {
    console.error('Error creating address:', error)
    res.status(500).json({ error: 'Failed to create address' })
  }
})

// Update address
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params
    const {
      label,
      fullName,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      isDefault
    } = req.body

    // Check if address belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM saved_addresses WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' })
    }

    const result = await pool.query(
      `UPDATE saved_addresses 
       SET label = $1, full_name = $2, phone = $3, address = $4, 
           city = $5, state = $6, zip_code = $7, country = $8, is_default = $9
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [label, fullName, phone, address, city, state, zipCode, country, isDefault, id, userId]
    )

    res.json(toCamelCase(result.rows[0]))
  } catch (error) {
    console.error('Error updating address:', error)
    res.status(500).json({ error: 'Failed to update address' })
  }
})

// Set address as default
router.patch('/:id/default', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params

    // Check if address belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM saved_addresses WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' })
    }

    // Update address to be default (trigger will handle unsetting others)
    const result = await pool.query(
      `UPDATE saved_addresses 
       SET is_default = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    )

    res.json(toCamelCase(result.rows[0]))
  } catch (error) {
    console.error('Error setting default address:', error)
    res.status(500).json({ error: 'Failed to set default address' })
  }
})

// Delete address
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params

    // Check if address belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM saved_addresses WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' })
    }

    const wasDefault = checkResult.rows[0].is_default

    // Delete address
    await pool.query(
      'DELETE FROM saved_addresses WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    // If deleted address was default, set another as default
    if (wasDefault) {
      await pool.query(
        `UPDATE saved_addresses 
         SET is_default = true 
         WHERE user_id = $1 
         AND id = (
           SELECT id FROM saved_addresses 
           WHERE user_id = $1 
           ORDER BY created_at DESC 
           LIMIT 1
         )`,
        [userId]
      )
    }

    res.json({ message: 'Address deleted successfully' })
  } catch (error) {
    console.error('Error deleting address:', error)
    res.status(500).json({ error: 'Failed to delete address' })
  }
})

export default router
