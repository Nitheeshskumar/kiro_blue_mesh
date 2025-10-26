import React, { useState, useEffect } from 'react'
import { ProductCategory } from '../types'
import { useFilterStore } from '../stores/filterStore'
import { PRODUCT_CATEGORIES } from '../data/categories'
import PremiumCard from './ui/PremiumCard'
import PremiumButton from './ui/PremiumButton'

interface CategoryFilterProps {
  categories?: ProductCategory[]
  onCategoryChange?: (selectedCategories: string[]) => void
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories = PRODUCT_CATEGORIES,
  onCategoryChange
}) => {
  const { selectedCategories, toggleCategory, clearFilters, hasActiveFilters } = useFilterStore()
  const [categoriesWithCounts, setCategoriesWithCounts] = useState<ProductCategory[]>(categories)

  // Update categories with product counts
  useEffect(() => {
    // In a real app, this would fetch from API
    // For now, we'll use the provided categories or default ones
    setCategoriesWithCounts(categories)
  }, [categories])

  // Notify parent component of changes
  useEffect(() => {
    if (onCategoryChange) {
      onCategoryChange(selectedCategories)
    }
  }, [selectedCategories, onCategoryChange])

  const handleCategoryToggle = (categoryId: string) => {
    toggleCategory(categoryId)
  }

  const handleClearFilters = () => {
    clearFilters()
  }

  return (
    <PremiumCard elevation="low" padding="md" className="w-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Filter by Category
          </h3>
          {hasActiveFilters() && (
            <PremiumButton
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-sm"
            >
              Clear All
            </PremiumButton>
          )}
        </div>

        {/* Category List */}
        <div className="space-y-2">
          {categoriesWithCounts.map((category) => {
            const isSelected = selectedCategories.includes(category.id)
            
            return (
              <label
                key={category.id}
                className={`
                  flex items-start sm:items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 touch-manipulation
                  ${isSelected 
                    ? 'bg-primary-50 border-2 border-primary-200' 
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 active:bg-gray-200'
                  }
                `}
              >
                <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-5 h-5 mt-0.5 sm:mt-0 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  
                  <div className="flex items-start sm:items-center space-x-2 flex-1 min-w-0">
                    <span className="text-lg sm:text-xl flex-shrink-0">{category.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm sm:text-base ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                        {category.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                        {category.description}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Count */}
                <div className={`
                  px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2
                  ${isSelected 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {category.productCount}
                </div>
              </label>
            )
          })}
        </div>

        {/* Selected Categories Summary */}
        {selectedCategories.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-2">
              Selected ({selectedCategories.length}):
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((categoryId) => {
                const category = categoriesWithCounts.find(c => c.id === categoryId)
                if (!category) return null
                
                return (
                  <span
                    key={categoryId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.name}
                    <button
                      onClick={() => handleCategoryToggle(categoryId)}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </PremiumCard>
  )
}