import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageCircle, Ruler } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useCartStore } from '../stores/cartStore'
import { Product } from '../types'
import { formatPrice, calculateProductPrice, PRICING } from '../constants/pricing'
import ImageCarousel from '../components/ui/ImageCarousel'
import { getProxiedImageUrl } from '../lib/imageUtils'
import { SizingChart } from '../components/SizingChart'
import { filterProductTSizes } from '../utils/sizeUtils'

export const CustomizerPage = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCartStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [embroideryText, setEmbroideryText] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)
  const [showSizingChart, setShowSizingChart] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${productId}`)
        const productData = response.data
        
        // Filter out T sizes for Indian market
        const updatedProductData = filterProductTSizes(productData)
        
        setProduct(updatedProductData)
        setSelectedSize(updatedProductData.sizes[0] || '')
        setSelectedColor(productData.colors[0] || '#000000')
        setTotalPrice(productData.basePrice)
      } catch (error) {
        console.error('Failed to fetch product:', error)
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId, navigate])

  useEffect(() => {
    if (product && selectedSize && selectedColor) {
      generatePreview()
      calculatePrice()
    }
  }, [product, selectedSize, selectedColor, embroideryText])

  const generatePreview = async () => {
    try {
      // Use the actual product image as preview, or generate one if needed
      if (product && product.images.length > 0) {
        setPreviewUrl(getProxiedImageUrl(product.images[0]))
      } else {
        const response = await api.post('/customizations/preview', {
          productId,
          size: selectedSize,
          color: selectedColor,
          embroidery: embroideryText
        })
        setPreviewUrl(response.data.previewUrl)
      }
    } catch (error) {
      console.error('Failed to generate preview:', error)
      // Fallback to product image if available
      if (product && product.images.length > 0) {
        setPreviewUrl(getProxiedImageUrl(product.images[0]))
      }
    }
  }

  const calculatePrice = () => {
    if (!product) return

    const price = calculateProductPrice(
      product.basePrice,
      selectedSize,
      selectedColor,
      product.sizePricing,
      product.colorPricing,
      !!embroideryText.trim(),
      false // No logo option in this component yet
    )
    setTotalPrice(price)
  }

  const handleAddToCart = async () => {
    // Always add to cart first (localStorage)
    const tempCustomizationId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Add to cart regardless of login status
    addItem({
      productId: product!.id,
      productName: product!.name,
      customizationId: tempCustomizationId,
      size: selectedSize,
      color: selectedColor,
      price: totalPrice,
      quantity: 1,
      previewUrl,
      embroidery: embroideryText.trim() || undefined,
      isTemporary: !user // Mark as temporary if user not logged in
    })

    if (!user) {
      // Redirect to login, then to checkout
      navigate('/login?returnTo=/cart&autoCheckout=true')
    } else {
      // Go to cart for logged-in users
      navigate('/cart')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gray-300 aspect-square rounded"></div>
            <div className="space-y-4">
              <div className="bg-gray-300 h-8 rounded"></div>
              <div className="bg-gray-300 h-4 rounded w-2/3"></div>
              <div className="bg-gray-300 h-32 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Preview Section */}
        <div className="space-y-4">
          {/* Product Images Carousel with Customization Info */}
          {product?.images && product.images.length > 0 && (
            <div className="aspect-square relative">
              <ImageCarousel
                images={product.images}
                alt={product.name}
                showDots={product.images.length > 1}
                showArrows={product.images.length > 1}
                autoPlay={false}
                className="w-full h-full"
              />
              
              {/* Customization Overlay */}
              {(selectedSize || selectedColor || embroideryText.trim()) && (
                <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white text-sm p-3 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Your Customization:</span>
                    <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                      Preview
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedSize && (
                      <div>
                        <span className="text-gray-300">Size:</span> <span className="font-medium">{selectedSize}</span>
                      </div>
                    )}
                    
                    {selectedColor && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">Color:</span>
                        {product.colorType === 'fixed' ? (
                          <span className="font-medium">{selectedColor}</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-3 h-3 rounded border border-white"
                              style={{ backgroundColor: selectedColor }}
                            />
                            <span className="font-medium">{selectedColor}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {embroideryText.trim() && (
                    <div className="mt-2 pt-2 border-t border-white border-opacity-20">
                      <span className="text-gray-300">Embroidery:</span> 
                      <span className="font-medium ml-1">"{embroideryText.trim()}"</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Customization Panel */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-2">{product.description}</p>
            <div className="text-2xl font-bold text-primary-600 mt-4">
              ₹{totalPrice.toFixed(2)}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Size
              </label>
              <button
                type="button"
                onClick={() => setShowSizingChart(true)}
                className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
              >
                <Ruler className="w-3 h-3" />
                <span>Size Chart</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 px-3 border rounded-lg font-medium transition-colors ${selectedSize === size
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {product.colorType === 'fixed' ? 'Color/Pattern' : 'Color'}
            </label>
            
            {product.colorType === 'fixed' ? (
              // Fixed colors - show as text/badges
              <div className="space-y-2">
                {product.colors.map(color => (
                  <div
                    key={color}
                    className={`p-3 border-2 rounded-lg transition-all ${selectedColor === color
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{color}</span>
                      <button
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedColor === color
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {selectedColor === color ? 'Selected' : 'Select'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Colors and patterns as shown in product images
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              // Customizable colors - show as color swatches
              <div className="grid grid-cols-6 gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${selectedColor === color
                      ? 'border-primary-600 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Embroidery Customization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Embroidery (Optional)
            </label>
            <input
              type="text"
              value={embroideryText}
              onChange={(e) => setEmbroideryText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter text for embroidery (e.g., Name, Message)"
              maxLength={50}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                {embroideryText.length}/50 characters
              </p>
              {embroideryText.trim() && (
                <p className="text-xs text-primary-600 font-medium">
                  +₹{PRICING.EMBROIDERY_COST.toFixed(0)} for embroidery
                </p>
              )}
            </div>
          </div>

          {/* WhatsApp Order Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Order via WhatsApp:</span> After checkout, you'll be redirected to WhatsApp to confirm your order and receive payment details.
                </p>
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedSize || !selectedColor}
          >
            Add to Cart - {formatPrice(totalPrice)}
          </button>
        </div>
      </div>

      {/* Sizing Chart Modal */}
      <SizingChart
        isOpen={showSizingChart}
        onClose={() => setShowSizingChart(false)}
        availableSizes={product?.sizes || []}
        selectedSizes={selectedSize ? [selectedSize] : []} // Only the currently selected size
      />
    </div>
  )
}