import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Product } from '../types'
import { EnhancedProductCatalog } from '../components/EnhancedProductCatalog'

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate()

  const handleProductSelect = (product: Product) => {
    // Navigate to product page
    navigate(`/products/${product.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnhancedProductCatalog onProductSelect={handleProductSelect} />
      </div>
    </div>
  )
}