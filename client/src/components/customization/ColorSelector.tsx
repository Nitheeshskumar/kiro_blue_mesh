import React from 'react'
import { ColorOption } from '../../types/customization.types'
import PremiumCard from '../ui/PremiumCard'

interface ColorSelectorProps {
  colors: ColorOption[]
  selectedColorId?: string
  onColorSelect: (colorId: string) => void
  className?: string
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColorId,
  onColorSelect,
  className = ''
}) => {
  return (
    <PremiumCard elevation="low" className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Color</h3>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {colors.map((color) => (
          <div key={color.id} className="flex flex-col items-center">
            <button
              onClick={() => color.available && onColorSelect(color.id)}
              disabled={!color.available}
              className={`
                relative w-12 h-12 rounded-full border-2 transition-all duration-200
                ${selectedColorId === color.id 
                  ? 'border-forest-600 ring-2 ring-forest-200 scale-110' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${!color.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
              `}
              style={{ backgroundColor: color.hexCode }}
              title={`${color.name}${color.priceModifier > 0 ? ` (+$${color.priceModifier})` : ''}`}
            >
              {selectedColorId === color.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                </div>
              )}
              {!color.available && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
                </div>
              )}
            </button>
            
            <div className="mt-2 text-center">
              <p className="text-xs font-medium text-gray-700">{color.name}</p>
              {color.priceModifier > 0 && (
                <p className="text-xs text-forest-600">+${color.priceModifier}</p>
              )}
              {color.priceModifier < 0 && (
                <p className="text-xs text-green-600">${color.priceModifier}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedColorId && (
        <div className="mt-4 p-3 bg-forest-50 rounded-lg">
          {(() => {
            const selectedColor = colors.find(c => c.id === selectedColorId)
            return selectedColor ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: selectedColor.hexCode }}
                  ></div>
                  <span className="font-medium text-gray-900">{selectedColor.name}</span>
                </div>
                {selectedColor.priceModifier !== 0 && (
                  <span className={`font-semibold ${selectedColor.priceModifier > 0 ? 'text-forest-600' : 'text-green-600'}`}>
                    {selectedColor.priceModifier > 0 ? '+' : ''}${selectedColor.priceModifier}
                  </span>
                )}
              </div>
            ) : null
          })()}
        </div>
      )}
    </PremiumCard>
  )
}