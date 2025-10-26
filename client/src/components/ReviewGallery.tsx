import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { ReviewPhoto } from '../types/review.types';
import { getOptimizedImageUrl, getThumbnailUrl } from '../lib/supabaseStorage';

interface ReviewGalleryProps {
  photos: ReviewPhoto[];
  maxDisplay?: number;
  className?: string;
}

export const ReviewGallery: React.FC<ReviewGalleryProps> = ({
  photos,
  maxDisplay = 8,
  className = ''
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<ReviewPhoto | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No customer photos yet</p>
        <p className="text-sm">Be the first to share a photo!</p>
      </div>
    );
  }

  const displayPhotos = photos.slice(0, maxDisplay);
  const remainingCount = photos.length - maxDisplay;

  const openModal = (photo: ReviewPhoto, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + photos.length) % photos.length
      : (currentIndex + 1) % photos.length;
    
    setCurrentIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      navigatePhoto('prev');
    } else if (e.key === 'ArrowRight') {
      navigatePhoto('next');
    } else if (e.key === 'Escape') {
      closeModal();
    }
  };

  return (
    <>
      <div className={className}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Customer Photos ({photos.length})
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {displayPhotos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => openModal(photo, index)}
              className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-green-500 group relative"
            >
              <img
                src={getThumbnailUrl(photo.publicUrl)}
                alt={photo.alt || 'Customer photo'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}

          {remainingCount > 0 && (
            <button
              onClick={() => openModal(photos[maxDisplay], maxDisplay)}
              className="aspect-square rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex flex-col items-center justify-center text-gray-600 hover:text-gray-800"
            >
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-sm font-medium">+{remainingCount}</span>
              <span className="text-xs">more</span>
            </button>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-5xl max-h-full p-4 w-full">
            {/* Navigation */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePhoto('prev');
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors z-10"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePhoto('next');
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors z-10"
                >
                  →
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="flex items-center justify-center h-full">
              <img
                src={getOptimizedImageUrl(selectedPhoto.publicUrl, { width: 1200, height: 800 })}
                alt={selectedPhoto.alt || 'Customer photo'}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Photo Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-75">
                    Photo {currentIndex + 1} of {photos.length}
                  </p>
                  {selectedPhoto.alt && (
                    <p className="text-sm mt-1">{selectedPhoto.alt}</p>
                  )}
                </div>
                <div className="text-right text-sm opacity-75">
                  <p>{selectedPhoto.width} × {selectedPhoto.height}</p>
                  <p>{selectedPhoto.fileSize ? (selectedPhoto.fileSize / 1024 / 1024).toFixed(1) + ' MB' : 'Unknown size'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};