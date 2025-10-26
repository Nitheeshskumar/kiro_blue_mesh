import React, { useState, useEffect } from 'react'
import { Product, ProductCategory } from '../types'
import { CategoryFilter } from './CategoryFilter'
import { ProductGrid } from './ProductGrid'
import { useFilterStore } from '../stores/filterStore'
import { productApi } from '../lib/api'
import PremiumButton from './ui/PremiumButton'
import PremiumInput from './ui/PremiumInput'

interface EnhancedProductCatalogProps {
  onProductSelect?: (product: Product) => void
}

export const EnhancedProductCatalog: React.FC<EnhancedProductCatalogProps> = ({
  onProductSelect
}) => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { 
    selectedCategories, 
    searchTerm, 
    sortBy, 
    setSearchTerm, 
    setSortBy,
    hasActiveFilters,
    clearFilters
  } = useFilterStore()

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await productApi.getCategories()
        setCategories(categoriesData)
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        setError('Failed to load categories')
      }
    }

    fetchCategories()
  }, [])

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const filters: any = {}
        
        if (selectedCategories.length > 0) {
          filters.categories = selectedCategories
        }
        
        if (searchTerm.trim()) {
          filters.search = searchTerm.trim()
        }

        const productsData = await productApi.getProducts(filters)
        
        // Apply client-side sorting
        let sortedProducts = [...productsData]
        switch (sortBy) {
          case 'price-low':
            sortedProducts.sort((a, b) => a.basePrice - b.basePrice)
            break
          case 'price-high':
            sortedProducts.sort((a, b) => b.basePrice - a.basePrice)
            break
          case 'newest':
          default:
            // Already sorted by createdAt DESC from API
            break
        }
        
        setProducts(sortedProducts)
      } catch (err) {
        console.error('Failed to fetch products:', err)
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategories, searchTerm, sortBy])

  const handleProductClick = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product)
    }
  }

  const handleClearFilters = () => {
    clearFilters()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">
            Product Catalog
          </h1>
          <p className="text-gray-600 mt-1">
            Discover our premium collection of customizable clothing
          </p>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full">
          <div className="flex-1 lg:w-64">
            <PremiumInput
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Filters and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <CategoryFilter 
              categories={categories}
              onCategoryChange={() => {}} // Handled by store
            />
            
            {hasActiveFilters() && (
              <div className="text-center">
                <PremiumButton
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Clear All Filters
                </PremiumButton>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">{error}</div>
              <PremiumButton
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </PremiumButton>
            </div>
          ) : (
            <>
              {/* Results Header */}
              {!loading && (
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-600">
                    {products.length} {products.length === 1 ? 'product' : 'products'} found
                    {hasActiveFilters() && ' with current filters'}
                  </div>
                </div>
              )}

              {/* Product Grid */}
              <ProductGrid
                products={products}
                loading={loading}
                onProductClick={handleProductClick}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}