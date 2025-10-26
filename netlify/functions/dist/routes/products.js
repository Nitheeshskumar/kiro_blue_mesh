"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../lib/database");
const router = (0, express_1.Router)();
// Sample products data for development (consistent with server/src/routes/products.ts)
const sampleProducts = [
    {
        id: 'prod-1',
        name: 'Classic T-Shirt',
        description: 'Comfortable cotton t-shirt perfect for customization',
        category: 'shirts',
        categories: ['cotton-essentials', 'mother-daughter'],
        basePrice: 2075.00, // ₹2,075 (25 USD * 83)
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00', '#FFFF00'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'prod-2',
        name: 'Premium Hoodie',
        description: 'Warm and cozy hoodie with premium materials',
        category: 'hoodies',
        categories: ['cotton-essentials', 'birthday-celebration'],
        basePrice: 3735.00, // ₹3,735 (45 USD * 83)
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['#000000', '#FFFFFF', '#808080', '#000080', '#800000'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'prod-3',
        name: 'Baseball Cap',
        description: 'Classic baseball cap with adjustable strap',
        category: 'accessories',
        categories: ['accessories', 'kids-coordinated'],
        basePrice: 1660.00, // ₹1,660 (20 USD * 83)
        images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400'],
        sizes: ['One Size'],
        colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'prod-4',
        name: 'Maternity Dress',
        description: 'Elegant and comfortable dress for expecting mothers',
        category: 'dresses',
        categories: ['maternity', 'cotton-essentials'],
        basePrice: 5395.00, // ₹5,395 (65 USD * 83)
        images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['#000080', '#800080', '#008000', '#000000'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'prod-5',
        name: 'Baby Onesie Set',
        description: 'Soft organic cotton onesies for newborns',
        category: 'baby-clothes',
        categories: ['newborn-essentials', 'cotton-essentials'],
        basePrice: 2905.00, // ₹2,905 (35 USD * 83)
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400'],
        sizes: ['0-3M', '3-6M', '6-9M', '9-12M'],
        colors: ['#FFB6C1', '#87CEEB', '#98FB98', '#FFFFE0'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'prod-6',
        name: 'Birthday Party Dress',
        description: 'Special occasion dress perfect for celebrations',
        category: 'dresses',
        categories: ['birthday-celebration', 'kids-coordinated'],
        basePrice: 4565.00, // ₹4,565 (55 USD * 83)
        images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400'],
        sizes: ['2T', '3T', '4T', '5T', '6T'],
        colors: ['#FF69B4', '#9370DB', '#FFD700', '#FF6347'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];
// Sample categories data
const sampleCategories = [
    {
        id: 'mother-daughter',
        name: 'Mother & Daughter Collections',
        slug: 'mother-daughter',
        description: 'Matching outfits for special bonding moments',
        icon: '👩‍👧',
        productCount: 2
    },
    {
        id: 'birthday-celebration',
        name: 'Birthday Celebration Outfits',
        slug: 'birthday-celebration',
        description: 'Festive wear for memorable celebrations',
        icon: '🎂',
        productCount: 2
    },
    {
        id: 'cotton-essentials',
        name: 'Everyday Cotton Essentials',
        slug: 'cotton-essentials',
        description: 'Comfortable daily wear in premium cotton',
        icon: '👕',
        productCount: 4
    },
    {
        id: 'maternity',
        name: 'Maternity Collection',
        slug: 'maternity',
        description: 'Stylish and comfortable clothing for expecting mothers',
        icon: '🤱',
        productCount: 1
    },
    {
        id: 'newborn-essentials',
        name: 'Newborn Essentials',
        slug: 'newborn-essentials',
        description: 'Soft, safe clothing for babies 0-12 months',
        icon: '👶',
        productCount: 1
    },
    {
        id: 'accessories',
        name: 'Accessories & Add-ons',
        slug: 'accessories',
        description: 'Complementary items like scarves, belts, jewelry',
        icon: '👜',
        productCount: 1
    },
    {
        id: 'kids-coordinated',
        name: 'Kids Coordinated Sets',
        slug: 'kids-coordinated',
        description: 'Mix-and-match pieces for children',
        icon: '👦',
        productCount: 2
    }
];
// Helper function to verify JWT token
const verifyToken = async (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No token provided');
    }
    const token = authHeader.split(' ')[1];
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const db = await (0, database_1.getDatabase)();
    const user = await db.findUserById(decoded.userId);
    if (!user) {
        throw new Error('Invalid token');
    }
    return user;
};
// Get all products
router.get('/', async (req, res) => {
    try {
        const { category, categories, search } = req.query;
        let filteredProducts = sampleProducts.filter(p => p.isActive);
        // Filter by category
        if (category) {
            filteredProducts = filteredProducts.filter(p => p.category === category || p.categories?.includes(category));
        }
        // Filter by multiple categories
        if (categories) {
            const categoryList = typeof categories === 'string'
                ? categories.split(',').map(c => c.trim())
                : categories;
            filteredProducts = filteredProducts.filter(p => categoryList.some(cat => p.category === cat || p.categories?.includes(cat)));
        }
        // Filter by search term
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm) ||
                p.description?.toLowerCase().includes(searchTerm));
        }
        res.json(filteredProducts);
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
// Get all categories with product counts
router.get('/categories/all', async (req, res) => {
    try {
        res.json(sampleCategories);
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
        // Find product in sample data
        const product = sampleProducts.find(p => p.id === id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        // Add empty customizations array for consistency
        const productWithCustomizations = {
            ...product,
            customizations: []
        };
        res.json(productWithCustomizations);
    }
    catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});
// Create product (admin only)
router.post('/', async (req, res) => {
    try {
        const user = await verifyToken(req.headers.authorization);
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { name, description, category, categories, basePrice, images, sizes, colors } = req.body;
        if (!name || !category || !basePrice) {
            return res.status(400).json({ error: 'Name, category, and basePrice are required' });
        }
        const db = await (0, database_1.getDatabase)();
        const product = await db.createProduct({
            name,
            description,
            category,
            categories: categories || [],
            basePrice: parseFloat(basePrice),
            images: images || [],
            sizes: sizes || [],
            colors: colors || [],
            isActive: true
        });
        res.status(201).json(product);
    }
    catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});
// Update product (admin only)
router.put('/:id', async (req, res) => {
    try {
        const user = await verifyToken(req.headers.authorization);
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const { name, description, category, categories, basePrice, images, sizes, colors, isActive } = req.body;
        const db = await (0, database_1.getDatabase)();
        const product = await db.updateProduct(id, {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(category && { category }),
            ...(categories !== undefined && { categories }),
            ...(basePrice && { basePrice: parseFloat(basePrice) }),
            ...(images && { images }),
            ...(sizes && { sizes }),
            ...(colors && { colors }),
            ...(isActive !== undefined && { isActive })
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});
// Delete product (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const user = await verifyToken(req.headers.authorization);
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const db = await (0, database_1.getDatabase)();
        const product = await db.updateProduct(id, { isActive: false });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deactivated successfully' });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});
exports.default = router;
