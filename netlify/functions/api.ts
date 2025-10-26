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
import reviewRoutes from './routes/reviews'
import { errorHandler } from './middleware/errorHandler'

// Create Express app
const app = express()

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}))
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Debug middleware to log requests
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.path}`, req.body)
//   next()
// })

app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    path: req.path
  });

  // Remove the "/api" prefix if present (for redirect compatibility)
  // if (req.url.startsWith('/api')) {
  //   req.url = req.url.slice(4); // removes "/api"
  //   console.log('Removed /api prefix, new URL:', req.url);
  // }
  next();
});

// Routes - Note: Netlify Functions automatically handle the /.netlify/functions/api prefix
app.use('/auth', authRoutes)
app.use('/products', productRoutes)
app.use('/customizations', customizationRoutes)
app.use('/orders', orderRoutes)
app.use('/admin', adminRoutes)
app.use('/reviews', reviewRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Catch-all route for debugging
app.use('*', (req, res) => {
  console.log('Unmatched route:', {
    method: req.method,
    originalUrl: req.originalUrl,
    path: req.path,
    url: req.url,
    baseUrl: req.baseUrl
  });

  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
    availableRoutes: ['/auth', '/products', '/customizations', '/orders', '/admin', '/reviews', '/health']
  })
})

// Error handling
app.use(errorHandler)

// Export the serverless function
const serverlessApp = serverless(app, {
  binary: false,
  basePath: '/.netlify/functions/api'
})

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Set context to not wait for empty event loop
  context.callbackWaitsForEmptyEventLoop = false

  console.log('Netlify Function called:', {
    httpMethod: event.httpMethod,
    path: event.path,
    rawUrl: event.rawUrl,
    headers: event.headers
  })

  // Fix the path for serverless-http
  // Remove the function prefix to get the actual API path
  let apiPath = event.path
  if (apiPath.startsWith('/.netlify/functions/api')) {
    apiPath = apiPath.replace('/.netlify/functions/api', '') || '/'
  }
  
  // Update the event path for proper routing
  const modifiedEvent = {
    ...event,
    path: apiPath
  }

  console.log('Modified event path:', {
    original: event.path,
    modified: apiPath
  })

  try {
    const result = await serverlessApp(modifiedEvent, context) as any
    console.log('Function result:', result)
    return result
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