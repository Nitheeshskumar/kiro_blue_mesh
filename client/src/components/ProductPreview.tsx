import { useState } from 'react'
import { Package } from 'lucide-react'

interface ProductPreviewProps {
  productImage?: string
  productName: string
  size: string
  color: string
  embroidery?: string
  className?: string
}

export const ProductPreview = ({ 
  productImage, 
  productName, 
  size, 
  color, 
  embroidery,
  className = "w-full h-full"
}: ProductPreviewProps) => {
  const [imageError, setImageError] = useState(false)

  // Fallback preview with customization info
  const generateFallbackPreview = () => {
    const colorHex = color.replace('#', '')
    const text = `${size} ${productName}${embroidery ? ` "${embroidery}"` : ''}`
    return `https://via.placeholder.com/400x400/${colorHex}/ffffff?text=${encodeURIComponent(text)}`
  }

  if (!productImage || imageError) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg overflow-hidden relative`}>
        <img
          src={generateFallbackPreview()}
          alt={`${productName} preview`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div className="flex items-center justify-between">
            <span>Size: {size}</span>
            <div 
              className="w-4 h-4 rounded border border-white"
              style={{ backgroundColor: color }}
            />
          </div>
          {embroidery && (
            <div className="mt-1 text-center">"{embroidery}"</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} relative rounded-lg overflow-hidden`}>
      <img
        src={productImage}
        alt={`${productName} preview`}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
      
      {/* Customization Overlay */}
      <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
        <div className="flex items-center justify-between">
          <span>Size: {size}</span>
          <div 
            className="w-4 h-4 rounded border border-white"
            style={{ backgroundColor: color }}
            title={`Color: ${color}`}
          />
        </div>
        {embroidery && (
          <div className="mt-1 text-center font-medium">
            Embroidery: "{embroidery}"
          </div>
        )}
      </div>
    </div>
  )
}