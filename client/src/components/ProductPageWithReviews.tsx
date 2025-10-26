import React from 'react';
import { ReviewsSection } from './ReviewsSection';

interface ProductPageWithReviewsProps {
  productId: string;
  productName: string;
  // ... other product props
}

// Example component showing how to integrate reviews into a product page
export const ProductPageWithReviews: React.FC<ProductPageWithReviewsProps> = ({
  productId,
  productName
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          {/* Product Images */}
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <span className="text-gray-500">Product Images</span>
          </div>
        </div>
        
        <div>
          {/* Product Info */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{productName}</h1>
          <p className="text-gray-600 mb-6">Product description goes here...</p>
          
          {/* Add to Cart, Customization, etc. */}
          <div className="space-y-4">
            <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
              Customize & Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-gray-200 pt-12">
        <ReviewsSection 
          productId={productId} 
          productName={productName}
        />
      </div>
    </div>
  );
};

export default ProductPageWithReviews;