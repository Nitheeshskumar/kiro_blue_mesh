import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import serverless from 'serverless-http'

// Import lightweight routes
import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import customizationRoutes from './routes/customizations'
import orderRoutes from './routes/orders'
import adminRoutes from './routes/admin'
import { errorHandler } from './middleware/errorHandler'

// Create Express app
const app = express()

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes - Note: Netlify Functions automatically handle the /.netlify/functions/api prefix
app.use('/auth', authRoutes)
app.use('/products', productRoutes)
app.use('/customizations', customizationRoutes)
app.use('/orders', orderRoutes)
app.use('/admin', adminRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling
app.use(errorHandler)

// Export the serverless function
const serverlessApp = serverless(app)

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Set context to not wait for empty event loop
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    return await serverlessApp(event, context)
  } catch (error) {
    console.error('Serverless function error:', error)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

// No cleanup needed for lightweight database