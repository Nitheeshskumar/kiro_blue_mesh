import React, { useState, useEffect } from 'react'
import { CustomizationSelection } from '../../types/customization.types'
import PremiumCard from '../ui/PremiumCard'
import PremiumButton from '../ui/PremiumButton'

interface Simple3DPreviewProps {
  selection: CustomizationSelection
  productType?: 'shirt' | 'pants' | 'dress' | 'hoodie'
  className?: string
}

export const Simple3DPreview: React.FC<Simple3DPreviewProps> = ({
  selection,
  productType = 'shirt',
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'front' | 'back' | 'side'>('front')
  const [isAnimating, setIsAnimating] = useState(false)

  const getColorHex = (colorId: string): string => {
    const colorMap: { [key: string]: string } = {
      'black': '#000000',
      'white': '#ffffff',
      'red': '#ff0000',
      'blue': '#0000ff',
      'green': '#00ff00',
      'yellow': '#ffff00',
      'navy': '#000080',
      'gray': '#808080'
    }
    return colorMap[colorId] || '#ffffff'
  }

  const getProductSVG = () => {
    const color = selection.colorId ? getColorHex(selection.colorId) : '#ffffff'
    const strokeColor = color === '#ffffff' ? '#e5e7eb' : '#374151'

    switch (productType) {
      case 'shirt':
        return (
          <svg viewBox="0 0 200 240" className="w-full h-full">
            {/* Main body */}
            <rect
              x="60" y="80" width="80" height="120"
              fill={color}
              stroke={strokeColor}
              strokeWidth="2"
              rx="8"
            />
            
            {/* Sleeves based on selection */}
            {selection.sleeveId === 'long' && (
              <>
                <rect x="20" y="80" width="40" height="80" fill={color} stroke={strokeColor} strokeWidth="2" rx="20" />
                <rect x="140" y="80" width="40" height="80" fill={color} stroke={strokeColor} strokeWidth="2" rx="20" />
              </>
            )}
            
            {selection.sleeveId === 'short' && (
              <>
                <rect x="30" y="80" width="30" height="40" fill={color} stroke={strokeColor} strokeWidth="2" rx="15" />
                <rect x="140" y="80" width="30" height="40" fill={color} stroke={strokeColor} strokeWidth="2" rx="15" />
              </>
            )}
            
            {selection.sleeveId === 'sleeveless' && (
              <>
                <path d="M60 80 L45 95 L60 110" fill={color} stroke={strokeColor} strokeWidth="2" />
                <path d="M140 80 L155 95 L140 110" fill={color} stroke={strokeColor} strokeWidth="2" />
              </>
            )}
            
            {/* Collar */}
            <ellipse cx="100" cy="80" rx="15" ry="8" fill="none" stroke={strokeColor} strokeWidth="2" />
            
            {/* Custom embroidery indicator */}
            {selection.customOptions?.embroidery && (
              <text x="100" y="140" textAnchor="middle" fontSize="12" fill="#666">
                Custom Text
              </text>
            )}
          </svg>
        )

      case 'hoodie':
        return (
          <svg viewBox="0 0 200 260" className="w-full h-full">
            {/* Main body */}
            <rect
              x="50" y="90" width="100" height="130"
              fill={color}
              stroke={strokeColor}
              strokeWidth="2"
              rx="12"
            />
            
            {/* Hood */}
            <path
              d="M70 90 Q100 60 130 90"
              fill={color}
              stroke={strokeColor}
              strokeWidth="2"
            />
            
            {/* Sleeves */}
            <rect x="15" y="90" width="35" height="90" fill={color} stroke={strokeColor} strokeWidth="2" rx="17" />
            <rect x="150" y="90" width="35" height="90" fill={color} stroke={strokeColor} strokeWidth="2" rx="17" />
            
            {/* Pocket */}
            <rect x="75" y="140" width="50" height="30" fill="none" stroke={strokeColor} strokeWidth="1.5" rx="4" />
          </svg>
        )

      case 'dress':
        return (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            {/* Top part */}
            <rect
              x="60" y="80" width="80" height="60"
              fill={color}
              stroke={strokeColor}
              strokeWidth="2"
              rx="8"
            />
            
            {/* Skirt part */}
            <path
              d="M60 140 L40 280 L160 280 L140 140 Z"
              fill={color}
              stroke={strokeColor}
              strokeWidth="2"
            />
            
            {/* Sleeves based on selection */}
            {selection.sleeveId !== 'sleeveless' && (
              <>
                <rect x="30" y="80" width="30" height="50" fill={color} stroke={strokeColor} strokeWidth="2" rx="15" />
                <rect x="140" y="80" width="30" height="50" fill={color} stroke={strokeColor} strokeWidth="2" rx="15" />
              </>
            )}
          </svg>
        )

      default:
        return (
          <svg viewBox="0 0 200 240" className="w-full h-full">
            <rect
              x="60" y="80" width="80" height="120"
              fill={color}
              stroke={strokeColor}
              strokeWidth="2"
              rx="8"
            />
          </svg>
        )
    }
  }

  const handleViewChange = (view: 'front' | 'back' | 'side') => {
    setIsAnimating(true)
    setTimeout(() => {
      setViewMode(view)
      setIsAnimating(false)
    }, 150)
  }

  return (
    <PremiumCard elevation="medium" className={className}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            {(['front', 'back', 'side'] as const).map((view) => (
              <PremiumButton
                key={view}
                variant={viewMode === view ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleViewChange(view)}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </PremiumButton>
            ))}
          </div>
        </div>
      </div>

      <div className="relative h-80 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div 
          className={`transition-all duration-300 ${
            isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
          }`}
          style={{
            transform: viewMode === 'side' ? 'perspective(400px) rotateY(-30deg)' : 
                      viewMode === 'back' ? 'perspective(400px) rotateY(180deg)' : 'none'
          }}
        >
          <div className="w-48 h-64">
            {getProductSVG()}
          </div>
        </div>

        {/* View indicator */}
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
          {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
        </div>

        {/* Real-time update indicator */}
        {selection.colorId && (
          <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            Live Preview
          </div>
        )}
      </div>

      {/* Customization Summary */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Current Selection</h4>
        <div className="space-y-2">
          {selection.colorId && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Color:</span>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: getColorHex(selection.colorId) }}
                ></div>
                <span className="font-medium capitalize">{selection.colorId}</span>
              </div>
            </div>
          )}
          
          {selection.sizeId && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Size:</span>
              <span className="font-medium uppercase">{selection.sizeId}</span>
            </div>
          )}
          
          {selection.sleeveId && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Sleeves:</span>
              <span className="font-medium capitalize">{selection.sleeveId.replace('-', ' ')}</span>
            </div>
          )}
          
          {selection.customMeasurements && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Fit:</span>
              <span className="font-medium text-forest-600">Custom Measurements</span>
            </div>
          )}
          
          {Object.keys(selection.customOptions).length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Options:</span>
              <span className="font-medium">{Object.keys(selection.customOptions).length} selected</span>
            </div>
          )}
        </div>

        {selection.totalPriceModifier !== 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Price Adjustment:</span>
              <span className={`font-semibold ${
                selection.totalPriceModifier > 0 ? 'text-forest-600' : 'text-green-600'
              }`}>
                {selection.totalPriceModifier > 0 ? '+' : ''}${selection.totalPriceModifier.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </PremiumCard>
  )
}