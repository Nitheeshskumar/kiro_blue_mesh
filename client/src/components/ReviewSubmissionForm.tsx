import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import PremiumButton from './ui/PremiumButton';
import PremiumInput from './ui/PremiumInput';
import { SupabaseUploadWidget, UploadedImage, type SupabaseUploadResult } from './SupabaseUploadWidget';
import { ReviewSubmissionData } from '../types/review.types';

interface ReviewSubmissionFormProps {
  productId: string;
  productName: string;
  onSubmit: (reviewData: ReviewSubmissionData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ReviewSubmissionForm: React.FC<ReviewSubmissionFormProps> = ({
  productId,
  productName,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<SupabaseUploadResult[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!title.trim()) {
      newErrors.title = 'Please enter a review title';
    } else if (title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!content.trim()) {
      newErrors.content = 'Please enter your review';
    } else if (content.length < 10) {
      newErrors.content = 'Review must be at least 10 characters';
    } else if (content.length > 2000) {
      newErrors.content = 'Review must be 2000 characters or less';
    }

    if (photos.length > 5) {
      newErrors.photos = 'Maximum 5 photos allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const reviewData: ReviewSubmissionData = {
      productId,
      rating,
      title: title.trim(),
      content: content.trim(),
      photos: photos.map(photo => ({
        storagePath: photo.path,
        publicUrl: photo.publicUrl,
        width: photo.width,
        height: photo.height,
        format: photo.format,
        fileSize: photo.size,
        originalFilename: photo.originalFilename,
        bucketName: photo.bucketName || 'review-photos'
      }))
    };

    try {
      await onSubmit(reviewData);
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({ submit: 'Failed to submit review. Please try again.' });
    }
  };

  const handlePhotoUpload = (results: SupabaseUploadResult[]) => {
    setPhotos(prev => [...prev, ...results].slice(0, 5)); // Limit to 5 photos
    setErrors(prev => ({ ...prev, photos: '' }));
  };

  const handlePhotoRemove = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 transition-colors"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => {
              setRating(star);
              setErrors(prev => ({ ...prev, rating: '' }));
            }}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 && (
            <>
              {rating} star{rating !== 1 ? 's' : ''}
              {rating === 1 && ' - Poor'}
              {rating === 2 && ' - Fair'}
              {rating === 3 && ' - Good'}
              {rating === 4 && ' - Very Good'}
              {rating === 5 && ' - Excellent'}
            </>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">Reviewing: <span className="font-semibold">{productName}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating *
          </label>
          {renderStarRating()}
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <PremiumInput
            label="Review Title *"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors(prev => ({ ...prev, title: '' }));
            }}
            placeholder="Summarize your experience in a few words"
            maxLength={100}
            error={errors.title}
          />
          <p className="mt-1 text-xs text-gray-500">
            {title.length}/100 characters
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setErrors(prev => ({ ...prev, content: '' }));
            }}
            placeholder="Tell others about your experience with this product. What did you like or dislike? How was the quality, fit, and overall satisfaction?"
            rows={6}
            maxLength={2000}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
              errors.content ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {content.length}/2000 characters (minimum 10)
          </p>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos (Optional)
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Share photos of your purchase to help other customers. Maximum 5 photos, 10MB each.
          </p>
          
          <div className="space-y-4">
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {photos.map((photo, index) => (
                  <UploadedImage
                    key={index}
                    image={photo}
                    onRemove={() => handlePhotoRemove(index)}
                    className="aspect-square"
                  />
                ))}
              </div>
            )}
            
            {photos.length < 5 && (
              <SupabaseUploadWidget
                onUpload={handlePhotoUpload}
                onError={(error) => {
                  console.error('Photo upload error:', error);
                  setErrors(prev => ({ ...prev, photos: 'Failed to upload photo. Please try again.' }));
                }}
                maxFiles={5 - photos.length}
                disabled={isSubmitting}
              />
            )}
          </div>
          
          {errors.photos && (
            <p className="mt-1 text-sm text-red-600">{errors.photos}</p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <PremiumButton
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
          </PremiumButton>
          <PremiumButton
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </PremiumButton>
        </div>
      </form>
    </div>
  );
};