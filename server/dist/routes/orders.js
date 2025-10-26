"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const stripe_1 = __importDefault(require("stripe"));
const auth_1 = require("../middleware/auth");
const storyGenerator_1 = require("../utils/storyGenerator");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});
// Create order
router.post('/', auth_1.authenticateToken, async (req, res) => {
    var _a, _b;
    try {
        const { items, shippingInfo } = req.body;
        // Calculate total amount
        let totalAmount = 0;
        const orderItems = [];
        for (const item of items) {
            const customization = await prisma.customization.findUnique({
                where: { id: item.customizationId }
            });
            if (!customization) {
                return res.status(404).json({ error: `Customization ${item.customizationId} not found` });
            }
            const itemTotal = customization.totalPrice * item.quantity;
            totalAmount += itemTotal;
            // Generate or update story for this customization if not exists
            let story = (_a = customization.embroidery) === null || _a === void 0 ? void 0 : _a.story;
            if (!story) {
                const product = await prisma.product.findUnique({
                    where: { id: customization.productId }
                });
                story = (0, storyGenerator_1.generateOrderStory)({
                    color: customization.color,
                    size: customization.size,
                    embroidery: ((_b = customization.embroidery) === null || _b === void 0 ? void 0 : _b.text) || '',
                    productType: (product === null || product === void 0 ? void 0 : product.category) || 'shirts'
                });
                // Update customization with story
                await prisma.customization.update({
                    where: { id: customization.id },
                    data: {
                        embroidery: customization.embroidery
                            ? { ...customization.embroidery, story }
                            : { story }
                    }
                });
            }
            orderItems.push({
                productId: customization.productId,
                customizationId: item.customizationId,
                quantity: item.quantity,
                price: customization.totalPrice
            });
        }
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // Convert to cents
            currency: 'inr',
            metadata: {
                userId: req.user.id
            }
        });
        // Create order
        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                totalAmount,
                shippingInfo,
                paymentId: paymentIntent.id,
                items: {
                    create: orderItems
                }
            },
            include: {
                items: {
                    include: {
                        product: true,
                        customization: true
                    }
                }
            }
        });
        res.status(201).json({
            order,
            clientSecret: paymentIntent.client_secret
        });
    }
    catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});
// Get user orders
router.get('/user', auth_1.authenticateToken, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                images: true
                            }
                        },
                        customization: {
                            select: {
                                size: true,
                                color: true,
                                previewUrl: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});
// Get order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                images: true
                            }
                        },
                        customization: {
                            select: {
                                size: true,
                                color: true,
                                embroidery: true,
                                previewUrl: true
                            }
                        }
                    }
                }
            }
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});
// Update order status (Admin only)
router.put('/:id/status', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { status, trackingCode } = req.body;
        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: {
                status,
                ...(trackingCode && { trackingCode })
            }
        });
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map