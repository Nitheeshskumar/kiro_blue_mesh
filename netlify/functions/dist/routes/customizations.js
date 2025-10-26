"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePreview = exports.getUserCustomizations = exports.getCustomizationById = exports.createCustomization = exports.calculateCustomizationPrice = exports.updateProductCustomization = exports.getProductWithCustomization = exports.saveCustomizationToHistory = exports.getCustomizationHistory = exports.saveCustomizationPreferences = exports.getCustomizationPreferences = exports.saveCustomerMeasurements = exports.getCustomerMeasurements = void 0;
const express_1 = require("express");
const database_1 = require("../lib/database");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
// Get customer measurements
const getCustomerMeasurements = async (req, res) => {
    try {
        const { customerId } = req.params;
        const db = await (0, database_1.getDatabase)();
        const measurements = await db.findCustomerMeasurements(customerId);
        if (!measurements) {
            return res.status(404).json({ error: 'Measurements not found' });
        }
        res.json(measurements);
    }
    catch (error) {
        console.error('Error fetching measurements:', error);
        res.status(500).json({ error: 'Failed to fetch measurements' });
    }
};
exports.getCustomerMeasurements = getCustomerMeasurements;
// Save customer measurements
const saveCustomerMeasurements = async (req, res) => {
    try {
        const { customerId, measurements, notes } = req.body;
        const db = await (0, database_1.getDatabase)();
        // Check if measurements already exist
        const existing = await db.findCustomerMeasurements(customerId);
        let result;
        if (existing) {
            // Update existing measurements
            result = await db.updateCustomerMeasurements(customerId, {
                measurements,
                notes
            });
        }
        else {
            // Create new measurements
            result = await db.createCustomerMeasurements({
                customerId,
                measurements,
                notes
            });
        }
        res.json(result);
    }
    catch (error) {
        console.error('Error saving measurements:', error);
        res.status(500).json({ error: 'Failed to save measurements' });
    }
};
exports.saveCustomerMeasurements = saveCustomerMeasurements;
// Get customization preferences
const getCustomizationPreferences = async (req, res) => {
    try {
        const { customerId } = req.params;
        const db = await (0, database_1.getDatabase)();
        const preferences = await db.findCustomizationPreferences(customerId);
        if (!preferences) {
            return res.status(404).json({ error: 'Preferences not found' });
        }
        res.json(preferences);
    }
    catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
};
exports.getCustomizationPreferences = getCustomizationPreferences;
// Save customization preferences
const saveCustomizationPreferences = async (req, res) => {
    try {
        const { customerId, savedMeasurements, preferredColors, preferredSizes, notes } = req.body;
        const db = await (0, database_1.getDatabase)();
        // Check if preferences already exist
        const existing = await db.findCustomizationPreferences(customerId);
        let result;
        if (existing) {
            // Update existing preferences
            result = await db.updateCustomizationPreferences(customerId, {
                savedMeasurements,
                preferredColors,
                preferredSizes,
                notes
            });
        }
        else {
            // Create new preferences
            result = await db.createCustomizationPreferences({
                customerId,
                savedMeasurements,
                preferredColors,
                preferredSizes,
                notes
            });
        }
        res.json(result);
    }
    catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({ error: 'Failed to save preferences' });
    }
};
exports.saveCustomizationPreferences = saveCustomizationPreferences;
// Get customization history
const getCustomizationHistory = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { limit = 10, offset = 0 } = req.query;
        const db = await (0, database_1.getDatabase)();
        const customizations = await db.findCustomizations({
            userId: customerId
        });
        // Sort by creation date and apply pagination
        const sortedCustomizations = customizations
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(Number(offset), Number(offset) + Number(limit));
        res.json(sortedCustomizations);
    }
    catch (error) {
        console.error('Error fetching customization history:', error);
        res.status(500).json({ error: 'Failed to fetch customization history' });
    }
};
exports.getCustomizationHistory = getCustomizationHistory;
// Save customization to history
const saveCustomizationToHistory = async (req, res) => {
    try {
        const customization = req.body;
        const db = await (0, database_1.getDatabase)();
        const result = await db.createCustomization(customization);
        res.json(result);
    }
    catch (error) {
        console.error('Error saving customization:', error);
        res.status(500).json({ error: 'Failed to save customization' });
    }
};
exports.saveCustomizationToHistory = saveCustomizationToHistory;
// Get enhanced product with customization options
const getProductWithCustomization = async (req, res) => {
    try {
        const { productId } = req.params;
        const db = await (0, database_1.getDatabase)();
        const product = await db.findProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        // The product already includes customizationOptions from the database
        res.json(product);
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};
exports.getProductWithCustomization = getProductWithCustomization;
// Update product customization options (admin only)
const updateProductCustomization = async (req, res) => {
    try {
        const { productId } = req.params;
        const { customizationOptions, materialInfo, careInstructions, threeDModelUrl } = req.body;
        const db = await (0, database_1.getDatabase)();
        // Verify admin role
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const result = await db.updateProduct(productId, {
            customizationOptions,
            materialInfo,
            careInstructions,
            threeDModelUrl
        });
        if (!result) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result);
    }
    catch (error) {
        console.error('Error updating product customization:', error);
        res.status(500).json({ error: 'Failed to update product customization' });
    }
};
exports.updateProductCustomization = updateProductCustomization;
// Calculate customization price
const calculateCustomizationPrice = async (req, res) => {
    try {
        const { productId, selection } = req.body;
        const db = await (0, database_1.getDatabase)();
        const product = await db.findProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        let totalPriceModifier = 0;
        const breakdown = {
            base: product.basePrice,
            modifiers: {}
        };
        if (product.customizationOptions) {
            const options = product.customizationOptions;
            // Calculate color price modifier
            if (selection.colorId && options.colors) {
                const color = options.colors.find((c) => c.id === selection.colorId);
                if (color) {
                    totalPriceModifier += color.priceModifier;
                    breakdown.modifiers.color = color.priceModifier;
                }
            }
            // Calculate size price modifier
            if (selection.sizeId && options.sizes) {
                const size = options.sizes.find((s) => s.id === selection.sizeId);
                if (size) {
                    totalPriceModifier += size.priceModifier;
                    breakdown.modifiers.size = size.priceModifier;
                }
            }
            // Calculate sleeve price modifier
            if (selection.sleeveId && options.sleeves) {
                const sleeve = options.sleeves.find((s) => s.id === selection.sleeveId);
                if (sleeve) {
                    totalPriceModifier += sleeve.priceModifier;
                    breakdown.modifiers.sleeve = sleeve.priceModifier;
                }
            }
            // Calculate custom options price modifiers
            if (selection.customOptions && options.customOptions) {
                Object.entries(selection.customOptions).forEach(([optionId, value]) => {
                    if (value) {
                        const option = options.customOptions.find((o) => o.id === optionId);
                        if (option) {
                            totalPriceModifier += option.priceModifier;
                            breakdown.modifiers[optionId] = option.priceModifier;
                        }
                    }
                });
            }
        }
        breakdown.totalModifier = totalPriceModifier;
        breakdown.finalPrice = product.basePrice + totalPriceModifier;
        res.json(breakdown);
    }
    catch (error) {
        console.error('Error calculating price:', error);
        res.status(500).json({ error: 'Failed to calculate price' });
    }
};
exports.calculateCustomizationPrice = calculateCustomizationPrice;
// Create customization (main endpoint)
const createCustomization = async (req, res) => {
    try {
        const { productId, size, color, embroidery, logoUrl } = req.body;
        const db = await (0, database_1.getDatabase)();
        // Verify user authentication
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Get product to calculate price
        const product = await db.findProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        // Calculate total price using centralized pricing logic
        const { PRICING } = await Promise.resolve().then(() => __importStar(require('../lib/pricing')));
        let totalPrice = product.basePrice;
        // Add embroidery cost if provided
        if (embroidery && embroidery.trim()) {
            totalPrice += PRICING.EMBROIDERY_COST;
        }
        // Add logo cost if provided
        if (logoUrl) {
            totalPrice += PRICING.LOGO_COST;
        }
        // Create customization
        const customization = await db.createCustomization({
            userId: req.user.userId,
            productId,
            size,
            color,
            embroidery: embroidery ? { text: embroidery.trim() } : null,
            logoUrl,
            previewUrl: product.images[0] || '', // Use product image as preview
            totalPrice
        });
        res.status(201).json(customization);
    }
    catch (error) {
        console.error('Error creating customization:', error);
        res.status(500).json({ error: 'Failed to create customization' });
    }
};
exports.createCustomization = createCustomization;
// Get customization by ID
const getCustomizationById = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, database_1.getDatabase)();
        const customization = await db.findCustomizationById(id);
        if (!customization) {
            return res.status(404).json({ error: 'Customization not found' });
        }
        // Verify ownership or admin access
        if (req.user?.userId !== customization.userId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(customization);
    }
    catch (error) {
        console.error('Error fetching customization:', error);
        res.status(500).json({ error: 'Failed to fetch customization' });
    }
};
exports.getCustomizationById = getCustomizationById;
// Get user customizations
const getUserCustomizations = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const db = await (0, database_1.getDatabase)();
        const customizations = await db.findCustomizations({ userId: req.user.userId });
        res.json(customizations);
    }
    catch (error) {
        console.error('Error fetching user customizations:', error);
        res.status(500).json({ error: 'Failed to fetch customizations' });
    }
};
exports.getUserCustomizations = getUserCustomizations;
// Generate preview (placeholder implementation)
const generatePreview = async (req, res) => {
    try {
        const { productId, size, color, embroidery } = req.body;
        const db = await (0, database_1.getDatabase)();
        const product = await db.findProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        // For now, return the product image as preview
        // In a real implementation, this would generate a custom preview
        const previewUrl = product.images[0] || '';
        res.json({ previewUrl });
    }
    catch (error) {
        console.error('Error generating preview:', error);
        res.status(500).json({ error: 'Failed to generate preview' });
    }
};
exports.generatePreview = generatePreview;
// Define routes
router.post('/', verifyToken, exports.createCustomization);
router.get('/user', verifyToken, exports.getUserCustomizations);
router.get('/:id', verifyToken, exports.getCustomizationById);
router.post('/preview', exports.generatePreview);
router.get('/measurements/:customerId', exports.getCustomerMeasurements);
router.post('/measurements', exports.saveCustomerMeasurements);
router.get('/preferences/:customerId', exports.getCustomizationPreferences);
router.post('/preferences', exports.saveCustomizationPreferences);
router.get('/history/:customerId', exports.getCustomizationHistory);
router.post('/history', exports.saveCustomizationToHistory);
router.get('/product/:productId', exports.getProductWithCustomization);
router.put('/product/:productId', verifyToken, exports.updateProductCustomization);
router.post('/calculate-price', exports.calculateCustomizationPrice);
exports.default = router;
