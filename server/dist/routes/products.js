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
// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                description: true,
                category: true,
                basePrice: true,
                images: true,
                sizes: true,
                colors: true
            }
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: {
                customizations: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        previewUrl: true,
                        color: true,
                        size: true
                    }
                }
            }
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
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