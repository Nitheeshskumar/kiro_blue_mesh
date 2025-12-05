"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// Simple direct routing without Express
const handler = async (event, context) => {
    console.log('Simple API called:', {
        method: event.httpMethod,
        path: event.path,
        body: event.body
    });
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    // Extract the API path
    let apiPath = event.path;
    if (apiPath.startsWith('/.netlify/functions/api-simple')) {
        apiPath = apiPath.replace('/.netlify/functions/api-simple', '') || '/';
    }
    console.log('API Path:', apiPath);
    // Simple routing
    if (apiPath === '/health' || apiPath === '/') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: 'OK',
                message: 'Simple API is working!',
                timestamp: new Date().toISOString(),
                path: apiPath,
                method: event.httpMethod
            })
        };
    }
    if (apiPath.startsWith('/products')) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Products endpoint reached!',
                path: apiPath,
                method: event.httpMethod,
                // Return sample products for testing
                products: [
                    { id: 'test-1', name: 'Test Product 1', price: 100 },
                    { id: 'test-2', name: 'Test Product 2', price: 200 }
                ]
            })
        };
    }
    if (apiPath.startsWith('/auth')) {
        if (apiPath === '/auth/login' && event.httpMethod === 'POST') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    message: 'Login endpoint reached!',
                    path: apiPath,
                    method: event.httpMethod,
                    // Return sample response for testing
                    token: 'test-token-123',
                    user: { id: 'test-user', email: 'test@example.com' }
                })
            };
        }
    }
    // 404 for unmatched routes
    return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
            error: 'Route not found',
            path: apiPath,
            method: event.httpMethod,
            availableRoutes: ['/health', '/products', '/auth/login']
        })
    };
};
exports.handler = handler;
