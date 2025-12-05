import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getDatabase } from '../lib/database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation schemas
const ReviewSubmissionSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  content: z.string().min(10, 'Review must be at least 10 characters').max(2000, 'Review must be 2000 characters or less'),
  photos: z.array(z.object({
    storagePath: z.string(),
    publicUrl: z.string().url(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    format: z.string().optional(),
    fileSize: z.number().positive(),
    originalFilename: z.string().optional(),
    bucketName: z.string()
  })).max(5, 'Maximum 5 photos allowed').optional().default([])
});

const ReviewFiltersSchema = z.object({
  page: z.string().transform((val: string) => parseInt(val) || 1).optional(),
  limit: z.string().transform((val: string) => Math.min(parseInt(val) || 10, 50)).optional(),
  rating: z.string().transform((val: string) => parseInt(val)).optional(),
  verified: z.string().transform((val: string) => val === 'true').optional(),
  withPhotos: z.string().transform((val: string) => val === 'true').optional(),
  sortBy: z.enum(['newest', 'oldest', 'rating-high', 'rating-low', 'helpful']).optional()
});

// GET /api/reviews/:productId - Get reviews for a product
router.get('/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const filters = ReviewFiltersSchema.parse(req.query);
    
    const db = await getDatabase();
    
    // Verify product exists
    const product = await db.findProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { productId };
    if (filters.verified !== undefined) {
      where.verified = filters.verified;
    }

    // Get reviews with photos
    const reviews = await db.findReviewsWithPhotos({
      ...where,
      withPhotos: filters.withPhotos
    }, skip, limit);

    // Filter by rating if specified
    let filteredReviews = reviews;
    if (filters.rating) {
      filteredReviews = reviews.filter(review => review.rating === filters.rating);
    }

    // Sort reviews
    if (filters.sortBy) {
      filteredReviews.sort((a, b) => {
        switch (filters.sortBy) {
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'rating-high':
            return b.rating - a.rating;
          case 'rating-low':
            return a.rating - b.rating;
          case 'helpful':
            return b.helpful - a.helpful;
          case 'newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
    }

    // Get review summary
    const summary = await db.getReviewSummary(productId);
    
    // Get total count for pagination
    const totalReviews = await db.countReviews({ productId });
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      reviews: filteredReviews,
      summary,
      pagination: {
        page,
        limit,
        total: totalReviews,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/reviews - Submit a new review
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const reviewData = ReviewSubmissionSchema.parse(req.body);
    const userId = (req as any).user.id;
    
    const db = await getDatabase();
    
    // Verify product exists
    const product = await db.findProductById(reviewData.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get user info
    const user = await db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already reviewed this product
    const existingReviews = await db.findReviews({ 
      productId: reviewData.productId, 
      customerId: userId 
    });
    
    if (existingReviews.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Check if user purchased this product (for verification)
    const hasPurchased = await db.checkUserPurchasedProduct(userId, reviewData.productId);

    // Create review
    const review = await db.createReview({
      productId: reviewData.productId,
      customerId: userId,
      customerName: user.name || user.email.split('@')[0],
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      verified: hasPurchased,
      helpful: 0
    });

    // Create review photos if any
    if (reviewData.photos && reviewData.photos.length > 0) {
      const photoData = reviewData.photos.map((photo: any) => ({
        reviewId: review.id,
        storagePath: photo.storagePath,
        publicUrl: photo.publicUrl,
        alt: `Review photo by ${user.name || 'customer'}`,
        width: photo.width,
        height: photo.height,
        format: photo.format,
        fileSize: photo.fileSize,
        originalFilename: photo.originalFilename,
        bucketName: photo.bucketName,
        createdAt: new Date()
      }));

      await db.createReviewPhotos(photoData);
    }

    // Get the complete review with photos
    const completeReview = await db.findReviewsWithPhotos({ 
      productId: reviewData.productId,
      customerId: userId 
    }, 0, 1);

    res.status(201).json({
      message: 'Review submitted successfully',
      review: completeReview[0]
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid review data', details: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/reviews/:reviewId/helpful - Mark review as helpful
router.post('/:reviewId/helpful', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const userId = (req as any).user.id;
    
    const db = await getDatabase();
    
    // Verify review exists
    const review = await db.findReviewById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Prevent users from marking their own reviews as helpful
    if (review.customerId === userId) {
      return res.status(400).json({ error: 'Cannot mark your own review as helpful' });
    }

    // Update helpful count
    const updatedReview = await db.updateReview(reviewId, {
      helpful: review.helpful + 1
    });

    res.json({
      message: 'Review marked as helpful',
      helpful: updatedReview?.helpful || review.helpful + 1
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reviews/:reviewId - Get specific review
router.get('/review/:reviewId', async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    
    const db = await getDatabase();
    
    const review = await db.findReviewById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Get photos for this review
    const photos = await db.findReviewPhotos(reviewId);
    
    res.json({
      ...review,
      photos
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/reviews/:reviewId - Delete review (user's own review only)
router.delete('/:reviewId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const userId = (req as any).user.id;
    
    const db = await getDatabase();
    
    // Verify review exists and belongs to user
    const review = await db.findReviewById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.customerId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    // Delete review (photos will be deleted via CASCADE)
    const deleted = await db.deleteReview(reviewId);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete review' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/reviews/:reviewId - Update review (user's own review only)
router.put('/:reviewId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const userId = (req as any).user.id;
    const updateData = ReviewSubmissionSchema.partial().parse(req.body);
    
    const db = await getDatabase();
    
    // Verify review exists and belongs to user
    const review = await db.findReviewById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.customerId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    // Update review
    const updatedReview = await db.updateReview(reviewId, {
      rating: updateData.rating,
      title: updateData.title,
      content: updateData.content
    });

    // Handle photo updates if provided
    if (updateData.photos !== undefined) {
      // Delete existing photos
      await db.deleteReviewPhotos(reviewId);
      
      // Add new photos
      if (updateData.photos.length > 0) {
        const photoData = updateData.photos.map((photo: any) => ({
          reviewId,
          storagePath: photo.storagePath,
          publicUrl: photo.publicUrl,
          alt: `Review photo by customer`,
          width: photo.width,
          height: photo.height,
          format: photo.format,
          fileSize: photo.fileSize,
          originalFilename: photo.originalFilename,
          bucketName: photo.bucketName,
          createdAt: new Date()
        }));

        await db.createReviewPhotos(photoData);
      }
    }

    // Get updated review with photos
    const completeReview = await db.findReviewsWithPhotos({ 
      customerId: userId 
    }, 0, 1);

    res.json({
      message: 'Review updated successfully',
      review: completeReview.find(r => r.id === reviewId)
    });
  } catch (error: any) {
    console.error('Error updating review:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid review data', details: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;