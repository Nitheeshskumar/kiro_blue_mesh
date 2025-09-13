import { Router } from 'express'
import bcrypt from 'bcryptjs'
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

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }

    const existingUser = await db.findUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await db.createUser({
      email,
      password: hashedPassword,
      name,
      role: 'CUSTOMER'
    })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({ user: userWithoutPassword, token })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await db.findUserByEmail(email)
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
    const { password: _, ...userWithoutPassword } = user

    res.json({ user: userWithoutPassword, token })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Get current user
router.get('/me', async (req, res) => {
  try {
    const user = await verifyToken(req.headers.authorization)
    const customizationCount = await db.countCustomizations({ userId: user.id })
    const orderCount = await db.countOrders()

    const profile = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      _count: {
        orders: orderCount,
        customizations: customizationCount
      }
    }

    res.json(profile)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(401).json({ error: 'Unauthorized' })
  }
})

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const user = await verifyToken(req.headers.authorization)
    const { name, email } = req.body

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await db.findUserByEmail(email)
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' })
      }
    }

    const updatedUser = await db.updateUser(user.id, {
      ...(name && { name }),
      ...(email && { email })
    })

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { password: _, ...userWithoutPassword } = updatedUser
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const user = await verifyToken(req.headers.authorization)
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' })
    }

    const userRecord = await db.findUserById(user.id)
    if (!userRecord || !await bcrypt.compare(currentPassword, userRecord.password)) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await db.updateUser(user.id, { password: hashedPassword })

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Failed to change password' })
  }
})

export default router