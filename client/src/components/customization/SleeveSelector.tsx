import React from 'react'
import { SleeveOption } from '../../types/customization.types'
import PremiumCard from '../ui/PremiumCard'

interface SleeveSelectorProps {
  sleeves: SleeveOption[]
  selectedSleeveId?: string
  onSleeveSelect: (sleeveId: string) => void
  className?: string
}

export const SleeveSelector: React.FC<SleeveSelectorProps> = ({
  sleeves,
  selectedSleeveId,
  onSleeveSelect,
  className = ''
}) => {
  const getSleeveIcon = (category: SleeveOption['category']) => {
    switch (category) {
      case 'sleeveless':
        return '👕' // Tank top icon
      case 'short':
        return '👔' // Short sleeve icon
      case 'three-quarter':
        return '🧥' // 3/4 sleeve icon
      case 'long':
        return '🧤' // Long sleeve icon
      default:
        return '👕'
    }
  }

  return (
    <PremiumCard elevation="low" className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleeve Length</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sleeves.map((sleeve) => (
          <button
            key={sleeve.id}
            onClick={() => sleeve.available && onSleeveSelect(sleeve.id)}
            disabled={!sleeve.available}
            className={`
              relative p-4 border rounded-lg transition-all duration-200 text-left
              ${selectedSleeveId === sleeve.id
                ? 'border-forest-600 bg-forest-50 ring-2 ring-forest-200'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
              ${!sleeve.available ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
            `}
          >
            <div className="flex flex-col items-center text-center">
              {/* Visual representation */}
              <div className="text-3xl mb-2">{getSleeveIcon(sleeve.category)}</div>
              
              {/* Sleeve name */}
              <div className="font-medium text-gray-900 mb-1">{sleeve.name}</div>
              
              {/* Description */}
              <div className="text-sm text-gray-600 mb-2">{sleeve.description}</div>
              
              {/* Price modifier */}
              {sleeve.priceModifier !== 0 && (
                <div className={`text-sm font-semibold ${
                  sleeve.priceModifier > 0 ? 'text-forest-600' : 'text-green-600'
                }`}>
                  {sleeve.priceModifier > 0 ? '+' : ''}${sleeve.priceModifier}
                </div>
              )}
              
              {/* Selected indicator */}
              {selectedSleeveId === sleeve.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-forest-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Unavailable indicator */}
              {!sleeve.available && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg">
                  <span className="text-sm font-medium text-gray-500">Unavailable</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Selected sleeve summary */}
      {selectedSleeveId && (
        <div className="mt-4 p-3 bg-forest-50 rounded-lg">
          {(() => {
            const selectedSleeve = sleeves.find(s => s.id === selectedSleeveId)
            return selectedSleeve ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getSleeveIcon(selectedSleeve.category)}</span>
                  <div>
                    <span className="font-medium text-gray-900">{selectedSleeve.name}</span>
                    <p className="text-sm text-gray-600">{selectedSleeve.description}</p>
                  </div>
                </div>
                {selectedSleeve.priceModifier !== 0 && (
                  <span className={`font-semibold ${
                    selectedSleeve.priceModifier > 0 ? 'text-forest-600' : 'text-green-600'
                  }`}>
                    {selectedSleeve.priceModifier > 0 ? '+' : ''}${selectedSleeve.priceModifier}
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