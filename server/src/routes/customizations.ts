import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { generateOrderStory } from '../utils/storyGenerator';

const router = express.Router();
const prisma = new PrismaClient();

// Create customization
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { productId, size, color, embroidery, logoUrl } = req.body;
    
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate total price (base price + customization costs)
    let totalPrice = product.basePrice;
    if (embroidery) totalPrice += 1245; // ₹1,245 for embroidery
    if (logoUrl) totalPrice += 830; // ₹830 for logo

    // Generate story for this customization
    const story = generateOrderStory({
      color,
      size,
      embroidery: embroidery?.text || '',
      productType: product.category
    });

    // Generate preview URL using actual product image
    let previewUrl;
    if (product.images.length > 0) {
      previewUrl = product.images[0];
    } else {
      const colorHex = color.replace('#', '');
      previewUrl = `https://via.placeholder.com/400x400/${colorHex}/ffffff?text=${encodeURIComponent(size + ' ' + product.name)}`;
    }

    const customization = await prisma.customization.create({
      data: {
        userId: req.user!.id,
        productId,
        size,
        color,
        embroidery: embroidery ? { ...embroidery, story } : { story },
        logoUrl,
        previewUrl,
        totalPrice
      },
      include: {
        product: {
          select: {
            name: true,
            images: true,
            category: true
          }
        }
      }
    });

    res.status(201).json(customization);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create customization' });
  }
});

// Get user customizations
router.get('/user', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const customizations = await prisma.customization.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          select: {
            name: true,
            images: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(customizations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customizations' });
  }
});

// Get customization by ID
router.get('/:id', async (req, res) => {
  try {
    const customization = await prisma.customization.findUnique({
      where: { id: req.params.id },
      include: {
        product: {
          select: {
            name: true,
            images: true,
            category: true
          }
        }
      }
    });

    if (!customization) {
      return res.status(404).json({ error: 'Customization not found' });
    }

    res.json(customization);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customization' });
  }
});

// Generate preview (mock endpoint)
router.post('/preview', async (req, res) => {
  try {
    const { productId, color, size, embroidery } = req.body;
    
    // Get the product to use its actual image
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { images: true, name: true }
    });

    let previewUrl;
    
    if (product && product.images.length > 0) {
      // Use the actual product image as preview
      previewUrl = product.images[0];
    } else {
      // Fallback to a better placeholder that shows product info
      const colorHex = color.replace('#', '');
      previewUrl = `https://via.placeholder.com/400x400/${colorHex}/ffffff?text=${encodeURIComponent(size + ' ' + (product?.name || 'Product'))}`;
    }
    
    res.json({ previewUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

export default router;