"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const serverless_http_1 = __importDefault(require("serverless-http"));
// Import lightweight routes
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const customizations_1 = __importDefault(require("./routes/customizations"));
const orders_1 = __importDefault(require("./routes/orders"));
const admin_1 = __importDefault(require("./routes/admin"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const errorHandler_1 = require("./middleware/errorHandler");
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false
}));
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
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
app.use('/auth', auth_1.default);
app.use('/products', products_1.default);
app.use('/customizations', customizations_1.default);
app.use('/orders', orders_1.default);
app.use('/admin', admin_1.default);
app.use('/reviews', reviews_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
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
    });
});
// Error handling
app.use(errorHandler_1.errorHandler);
// Export the serverless function
const serverlessApp = (0, serverless_http_1.default)(app, {
    binary: false,
    basePath: '/.netlify/functions/api'
});
const handler = async (event, context) => {
    // Set context to not wait for empty event loop
    context.callbackWaitsForEmptyEventLoop = false;
    console.log('Netlify Function called:', {
        httpMethod: event.httpMethod,
        path: event.path,
        rawUrl: event.rawUrl,
        headers: event.headers
    });
    // Fix the path for serverless-http
    // Remove the function prefix to get the actual API path
    let apiPath = event.path;
    if (apiPath.startsWith('/.netlify/functions/api')) {
        apiPath = apiPath.replace('/.netlify/functions/api', '') || '/';
    }
    // Update the event path for proper routing
    const modifiedEvent = {
        ...event,
        path: apiPath
    };
    console.log('Modified event path:', {
        original: event.path,
        modified: apiPath
    });
    try {
        const result = await serverlessApp(modifiedEvent, context);
        console.log('Function result:', result);
        return result;
    }
    catch (error) {
        console.error('Serverless function error:', error);
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
        };
    }
};
exports.handler = handler;
