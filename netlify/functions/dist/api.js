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
const addresses_1 = __importDefault(require("./routes/addresses"));
const categories_1 = __importDefault(require("./routes/categories"));
const errorHandler_1 = require("./middleware/errorHandler");
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false
}));
// CORS configuration - allow both production and local development
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8888',
    process.env.CLIENT_URL,
    'https://willowbrooks.netlify.app'
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Allow anyway for development
        }
    },
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
app.use('/addresses', addresses_1.default);
app.use('/categories', categories_1.default);
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
        availableRoutes: ['/auth', '/products', '/customizations', '/orders', '/admin', '/reviews', '/addresses', '/categories', '/health']
    });
});
// Error handling
app.use(errorHandler_1.errorHandler);
// Export the serverless function
// Don't set basePath - let serverless-http handle it automatically
const serverlessApp = (0, serverless_http_1.default)(app);
const handler = async (event, context) => {
    // Set context to not wait for empty event loop
    context.callbackWaitsForEmptyEventLoop = false;
    console.log('Netlify Function called:', {
        httpMethod: event.httpMethod,
        path: event.path,
        rawUrl: event.rawUrl
    });
    // serverless-http expects the path after /.netlify/functions/api
    // When request comes as /api/auth/login -> redirected to /.netlify/functions/api/auth/login
    // We need to pass /auth/login to Express
    let modifiedPath = event.path;
    // Remove the Netlify function prefix (production)
    if (modifiedPath.startsWith('/.netlify/functions/api')) {
        modifiedPath = modifiedPath.replace('/.netlify/functions/api', '');
    }
    // Remove /api prefix (local dev with netlify dev)
    else if (modifiedPath.startsWith('/api')) {
        modifiedPath = modifiedPath.replace('/api', '');
    }
    // Ensure path starts with /
    if (!modifiedPath.startsWith('/')) {
        modifiedPath = '/' + modifiedPath;
    }
    // If path is just /, it should go to health check
    if (modifiedPath === '/') {
        modifiedPath = '/health';
    }
    console.log('Path transformation:', {
        original: event.path,
        modified: modifiedPath
    });
    // Create modified event with corrected path
    const modifiedEvent = {
        ...event,
        path: modifiedPath
    };
    try {
        const result = await serverlessApp(modifiedEvent, context);
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
