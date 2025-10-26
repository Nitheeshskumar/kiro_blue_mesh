"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../lib/database");
const pricing_1 = require("../lib/pricing");
const router = (0, express_1.Router)();
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
// Create order
router.post('/', async (req, res) => {
    try {
        const user = await verifyToken(req.headers.authorization);
        const { items, shippingInfo } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items are required' });
        }
        if (!shippingInfo) {
            return res.status(400).json({ error: 'Shipping information is required' });
        }
        let totalAmount = 0;
        const orderItemsData = [];
        const db = await (0, database_1.getDatabase)();
        // Validate items and calculate total
        for (const item of items) {
            const customization = await db.findCustomizationById(item.customizationId);
            if (!customization) {
                return res.status(404).json({ error: `Customization ${item.customizationId} not found` });
            }
            if (customization.userId !== user.id) {
                return res.status(403).json({ error: 'Cannot order customization that belongs to another user' });
            }
            const quantity = parseInt(item.quantity) || 1;
            totalAmount += customization.totalPrice * quantity;
            orderItemsData.push({
                productId: customization.productId,
                customizationId: item.customizationId,
                quantity,
                price: customization.totalPrice
            });
        }
        // Add shipping cost (consistent with frontend)
        totalAmount += pricing_1.PRICING.STANDARD_SHIPPING;
        // Create order
        const order = await db.createOrder({
            userId: user.id,
            status: 'PENDING',
            totalAmount,
            shippingInfo
        });
        // Create order items
        const orderItems = await db.createOrderItems(orderItemsData.map((item) => ({ ...item, orderId: order.id })));
        // Get full order with items and relations
        const fullOrder = await db.findOrderWithItems(order.id);
        res.status(201).json({ order: fullOrder });
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});
// Get user orders
router.get('/user', async (req, res) => {
    try {
        const user = await verifyToken(req.headers.authorization);
        const db = await (0, database_1.getDatabase)();
        const orders = await db.findUserOrders(user.id);
        res.json(orders);
    }
    catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});
// Get order by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await verifyToken(req.headers.authorization);
        const { id } = req.params;
        const db = await (0, database_1.getDatabase)();
        const order = await db.findOrderWithItems(id);
        if (!order || order.userId !== user.id) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});
// Update order status (admin only)
router.put('/:id/status', async (req, res) => {
    try {
        const user = await verifyToken(req.headers.authorization);
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const { status, trackingCode } = req.body;
        const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'MANUFACTURING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const db = await (0, database_1.getDatabase)();
        const order = await db.updateOrder(id, {
            status,
            ...(trackingCode && { trackingCode })
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const fullOrder = await db.findOrderWithItems(id);
        res.json(fullOrder);
    }
    catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});
// Cancel order
router.put('/:id/cancel', async (req, res) => {
    try {
        const user = await verifyToken(req.headers.authorization);
        const { id } = req.params;
        const db = await (0, database_1.getDatabase)();
        const order = await db.findOrderById(id);
        if (!order || order.userId !== user.id) {
            return res.status(404).json({ error: 'Order not found' });
        }
        if (order.status !== 'PENDING' && order.status !== 'PAID') {
            return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
        }
        const updatedOrder = await db.updateOrder(id, { status: 'CANCELLED' });
        if (!updatedOrder) {
            return res.status(500).json({ error: 'Failed to cancel order' });
        }
        const fullOrder = await db.findOrderWithItems(id);
        res.json(fullOrder);
    }
    catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
});
exports.default = router;
