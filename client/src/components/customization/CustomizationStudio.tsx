import React, { useState, useEffect } from 'react'
import { CustomizationOptions, CustomizationSelection, EnhancedProduct } from '../../types/customization.types'
import { ColorSelector } from './ColorSelector'
import { SizeSelector } from './SizeSelector'
import { SleeveSelector } from './SleeveSelector'
import PremiumCard from '../ui/PremiumCard'
import PremiumButton from '../ui/PremiumButton'

interface CustomizationStudioProps {
  product: EnhancedProduct
  initialSelection?: Partial<CustomizationSelection>
  onSelectionChange: (selection: CustomizationSelection) => void
  onAddToCart?: (selection: CustomizationSelection) => void
  onMeasurementsClick?: () => void
  className?: string
}

export const CustomizationStudio: React.FC<CustomizationStudioProps> = ({
  product,
  initialSelection,
  onSelectionChange,
  onAddToCart,
  onMeasurementsClick,
  className = ''
}) => {
  const [selection, setSelection] = useState<CustomizationSelection>({
    productId: product.id,
    colorId: initialSelection?.colorId,
    sizeId: initialSelection?.sizeId,
    sleeveId: initialSelection?.sleeveId,
    customMeasurements: initialSelection?.customMeasurements,
    customOptions: initialSelection?.customOptions || {},
    totalPriceModifier: 0
  })

  const customizationOptions = product.customizationOptions

  // Calculate total price modifier whenever selection changes
  useEffect(() => {
    let totalModifier = 0

    if (customizationOptions) {
      // Color price modifier
      if (selection.colorId) {
        const color = customizationOptions.colors.find(c => c.id === selection.colorId)
        if (color) totalModifier += color.priceModifier
      }

      // Size price modifier
      if (selection.sizeId) {
        const size = customizationOptions.sizes.find(s => s.id === selection.sizeId)
        if (size) totalModifier += size.priceModifier
      }

      // Sleeve price modifier
      if (selection.sleeveId) {
        const sleeve = customizationOptions.sleeves.find(s => s.id === selection.sleeveId)
        if (sleeve) totalModifier += sleeve.priceModifier
      }

      // Custom options price modifiers
      Object.entries(selection.customOptions).forEach(([optionId, value]) => {
        if (value) {
          const option = customizationOptions.customOptions.find(o => o.id === optionId)
          if (option) totalModifier += option.priceModifier
        }
      })
    }

    const updatedSelection = { ...selection, totalPriceModifier: totalModifier }
    setSelection(updatedSelection)
    onSelectionChange(updatedSelection)
  }, [selection.colorId, selection.sizeId, selection.sleeveId, selection.customOptions, customizationOptions, onSelectionChange])

  const handleColorSelect = (colorId: string) => {
    setSelection(prev => ({ ...prev, colorId }))
  }

  const handleSizeSelect = (sizeId: string) => {
    setSelection(prev => ({ ...prev, sizeId }))
  }

  const handleSleeveSelect = (sleeveId: string) => {
    setSelection(prev => ({ ...prev, sleeveId }))
  }

  const handleCustomOptionChange = (optionId: string, value: any) => {
    setSelection(prev => ({
      ...prev,
      customOptions: { ...prev.customOptions, [optionId]: value }
    }))
  }

  const isSelectionComplete = () => {
    if (!customizationOptions) return false
    
    // Check required selections
    const hasColor = !customizationOptions.colors.length || selection.colorId
    const hasSize = !customizationOptions.sizes.length || selection.sizeId
    const hasSleeve = !customizationOptions.sleeves.length || selection.sleeveId
    
    // Check required custom options
    const requiredOptions = customizationOptions.customOptions.filter(opt => opt.required)
    const hasRequiredOptions = requiredOptions.every(opt => 
      selection.customOptions[opt.id] !== undefined && selection.customOptions[opt.id] !== ''
    )

    return hasColor && hasSize && hasSleeve && hasRequiredOptions
  }

  const totalPrice = product.basePrice + selection.totalPriceModifier

  if (!customizationOptions) {
    return (
      <PremiumCard elevation="low" className={`p-6 ${className}`}>
        <p className="text-gray-600">Customization options not available for this product.</p>
      </PremiumCard>
    )
  }

  return (
    <div className={`space-y-4 md:space-y-6 ${className}`}>
      {/* Color Selection */}
      {customizationOptions.colors.length > 0 && (
        <ColorSelector
          colors={customizationOptions.colors}
          selectedColorId={selection.colorId}
          onColorSelect={handleColorSelect}
        />
      )}

      {/* Size Selection */}
      {customizationOptions.sizes.length > 0 && (
        <SizeSelector
          sizes={customizationOptions.sizes}
          selectedSizeId={selection.sizeId}
          onSizeSelect={handleSizeSelect}
          onCustomMeasurementsClick={onMeasurementsClick}
        />
      )}

      {/* Sleeve Selection */}
      {customizationOptions.sleeves.length > 0 && (
        <SleeveSelector
          sleeves={customizationOptions.sleeves}
          selectedSleeveId={selection.sleeveId}
          onSleeveSelect={handleSleeveSelect}
        />
      )}

      {/* Custom Options */}
      {customizationOptions.customOptions.length > 0 && (
        <PremiumCard elevation="low" className="p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h3>
          <div className="space-y-3 md:space-y-4">
            {customizationOptions.customOptions.map((option) => (
              <div key={option.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <label className="flex items-start sm:items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!selection.customOptions[option.id]}
                      onChange={(e) => handleCustomOptionChange(option.id, e.target.checked)}
                      className="w-5 h-5 mt-0.5 sm:mt-0 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{option.name}</span>
                      {option.required && <span className="text-red-500 ml-1">*</span>}
                      {option.description && (
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      )}
                    </div>
                  </label>
                </div>
                {option.priceModifier > 0 && (
                  <span className="text-primary-600 font-semibold text-sm sm:text-base ml-8 sm:ml-0">
                    +₹{option.priceModifier}
                  </span>
                )}
              </div>
            ))}
          </div>
        </PremiumCard>
      )}

      {/* Price Summary */}
      <PremiumCard elevation="medium" className="p-4 md:p-6 bg-gradient-to-r from-primary-50 to-secondary-50 sticky bottom-4 md:static">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Price Summary</h3>
          <div className="text-left sm:text-right">
            <div className="text-xl md:text-2xl font-bold text-primary-700">₹{totalPrice.toFixed(2)}</div>
            {selection.totalPriceModifier !== 0 && (
              <div className="text-sm text-gray-600">
                Base: ₹{product.basePrice.toFixed(2)} 
                {selection.totalPriceModifier > 0 ? ' + ' : ' - '}
                ₹{Math.abs(selection.totalPriceModifier).toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {onAddToCart && (
          <PremiumButton
            variant="primary"
            size="lg"
            onClick={() => onAddToCart(selection)}
            disabled={!isSelectionComplete()}
            className="w-full touch-manipulation"
          >
            {isSelectionComplete() ? 'Add to Cart' : 'Complete Selection'}
          </PremiumButton>
        )}

        {!isSelectionComplete() && (
          <p className="text-sm text-gray-600 mt-2 text-center">
            Please complete all required selections to continue
          </p>
        )}
      </PremiumCard>
    </div>
  )
}