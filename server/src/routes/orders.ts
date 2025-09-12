import express from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { generateOrderStory } from '../utils/storyGenerator';

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Create order
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
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
      let story = customization.embroidery?.story;
      if (!story) {
        const product = await prisma.product.findUnique({
          where: { id: customization.productId }
        });
        
        story = generateOrderStory({
          color: customization.color,
          size: customization.size,
          embroidery: customization.embroidery?.text || '',
          productType: product?.category || 'shirts'
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
      currency: 'usd',
      metadata: {
        userId: req.user!.id
      }
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
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
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user orders
router.get('/user', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
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
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status (Admin only)
router.put('/:id/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;