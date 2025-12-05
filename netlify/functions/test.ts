import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  console.log('Test function called:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers
  })

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify({
      message: 'Test function is working!',
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      path: event.path,
      query: event.queryStringParameters,
      environment: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    })
  }
}