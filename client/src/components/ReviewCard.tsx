import React, { useState } from 'react';
import { Star, ThumbsUp, Calendar, CheckCircle, Camera } from 'lucide-react';
import { CustomerReview, ReviewPhoto } from '../types/review.types';
import { getOptimizedImageUrl, getThumbnailUrl } from '../lib/supabaseStorage';

interface ReviewCardProps {
  review: CustomerReview & { photos: ReviewPhoto[] };
  onHelpful?: (reviewId: string) => void;
  className?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onHelpful,
  className = ''
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [helpfulClicked, setHelpfulClicked] = useState(false);

  const handleHelpfulClick = () => {
    if (!helpfulClicked && onHelpful) {
      setHelpfulClicked(true);
      onHelpful(review.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
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
    );
  };

  return (
    <>
      <div className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                {renderStars(review.rating)}
                <span className="text-sm font-medium text-gray-900">
                  {review.rating} out of 5 stars
                </span>
              </div>
              {review.verified && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Verified Purchase</span>
                </div>
              )}
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-1">{review.title}</h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">{review.customerName}</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(review.createdAt)}</span>
              </div>
              {review.photos.length > 0 && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Camera className="w-4 h-4" />
                  <span>{review.photos.length} photo{review.photos.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {review.content}
          </p>
        </div>

        {/* Photos */}
        {review.photos.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {review.photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo.publicUrl)}
                  className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <img
                    src={getThumbnailUrl(photo.publicUrl)}
                    alt={photo.alt || 'Review photo'}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={handleHelpfulClick}
            disabled={helpfulClicked}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
              helpfulClicked
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${helpfulClicked ? 'fill-current' : ''}`} />
            <span>
              {helpfulClicked ? 'Thanks!' : 'Helpful'} 
              {review.helpful > 0 && ` (${review.helpful})`}
            </span>
          </button>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={getOptimizedImageUrl(selectedPhoto, { width: 800, height: 600 })}
              alt="Review photo"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};