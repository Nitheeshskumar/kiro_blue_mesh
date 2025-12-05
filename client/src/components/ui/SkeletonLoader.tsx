import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = false
}) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${width} ${height} ${
        rounded ? 'rounded-full' : 'rounded'
      } ${className}`}
      style={{
        animation: 'shimmer 2s infinite linear'
      }}
    />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <Skeleton height="h-48" rounded={false} />
      <div className="space-y-2">
        <Skeleton height="h-5" width="w-3/4" />
        <Skeleton height="h-4" width="w-1/2" />
        <Skeleton height="h-6" width="w-1/3" />
      </div>
    </div>
  );
};

// Review Card Skeleton
export const ReviewCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
      <div className="flex items-center space-x-3">
        <Skeleton width="w-10" height="h-10" rounded={true} />
        <div className="space-y-2 flex-1">
          <Skeleton height="h-4" width="w-1/3" />
          <Skeleton height="h-3" width="w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton height="h-4" width="w-full" />
        <Skeleton height="h-4" width="w-5/6" />
        <Skeleton height="h-4" width="w-3/4" />
      </div>
      <div className="flex space-x-2">
        <Skeleton width="w-16" height="h-16" rounded={false} />
        <Skeleton width="w-16" height="h-16" rounded={false} />
        <Skeleton width="w-16" height="h-16" rounded={false} />
      </div>
    </div>
  );
};

// Page Content Skeleton
export const PageSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-4">
        <Skeleton height="h-8" width="w-1/3" />
        <Skeleton height="h-4" width="w-2/3" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

// Loading Overlay
export const LoadingOverlay: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
};