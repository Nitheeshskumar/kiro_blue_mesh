import React from 'react';
import { Star, CheckCircle, Camera, Filter } from 'lucide-react';
import { ReviewFilters as ReviewFiltersType, ReviewSummary } from '../types/review.types';

interface ReviewFiltersProps {
  filters: ReviewFiltersType;
  onFiltersChange: (filters: ReviewFiltersType) => void;
  summary: ReviewSummary;
  className?: string;
}

export const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  filters,
  onFiltersChange,
  summary,
  className = ''
}) => {
  const updateFilter = (key: keyof ReviewFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  const renderStarFilter = (rating: number, count: number) => {
    const isActive = filters.rating === rating;
    const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;

    return (
      <button
        key={rating}
        onClick={() => updateFilter('rating', isActive ? undefined : rating)}
        className={`flex items-center justify-between w-full p-3 rounded-lg border transition-colors ${
          isActive
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">
            {rating} star{rating !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-400 transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 min-w-[2rem] text-right">
            {count}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filter Reviews</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Rating Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">By Rating</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => 
              renderStarFilter(rating, summary.ratingDistribution[rating] || 0)
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h4>
          <div className="space-y-2">
            {/* Verified Purchases */}
            <button
              onClick={() => updateFilter('verified', filters.verified ? undefined : true)}
              className={`flex items-center justify-between w-full p-3 rounded-lg border transition-colors ${
                filters.verified
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Verified Purchases</span>
              </div>
              <span className="text-sm text-gray-600">
                {Math.round(summary.verifiedPurchasePercentage)}%
              </span>
            </button>

            {/* With Photos */}
            <button
              onClick={() => updateFilter('withPhotos', filters.withPhotos ? undefined : true)}
              className={`flex items-center justify-between w-full p-3 rounded-lg border transition-colors ${
                filters.withPhotos
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">With Photos</span>
              </div>
              <span className="text-sm text-gray-600">
                {summary.photoReviewCount}
              </span>
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Sort By</h4>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => updateFilter('sortBy', e.target.value as any)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.rating && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                {filters.rating} stars
                <button
                  onClick={() => updateFilter('rating', undefined)}
                  className="ml-1 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Verified
                <button
                  onClick={() => updateFilter('verified', undefined)}
                  className="ml-1 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.withPhotos && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                With Photos
                <button
                  onClick={() => updateFilter('withPhotos', undefined)}
                  className="ml-1 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};