import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getDatabase } from '../lib/database'

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn(`Authentication failed: No token provided for ${req.method} ${req.path}`)
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any
    
    const db = await getDatabase()
    const user = await db.findUserById(decoded.userId)
    if (!user) {
      console.warn(`Authentication failed: Invalid token for user ID ${decoded.userId}`)
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user
    req.user = userWithoutPassword
    
    console.log(`User authenticated: ${user.email} (${user.role}) for ${req.method} ${req.path}`)
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token format' })
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' })
    }
    res.status(401).json({ error: 'Authentication failed' })
  }
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    console.warn(`Admin access denied: No user in request for ${req.method} ${req.path}`)
    return res.status(401).json({ error: 'Authentication required' })
  }
  
  if (req.user.role !== 'ADMIN') {
    console.warn(`Admin access denied: User ${req.user.email} (${req.user.role}) attempted to access ${req.method} ${req.path}`)
    return res.status(403).json({ error: 'Admin access required' })
  }
  
  console.log(`Admin access granted: ${req.user.email} for ${req.method} ${req.path}`)
  next()
}

// Additional middleware for extra security checks
export const requireActiveUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  
  // Add any additional user status checks here
  // For example, checking if user account is active, not suspended, etc.
  
  next()
}