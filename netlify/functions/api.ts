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
import addressRoutes from './routes/addresses'
import { errorHandler } from './middleware/errorHandler'

// Create Express app
const app = express()

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}))

// CORS configuration - allow both production and local development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8888',
  process.env.CLIENT_URL,
  'https://willowbrooks.netlify.app'
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log('CORS blocked origin:', origin)
      callback(null, true) // Allow anyway for development
    }
  },
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
app.use('/addresses', addressRoutes)

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
    availableRoutes: ['/auth', '/products', '/customizations', '/orders', '/admin', '/reviews', '/addresses', '/health']
  })
})

// Error handling
app.use(errorHandler)

// Export the serverless function
// Don't set basePath - let serverless-http handle it automatically
const serverlessApp = serverless(app)

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Set context to not wait for empty event loop
  context.callbackWaitsForEmptyEventLoop = false

  console.log('Netlify Function called:', {
    httpMethod: event.httpMethod,
    path: event.path,
    rawUrl: event.rawUrl
  })

  // serverless-http expects the path after /.netlify/functions/api
  // When request comes as /api/auth/login -> redirected to /.netlify/functions/api/auth/login
  // We need to pass /auth/login to Express

  let modifiedPath = event.path

  // Remove the Netlify function prefix (production)
  if (modifiedPath.startsWith('/.netlify/functions/api')) {
    modifiedPath = modifiedPath.replace('/.netlify/functions/api', '')
  }
  // Remove /api prefix (local dev with netlify dev)
  else if (modifiedPath.startsWith('/api')) {
    modifiedPath = modifiedPath.replace('/api', '')
  }

  // Ensure path starts with /
  if (!modifiedPath.startsWith('/')) {
    modifiedPath = '/' + modifiedPath
  }

  // If path is just /, it should go to health check
  if (modifiedPath === '/') {
    modifiedPath = '/health'
  }

  console.log('Path transformation:', {
    original: event.path,
    modified: modifiedPath
  })

  // Create modified event with corrected path
  const modifiedEvent = {
    ...event,
    path: modifiedPath
  }

  try {
    const result = await serverlessApp(modifiedEvent, context) as any
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