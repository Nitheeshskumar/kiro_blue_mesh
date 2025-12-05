export interface CustomerReview {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5 stars
  title: string;
  content: string;
  photos: ReviewPhoto[];
  verified: boolean; // purchased customer
  helpful: number; // helpful votes
  createdAt: string;
  updatedAt: string;
}

export interface ReviewPhoto {
  id: string;
  reviewId: string;
  storagePath: string; // Supabase Storage path
  publicUrl: string; // Supabase public URL
  alt?: string;
  width?: number;
  height?: number;
  format?: string;
  fileSize: number;
  originalFilename?: string;
  bucketName: string;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedPurchasePercentage: number;
  photoReviewCount: number;
}

export interface ReviewSubmissionData {
  productId: string;
  rating: number;
  title: string;
  content: string;
  photos: ReviewPhotoUpload[];
}

export interface ReviewPhotoUpload {
  storagePath: string;
  publicUrl: string;
  width?: number;
  height?: number;
  format?: string;
  fileSize: number;
  originalFilename?: string;
  bucketName: string;
}

export interface ReviewFilters {
  rating?: number; // Filter by specific rating
  verified?: boolean; // Show only verified purchases
  withPhotos?: boolean; // Show only reviews with photos
  sortBy?: 'newest' | 'oldest' | 'rating-high' | 'rating-low' | 'helpful';
}

export interface ReviewsResponse {
  reviews: CustomerReview[];
  summary: ReviewSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}