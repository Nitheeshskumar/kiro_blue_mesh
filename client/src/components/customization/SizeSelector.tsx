import React from 'react'
import { SizeOption } from '../../types/customization.types'
import PremiumCard from '../ui/PremiumCard'
import PremiumButton from '../ui/PremiumButton'

interface SizeSelectorProps {
  sizes: SizeOption[]
  selectedSizeId?: string
  onSizeSelect: (sizeId: string) => void
  onCustomMeasurementsClick?: () => void
  className?: string
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSizeId,
  onSizeSelect,
  onCustomMeasurementsClick,
  className = ''
}) => {
  const standardSizes = sizes.filter(size => size.category === 'standard')
  const customSizes = sizes.filter(size => size.category === 'custom')

  return (
    <PremiumCard elevation="low" className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Size</h3>
      
      {/* Standard Sizes */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Standard Sizes</h4>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {standardSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => size.available && onSizeSelect(size.id)}
              disabled={!size.available}
              className={`
                px-4 py-3 border rounded-lg text-sm font-medium transition-all duration-200
                ${selectedSizeId === size.id
                  ? 'border-forest-600 bg-forest-50 text-forest-700 ring-2 ring-forest-200'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }
                ${!size.available ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
              `}
              title={size.priceModifier > 0 ? `+$${size.priceModifier}` : ''}
            >
              <div className="text-center">
                <div className="font-semibold">{size.name}</div>
                {size.priceModifier > 0 && (
                  <div className="text-xs text-forest-600 mt-1">+${size.priceModifier}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Measurements Option */}
      {customSizes.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Fit</h4>
          <div className="space-y-2">
            {customSizes.map((size) => (
              <div key={size.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <button
                    onClick={() => size.available && onSizeSelect(size.id)}
                    disabled={!size.available}
                    className={`
                      w-full px-4 py-3 border rounded-lg text-left transition-all duration-200
                      ${selectedSizeId === size.id
                        ? 'border-forest-600 bg-forest-50 text-forest-700 ring-2 ring-forest-200'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                      }
                      ${!size.available ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{size.name}</div>
                        <div className="text-sm text-gray-500">Perfect fit guaranteed</div>
                      </div>
                      {size.priceModifier > 0 && (
                        <div className="text-forest-600 font-semibold">+${size.priceModifier}</div>
                      )}
                    </div>
                  </button>
                </div>
                
                {selectedSizeId === size.id && onCustomMeasurementsClick && (
                  <div className="ml-3">
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      onClick={onCustomMeasurementsClick}
                    >
                      Enter Measurements
                    </PremiumButton>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Link */}
      <div className="mt-4 pt-4 border-t">
        <button className="text-sm text-forest-600 hover:text-forest-700 underline">
          View Size Guide
        </button>
      </div>

      {/* Selected Size Summary */}
      {selectedSizeId && (
        <div className="mt-4 p-3 bg-forest-50 rounded-lg">
          {(() => {
            const selectedSize = sizes.find(s => s.id === selectedSizeId)
            return selectedSize ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">{selectedSize.name}</span>
                  {selectedSize.category === 'custom' && (
                    <span className="ml-2 text-sm text-gray-600">(Custom Fit)</span>
                  )}
                </div>
                {selectedSize.priceModifier > 0 && (
                  <span className="font-semibold text-forest-600">+${selectedSize.priceModifier}</span>
                )}
              </div>
            ) : null
          })()}
        </div>
      )}
    </PremiumCard>
  )
}