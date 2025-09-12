import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard statistics
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders,
      topProducts
    ] = await Promise.all([
      // Total products
      prisma.product.count({ where: { isActive: true } }),
      
      // Total orders
      prisma.order.count(),
      
      // Total users
      prisma.user.count(),
      
      // Total revenue
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['PAID', 'PROCESSING', 'MANUFACTURING', 'SHIPPED', 'DELIVERED'] } }
      }),
      
      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: {
              product: { select: { name: true } }
            }
          }
        }
      }),
      
      // Top products by orders
      prisma.product.findMany({
        take: 5,
        include: {
          _count: { select: { orderItems: true } }
        },
        orderBy: {
          orderItems: { _count: 'desc' }
        }
      })
    ]);

    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: totalRevenue._sum.totalAmount || 0
      },
      recentOrders,
      topProducts
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// Get all orders for admin
router.get('/orders', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = status ? { status: status as string } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: {
              product: { select: { name: true } },
              customization: { select: { size: true, color: true } }
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.put('/orders/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { status, trackingCode } = req.body;

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(trackingCode && { trackingCode })
      },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      }
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get all users for admin
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            customizations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;