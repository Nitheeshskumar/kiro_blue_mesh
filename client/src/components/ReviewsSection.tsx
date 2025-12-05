import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Camera, Plus } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { ReviewGallery } from './ReviewGallery';
import { ReviewFilters } from './ReviewFilters';
import { ReviewSubmissionForm } from './ReviewSubmissionForm';
import PremiumButton from './ui/PremiumButton';
import { 
  CustomerReview, 
  ReviewPhoto, 
  ReviewFilters as ReviewFiltersType, 
  ReviewSummary,
  ReviewsResponse,
  ReviewSubmissionData
} from '../types/review.types';
import { api } from '../lib/api';

interface ReviewsSectionProps {
  productId: string;
  productName: string;
  className?: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  productId,
  productName,
  className = ''
}) => {
  const [reviews, setReviews] = useState<(CustomerReview & { photos: ReviewPhoto[] })[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    verifiedPurchasePercentage: 0,
    photoReviewCount: 0
  });
  const [allPhotos, setAllPhotos] = useState<ReviewPhoto[]>([]);
  const [filters, setFilters] = useState<ReviewFiltersType>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchReviews = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.entries(newFilters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      });

      const response = await api.get<ReviewsResponse>(`/reviews/${productId}?${params}`);
      
      setReviews(response.data.reviews);
      setSummary(response.data.summary);
      setPagination(response.data.pagination);
      
      // Collect all photos for gallery
      const photos = response.data.reviews.flatMap(review => review.photos);
      setAllPhotos(photos);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, filters);
  }, [productId, filters]);

  const handleSubmitReview = async (reviewData: ReviewSubmissionData) => {
    try {
      setSubmitting(true);
      await api.post('/reviews', reviewData);
      setShowSubmissionForm(false);
      // Refresh reviews
      await fetchReviews(1, filters);
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`);
      // Update the review in the local state
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpful: review.helpful + 1 }
          : review
      ));
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchReviews(pagination.page + 1, filters);
    }
  };

  const renderRatingSummary = () => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {summary.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(summary.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="flex-1">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = summary.ratingDistribution[rating] || 0;
                const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="text-center">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(summary.verifiedPurchasePercentage)}%
                </div>
                <div className="text-xs text-gray-600">Verified</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {summary.photoReviewCount}
                </div>
                <div className="text-xs text-gray-600">With Photos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showSubmissionForm) {
    return (
      <div className={className}>
        <ReviewSubmissionForm
          productId={productId}
          productName={productName}
          onSubmit={handleSubmitReview}
          onCancel={() => setShowSubmissionForm(false)}
          isSubmitting={submitting}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
        </div>
        <PremiumButton
          variant="primary"
          onClick={() => setShowSubmissionForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Write Review
        </PremiumButton>
      </div>

      {/* Rating Summary */}
      {summary.totalReviews > 0 && renderRatingSummary()}

      {/* Customer Photos Gallery */}
      {allPhotos.length > 0 && (
        <div className="mb-8">
          <ReviewGallery photos={allPhotos} />
        </div>
      )}

      {/* Content */}
      {summary.totalReviews > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ReviewFilters
              filters={filters}
              onFiltersChange={setFilters}
              summary={summary}
            />
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onHelpful={handleHelpful}
                    />
                  ))}
                </div>

                {/* Load More */}
                {pagination.page < pagination.totalPages && (
                  <div className="text-center mt-6">
                    <PremiumButton
                      variant="outline"
                      onClick={handleLoadMore}
                      loading={loading}
                    >
                      Load More Reviews
                    </PremiumButton>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-6">Be the first to share your experience with this product!</p>
          <PremiumButton
            variant="primary"
            onClick={() => setShowSubmissionForm(true)}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Write the First Review
          </PremiumButton>
        </div>
      )}
    </div>
  );
};