import React from 'react'
import { Product } from '../types'
import PremiumCard from './ui/PremiumCard'
import PremiumButton from './ui/PremiumButton'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  onProductClick?: (product: Product) => void
  className?: string
}

interface ProductCardProps {
  product: Product
  onClick?: (product: Product) => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(product)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  return (
    <PremiumCard 
      elevation="low" 
      hover={true}
      padding="sm"
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="space-y-3">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
              {product.category}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex space-x-1">
              <button className="p-1.5 bg-white/90 rounded-full text-gray-600 hover:text-primary-600 backdrop-blur-sm transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="p-1.5 bg-white/90 rounded-full text-gray-600 hover:text-primary-600 backdrop-blur-sm transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-2">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {product.description}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.basePrice)}
              </span>
              <span className="text-sm text-gray-500 ml-1">starting at</span>
            </div>
          </div>

          {/* Available Options */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-3">
              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span>{product.colors.length}</span>
                  <span>colors</span>
                </div>
              )}
              {product.sizes && product.sizes.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span>{product.sizes.length}</span>
                  <span>sizes</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <PremiumButton
            variant="primary"
            size="sm"
            className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
          >
            Customize Now
          </PremiumButton>
        </div>
      </div>
    </PremiumCard>
  )
}

const ProductGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  onProductClick,
  className = ''
}) => {
  if (loading) {
    return <ProductGridSkeleton />
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
        <PremiumButton variant="outline" size="md">
          Clear Filters
        </PremiumButton>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={onProductClick}
        />
      ))}
    </div>
  )
}