"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Products are now stored in the database
// Use the seeding script to populate: npm run seed-products
// Category metadata for display purposes
const categoryMetadata = {
    'shirts': { name: 'Shirts', description: 'Comfortable cotton shirts perfect for customization', icon: '👕' },
    'hoodies': { name: 'Hoodies', description: 'Warm and cozy hoodies with premium materials', icon: '🧥' },
    'accessories': { name: 'Accessories', description: 'Complementary items like caps and jewelry', icon: '👜' },
    'dresses': { name: 'Dresses', description: 'Elegant dresses for special occasions', icon: '👗' },
    'baby-clothes': { name: 'Baby Clothes', description: 'Soft, safe clothing for babies', icon: '👶' }
};
// Get all products
router.get('/', async (req, res) => {
    try {
        const { category, categories, search } = req.query;
        // Build Prisma query filters
        const where = {
            isActive: true
        };
        // Filter by category
        if (category) {
            where.category = category;
        }
        // Filter by multiple categories (for now, just use the first one since we don't have categories array)
        if (categories && !category) {
            const categoryList = typeof categories === 'string'
                ? categories.split(',').map(c => c.trim())
                : categories;
            if (categoryList.length > 0) {
                where.category = { in: categoryList };
            }
        }
        // Filter by search term
        if (search) {
            const searchTerm = search;
            where.OR = [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } }
            ];
        }
        // Fetch products from database
        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
// Get all categories with product counts
router.get('/categories/all', async (req, res) => {
    try {
        // Get categories from products in database
        const categoryStats = await prisma.product.groupBy({
            by: ['category'],
            where: { isActive: true },
            _count: { category: true }
        });
        // Map to category objects with metadata
        const categories = categoryStats.map(stat => {
            const metadata = categoryMetadata[stat.category] || {
                name: stat.category.charAt(0).toUpperCase() + stat.category.slice(1),
                description: `${stat.category} collection`,
                icon: '📦'
            };
            return {
                id: stat.category,
                name: metadata.name,
                slug: stat.category,
                description: metadata.description,
                icon: metadata.icon,
                productCount: stat._count.category
            };
        });
        res.json(categories);
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});
// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Find product in database
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                customizations: true
            }
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});
// Create product (Admin only)
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, description, category, basePrice, images, sizes, colors } = req.body;
        const product = await prisma.product.create({
            data: {
                name,
                description,
                category,
                basePrice: parseFloat(basePrice),
                images,
                sizes,
                colors
            }
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});
// Update product (Admin only)
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, description, category, basePrice, images, sizes, colors, isActive } = req.body;
        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
                category,
                basePrice: parseFloat(basePrice),
                images,
                sizes,
                colors,
                isActive
            }
        });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});
// Delete product (Admin only)
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        await prisma.product.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });
        res.json({ message: 'Product deactivated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});
// Get all products for admin (including inactive)
router.get('/admin/all', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        customizations: true,
                        orderItems: true
                    }
                }
            }
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map